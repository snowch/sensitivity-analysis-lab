// Copyright © 2026 Christopher Snow. Real course execution and actual worker update protocol.
const { chromium, expect } = require("playwright/test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs/promises"),
  path = require("node:path"),
  os = require("node:os"),
  { createServer } = require("node:http");
const options = {
  headless: true,
  executablePath:
    process.env.CHROMIUM ||
    (require("node:fs").existsSync("/usr/bin/chromium")
      ? "/usr/bin/chromium"
      : chromium.executablePath()),
  viewport: { width: 390, height: 950 },
  acceptDownloads: true,
};
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".png": "image/png",
};
function serve(resolveFile, intercept = async () => false) {
  const server = createServer(async (req, res) => {
    try {
      if (await intercept(req, res)) return;
      const file = resolveFile(new URL(req.url, "http://local")),
        body = await fs.readFile(file);
      res.writeHead(200, {
        "Content-Type": mime[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
        "Content-Length": body.length,
      });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return {
    server,
    async start() {
      await new Promise((r) => server.listen(0, "127.0.0.1", r));
      return (
        "http://127.0.0.1:" +
        server.address().port +
        "/sensitivity-analysis-lab/"
      );
    },
    async stop() {
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    },
  };
}
function relative(url) {
  let name = url.pathname.replace(/^\/sensitivity-analysis-lab\//, "");
  if (name.startsWith("/") || name.includes("..")) throw Error();
  return name || "index.html";
}
async function saveAndReload(page) {
  await page.evaluate(async () => {
    const script = document.querySelector(
      'script[src*="/assets/offline.mjs"]',
    ).src;
    await (
      await import(new URL("./experiment-state.mjs", script))
    ).saveReadingState();
  });
  await page.reload();
}
async function coldCourse() {
  const profile = await fs.mkdtemp(
      path.join(os.tmpdir(), "sensitivity-offline-"),
    ),
    errors = [],
    outside = [];
  const host = serve((url) => path.join(path.resolve("_site"), relative(url))),
    base = await host.start();
  let context,
    online = true;
  async function open() {
    context = await chromium.launchPersistentContext(profile, options);
    const p = await context.newPage();
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("request", (r) => {
      if (/^https?:/.test(r.url()) && !r.url().startsWith(base))
        outside.push(r.url());
    });
    return p;
  }
  try {
    let p = await open();
    await p.goto(base);
    for (const width of [320, 390, 820, 1440])
      for (const theme of ["light", "dark"]) {
        await p.setViewportSize({ width, height: 950 });
        if ((await p.locator("html").getAttribute("data-theme")) !== theme)
          await p.locator(".theme-toggle").click();
        assert.equal(
          await p.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
          "No horizontal page overflow",
        );
        await p.locator("#app-status-open").click();
        await expect(p.locator("#app-status-dialog")).toBeVisible();
        await fs.mkdir(".artifacts", { recursive: true });
        await p.screenshot({
          path: path.join(".artifacts", `status-${width}-${theme}.png`),
        });
        assert.match(
          await p
            .locator("#app-status-dialog")
            .evaluate((n) => getComputedStyle(n, "::backdrop").backgroundColor),
          /rgba?\(/,
        );
        await p.keyboard.press("Escape");
        await expect(p.locator("#app-status-dialog")).toBeHidden();
        await expect(p.locator("#app-status-open")).toBeFocused();
      }
    await p.locator("#app-status-open").click();
    await expect(p.locator("#download-update")).toHaveText(
      "Save offline copy",
      { timeout: 30000 },
    );
    await p.locator("#download-update").click();
    await expect(p.locator("#offline-status")).toContainText(
      "Downloaded and ready to use offline",
      { timeout: 60000 },
    );
    await expect(p.locator("#app-status-open [data-badge='saved']")).toBeVisible();
    await expect(p.locator("#app-status-open")).toHaveAccessibleDescription(/Downloaded and ready to use offline/);
    await context.close();
    context = null;
    await host.stop();
    online = false;
    p = await open();
    await context.setOffline(true);
    await p.goto(base + "local.html");
    await expect(p.locator("#investigation button[type=submit]")).toBeEnabled();
    await p.getByText("Write down your prediction", { exact: true }).click();
    await p
      .locator("#prediction")
      .fill("A larger rate should increase the cost.");
    await p.locator("#investigation button[type=submit]").click();
    await expect(p.locator("#investigation-status")).toHaveText("Run 1 ready.");
    await expect(p.locator("#investigation-output")).toContainText("12");
    await p.locator("#rate").fill("3");
    await p.locator("#investigation button[type=submit]").click();
    await expect(p.locator("#investigation-status")).toHaveText("Run 2 ready.");
    const genuine = await p.locator("#investigation-output").innerText();
    await p
      .locator("#prediction")
      .evaluate((n) => (n.closest("details").open = true));
    await saveAndReload(p);
    await expect(p.locator("#prediction")).toHaveValue(
      "A larger rate should increase the cost.",
    );
    await expect(p.locator("#rate")).toHaveValue("3");
    await expect
      .poll(() => p.locator("#investigation-output").innerText())
      .toBe(genuine);
    await expect(p.locator("#investigation-status")).toContainText(
      "Saved result from Run 2",
    );
    await p.locator("#investigation button[type=submit]").click();
    await expect(p.locator("#investigation-status")).toHaveText("Run 3 ready.");
    const csv = p.waitForEvent("download");
    await p.locator("#export-results").click();
    const csvText = await fs.readFile(await (await csv).path(), "utf8");
    assert.match(csvText, /Settings/);
    assert.match(csvText, /"3"/);
    // Unvisited generated lessons and legacy experiments must start their real workers offline.
    const { route } = await import("../course/manifest.mjs");
    for (const [id] of route) {
      if (id === "local") continue;
      await p.goto(base + id + ".html");
      const form = p.locator("#investigation");
      if (await form.count()) {
        await expect(form.locator("button[type=submit]")).toBeEnabled();
        await form.locator("button[type=submit]").click();
        await expect(p.locator("#investigation-status")).toHaveText(
          "Run 1 ready.",
          { timeout: 90000 },
        );
        await expect(
          p.locator("#investigation-output table").first(),
        ).toBeVisible();
      } else {
        if (id === "practice") await p.locator("#method").selectOption("rank");
        const button = p.locator("form.controls button:not([type])");
        await expect(button).toBeEnabled();
        await button.click();
        await expect(p.locator("form.controls .status").first()).toHaveText(
          "Results ready.",
          { timeout: 90000 },
        );
      }
      console.log("Offline experiment passed:", id);
    }
    await p.goto(base + "rank.html");
    await p.locator("#screen-form button:not([type])").click();
    await expect(p.locator("#screen-form .status")).toHaveText(
      "Results ready.",
    );
    await p
      .locator("#screen-form summary")
      .filter({ hasText: "Simulation settings" })
      .click();
    await p.getByLabel("Random seed", { exact: true }).fill("19");
    await p.locator("#screen-form button:not([type])").click();
    await expect(p.locator("#screen-form .status")).toHaveText(
      "Results ready.",
    );
    const legacyOutput = await p.locator("#screen-results .output").innerHTML();
    await saveAndReload(p);
    await expect(p.getByLabel("Random seed", { exact: true })).toHaveValue(
      "19",
    );
    assert.equal(
      await p.locator("#screen-results .output").innerHTML(),
      legacyOutput,
    );
    await p.getByLabel("Random seed", { exact: true }).fill("23");
    await p.locator("#screen-form button:not([type])").click();
    await expect(p.locator("#screen-form .status")).toHaveText(
      "Results ready.",
    );
    await expect(p.locator("#screen-results .output")).toContainText("19");
    await expect(p.locator("#screen-results .output")).toContainText("23");
    await p.goto(base + "capstone.html");
    await p.locator("#report").fill("My saved recommendation");
    await p.locator("#investigation button[type=submit]").click();
    await expect(p.locator("#investigation-status")).toHaveText(
      "Run 2 ready.",
      { timeout: 90000 },
    );
    const report = p.waitForEvent("download");
    await p.locator("#download-report").click();
    assert.match(
      await fs.readFile(await (await report).path(), "utf8"),
      /My saved recommendation/,
    );
    await p.locator("#app-status-open").click();
    await p.locator("#app-status-details").evaluate((n) => (n.open = true));
    await p.locator("#remove-offline").click();
    await p.locator("#cancel-remove").click();
    await expect(p.locator("#offline-status")).toContainText(
      "Downloaded and ready to use offline",
    );
    await p.locator("#remove-offline").click();
    await p.locator("#confirm-remove").click();
    await expect(p.locator("#app-status-error")).toContainText("kept");
    await p.keyboard.press("Escape");
    await expect(p.locator("#report")).toHaveValue("My saved recommendation");
    assert.match(
      await p.evaluate(() =>
        localStorage.getItem("sensitivity-analysis-lab:capstone:report"),
      ),
      /My saved recommendation/,
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(outside, []);
    console.log(
      "PASS complete course saved before running, closed browser/server, all 23 genuine experiments offline, original+edited results, restored generated/legacy histories, offline CSV/report exports, safe removal, 4 widths × 2 themes and keyboard modal handling.",
    );
  } finally {
    await context?.close();
    if (online) await host.stop();
    await fs.rm(profile, { recursive: true, force: true });
  }
}
async function updates() {
  const { buildOffline } = await import("../scripts/offline.mjs"),
    directory = await fs.mkdtemp(
      path.join(os.tmpdir(), "sensitivity-updates-"),
    ),
    roots = {},
    releases = {};
  let phase = "a",
    slow = true,
    slowStarted = false,
    releaseSlow,
    failUpdate = false,
    outage = false;
  for (const version of ["a", "b"]) {
    const root = (roots[version] = path.join(directory, version));
    await fs.mkdir(path.join(root, "assets"), { recursive: true });
    for (const file of [
      "offline.mjs", "header-controls.mjs", "header-controls.LICENSE.txt",
      "release-contract.mjs",
      "release-metadata.mjs",
      "experiment-state.mjs",
      "runtime-recovery.mjs",
      "app-status.css",
      "runtime-recovery.css",
    ])
      await fs.copyFile("assets/" + file, path.join(root, "assets", file));
    await fs.writeFile(
      path.join(root, "index.html"),
      '<html><head><link rel="stylesheet" href="assets/app-status.css"><script type="module" src="assets/fixture.mjs"></script></head><body><header><!-- app-status-control --></header><main><textarea id="source">starter</textarea><pre id="output">recorded fixture output</pre><details id="notes"><summary>Notes</summary>Reading</details></main></body></html>',
    );
    await fs.writeFile(
      path.join(root, "assets/fixture.mjs"),
      `import{registerReading}from'./experiment-state.mjs';document.body.dataset.version='${version}';window.veto=false;registerReading('fixture',{isBusy:()=>window.veto,save:()=>({output:document.querySelector('#output').textContent}),restore:value=>document.querySelector('#output').textContent=value.output});`,
    );
    await fs.writeFile(
      path.join(root, "assets/transfer-fixture.txt"),
      ("verified transfer fixture " + version).repeat(64),
    );
    releases[version] = await buildOffline(root);
  }
  const host = serve(
      (url) => {
        const name = relative(url),
          pin = name.match(/^releases\/([a-f0-9]{64})\//);
        const version = pin
          ? Object.keys(releases).find((v) => releases[v].id === pin[1])
          : phase;
        return path.join(roots[version], name);
      },
      async (req, res) => {
        const name = relative(new URL(req.url, "http://local"));
        if (outage) {
          res.writeHead(503).end("Fixture server disconnected");
          return true;
        }
        if (!name.endsWith("assets/transfer-fixture.txt")) return false;
        if (failUpdate && name.includes(releases.b.id)) {
          res.writeHead(503).end("Temporary fixture failure");
          return true;
        }
        if (slow && name.includes(releases.a.id)) {
          slowStarted = true;
          const body = await fs.readFile(
            path.join(roots.a, "assets/transfer-fixture.txt"),
          );
          res.writeHead(200, { "Content-Length": body.length });
          res.write(body.subarray(0, 10));
          await new Promise((resolve) => (releaseSlow = resolve));
          if (!res.destroyed) res.end(body.subarray(10));
          return true;
        }
        return false;
      },
    ),
    base = await host.start(),
    browser = await chromium.launch(options),
    context = await browser.newContext();
  try {
    const p = await context.newPage();
    await p.goto(base + "#one");
    await p.locator("#source").fill("First window note");
    await p
      .locator("#output")
      .evaluate((n) => (n.textContent = "first genuine fixture state"));
    await p.locator("#notes").evaluate((n) => (n.open = true));
    await p.locator("#app-status-open").click();
    await expect(p.locator("#download-update")).toBeVisible({ timeout: 30000 });
    await p.locator("#download-update").click();
    await expect.poll(() => slowStarted).toBe(true);
    await p.locator("#cancel-download").click();
    await expect(p.locator("#cancel-download")).toBeHidden({ timeout: 30000 });
    await expect(p.locator("#offline-status")).not.toContainText(
      "Downloaded and ready to use offline",
    );
    slow = false;
    releaseSlow();
    await expect(p.locator("#download-update")).toBeEnabled();
    await p.locator("#download-update").click();
    await expect(p.locator("#offline-status")).toContainText(
      "Downloaded and ready to use offline",
      { timeout: 30000 },
    );
    await p.keyboard.press("Escape");
    const q = await context.newPage();
    await q.goto(base + "#two");
    await q.locator("#source").fill("Second window note");
    phase = "b";
    failUpdate = true;
    await p.locator("#app-status-open").click();
    await p.locator("#app-status-details").evaluate((n) => (n.open = true));
    await p.locator("#check-update").click();
    await expect(p.locator("#download-update")).toHaveText(
      "Update offline copy",
      { timeout: 30000 },
    );
    await expect(p.locator("#app-status-open [data-badge='update']")).toBeVisible();
    await p.locator("#download-update").click();
    await expect(p.locator("#app-status-error")).not.toBeEmpty({
      timeout: 30000,
    });
    await expect(p.locator("#restart-update")).toBeHidden();
    outage = true;
    await context.setOffline(true);
    await saveAndReload(q);
    await expect(q.locator("body")).toHaveAttribute("data-version", "a");
    await expect(q.locator("#source")).toHaveValue("Second window note");
    outage = false;
    failUpdate = false;
    await context.setOffline(false);
    await expect(p.locator("#restart-update")).toBeVisible({ timeout: 30000 });
    await q.evaluate(() => (window.veto = true));
    await p.locator("#restart-update").click();
    await expect(p.locator("#app-status-error")).not.toBeEmpty({
      timeout: 20000,
    });
    await expect(p.locator("body")).toHaveAttribute("data-version", "a");
    await q.evaluate(() => (window.veto = false));
    await q.evaluate(() => {
      window.originalOpen = indexedDB.open.bind(indexedDB);
      indexedDB.open = () => {
        throw Error("Storage deliberately blocked");
      };
    });
    await p.locator("#restart-update").click();
    await expect(p.locator("#app-status-error")).toContainText(
      /storage|save/i,
      { timeout: 20000 },
    );
    await expect(q.locator("#source")).toHaveValue("Second window note");
    await q.evaluate(() => (indexedDB.open = window.originalOpen));
    await p.locator("#restart-update").click();
    await expect(p.locator("body")).toHaveAttribute("data-version", "b", {
      timeout: 30000,
    });
    await expect(q.locator("body")).toHaveAttribute("data-version", "b", {
      timeout: 30000,
    });
    await expect(p.locator("#source")).toHaveValue("First window note");
    await expect(q.locator("#source")).toHaveValue("Second window note");
    await expect(p.locator("#output")).toHaveText(
      "first genuine fixture state",
    );
    assert.equal(await p.locator("#notes").evaluate((n) => n.open), true);
    await context.setOffline(true);
    await p.reload();
    await expect(p.locator("body")).toHaveAttribute("data-version", "b");
    console.log(
      "PASS cancelled/resumed verified save, failed update preserves usable previous copy, actual two-release worker protocol; active-experiment and storage veto; atomic all-window restart; independent notes, results and disclosures restored; updated release opens offline.",
    );
  } finally {
    releaseSlow?.();
    await context.close();
    await browser.close();
    await host.stop();
    await fs.rm(directory, { recursive: true, force: true });
  }
}
(async () => {
  if (!process.argv.includes("--updates")) await coldCourse();
  if (!process.argv.includes("--course")) await updates();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
