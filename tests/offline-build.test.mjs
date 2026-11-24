// Copyright © 2026 Christopher Snow.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { route } from "../course/manifest.mjs";
import { validateRelease } from "../assets/release-contract.mjs";

test("complete course builds deterministically, pins assets and verifies every offline byte", async () => {
  const parent = await mkdtemp(join(tmpdir(), "sensitivity-build-"));
  try {
    const roots = [join(parent, "a"), join(parent, "b")],
      releases = [];
    for (const root of roots) {
      execFileSync(process.execPath, ["scripts/build-course.mjs", root], {
        stdio: "pipe",
      });
      const release = validateRelease(
        JSON.parse(await readFile(join(root, "release.json"))),
      );
      releases.push(release);
      for (const file of release.files) {
        const body = await readFile(
          join(root, "releases", release.id, file.path),
        );
        assert.equal(body.length, file.bytes, file.path);
        assert.equal(
          createHash("sha256").update(body).digest("hex"),
          file.sha256,
          file.path,
        );
      }
      for (const [id] of route) {
        const page = await readFile(join(root, id + ".html"), "utf8");
        assert.match(
          page,
          new RegExp("releases/" + release.id + "/assets/offline.mjs"),
        );
        assert.match(page, /id="app-status-open"/);
      }
      for (const file of [
        "assets/course-worker.mjs",
        "assets/worker.mjs",
        "assets/course-experiments.mjs",
        "assets/fonts/instrument-sans.woff2",
      ])
        assert.ok(release.files.some((f) => f.path === file));
      // Exercise the real publication entry point, including its actual import paths.
      execFileSync(process.execPath, ["scripts/retain-for-publish.mjs", root], {
        env: { ...process.env, PUBLISHED_COURSE_URL: "" },
        stdio: "pipe",
      });
      const worker = await readFile(join(root, "sw.js"), "utf8");
      assert.doesNotMatch(worker, /__COURSE_SLUG__/);
    }
    assert.equal(releases[0].id, releases[1].id);
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});
