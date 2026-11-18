import { inputs } from "./model.mjs";

const worker = new Worker(new URL("./worker.mjs", import.meta.url), { type: "module" });
const pending = new Map();
let requestId = 0;
let workerFailure;
worker.addEventListener("message", ({ data: { id, result, error } }) => {
  const { resolve, reject } = pending.get(id);
  pending.delete(id);
  if (error) reject(new Error(error));
  else resolve(result);
});
worker.addEventListener("error", () => {
  workerFailure = new Error("The experiment could not load. Reload and try again.");
  for (const { reject } of pending.values()) reject(workerFailure);
  pending.clear();
});

function run(task, options) {
  return new Promise((resolve, reject) => {
    if (workerFailure) {
      reject(workerFailure);
      return;
    }
    const id = ++requestId;
    pending.set(id, { resolve, reject });
    worker.postMessage({ id, task, options });
  });
}

const formatCount = value => value.toLocaleString("en-US");
const format = (value, digits = 2) => (Math.abs(value) < 0.5 * 10 ** -digits ? 0 : value).toFixed(digits);
const signed = value => Number(format(value)) > 0 ? `+${format(value)}` : format(value).replace("-", "−");

function stats(items) {
  return `<dl class="stats">${items.map(([label, value]) =>
    `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl>`;
}

function bars(rows, series, { min, max, ticks }) {
  const position = value => (value - min) / (max - min) * 100;
  const zero = position(0);
  const row = item => `<li class="bar-row" style="--zero:${zero}%">
    <strong>${item.label}</strong>
    ${series.map(({ key, label, show, color }) => {
      const value = item[key];
      const end = value === null ? zero : position(value);
      return `<div class="bar-track" aria-hidden="true"><span class="bar ${value < 0 ? "negative" : color}" style="--start:${Math.min(end, zero)}%;--width:${Math.abs(end - zero)}%"></span></div>
        <span class="bar-value"><span class="sr-only">${label} </span>${value === null ? "Undefined" : show(value, item)}</span>`;
    }).join("")}
  </li>`;
  return `<div class="chart ${series.length > 1 ? "paired" : ""}">
    <ul class="legend">${series.map(({ label, color }) => `<li><span class="swatch ${color}"></span>${label}</li>`).join("")}</ul>
    ${ticks ? `<div class="chart-axis" aria-hidden="true"><div><span>${ticks[0]}</span><span>${ticks[1]}</span><span>${ticks[2]}</span></div></div>` : ""}
    <ul class="bar-list">${rows.slice(0, 6).map(row).join("")}</ul>
    ${rows.length > 6 ? `<details class="more"><summary>Show remaining ${rows.length - 6} inputs</summary><ul class="bar-list">${rows.slice(6).map(row).join("")}</ul></details>` : ""}
  </div>`;
}

function rankChart(scores) {
  return bars(scores, [{ key: "rho", label: "Spearman ρ", show: signed, color: "teal" }],
    { min: -1, max: 1, ticks: ["−1", "0", "+1"] });
}

function sobolChart(indices) {
  const min = Math.min(0, ...indices.map(value => value.first));
  const max = Math.max(1, ...indices.map(value => Math.max(value.first, value.total)));
  return bars(indices, [
    { key: "first", label: "First-order", show: value => format(value, 3), color: "muted" },
    { key: "total", label: "Total-order", show: value => format(value, 3), color: "teal" },
  ], { min, max });
}

function renderRanges({ baseline, wide }) {
  const find = scores => {
    const index = scores.findIndex(row => row.id === "network");
    return `#${index + 1} (ρ ${signed(scores[index].rho)})`;
  };
  return `
    ${stats([["Network rank · 8–12 ms", find(baseline.scores)], ["Network rank · 2–65 ms", find(wide.scores)]])}
    <details class="more"><summary>Show 8–12 ms ranking</summary>${rankChart(baseline.scores)}</details>
    <details class="more" open><summary>Show 2–65 ms ranking</summary>${rankChart(wide.scores)}</details>`;
}

function renderScreen(result, { seed, count }) {
  return `
    ${stats([["Median latency", `${format(result.median, 1)} ms`], ["95th percentile", `${format(result.p95, 1)} ms`]])}
    <p class="run-label">${formatCount(count)} simulated runs · seed ${seed}</p>
    ${rankChart(result.scores)}
    <p class="chart-note">Bars left of zero track lower latency. Bars right of zero track higher latency.</p>`;
}

const scenarios = {
  baseline: "Baseline",
  queue: "Queue saturation",
};
const scenarioRuns = new Map();
function renderAssumptions({ rank, indices }, { scenario, count }) {
  scenarioRuns.set(scenario, { screen: rank.scores[0].label, total: indices[0].label, count });
  const screenLead = rank.scores[0];
  const totalLead = indices[0];
  const ranked = new Map(rank.scores.map((input, i) => [input.id, { ...input, place: i + 1 }]));
  return `
    <p class="run-label">${scenarios[scenario]} · ${formatCount(count)} sample pairs · seed 42</p>
    ${stats([["Top Spearman driver", screenLead.label], ["Top total-order driver", totalLead.label]])}
    ${scenario === "queue" ? `<p class="chart-note">Queue penalty in ${format(rank.queueRate * 100, 1)}% of simulated runs · p95 latency ${format(rank.p95, 1)} ms.</p>` : ""}
    ${sobolChart(indices)}
    <p class="chart-note">${totalLead.label} ranks ${ranked.get(totalLead.id).place} of 13 by |ρ| (ρ = ${signed(ranked.get(totalLead.id).rho)}).</p>
    <details class="more"><summary>Compare the full Spearman ranking</summary>
      ${rankChart(rank.scores)}
    </details>
    ${scenarioRuns.size > 1 ? `<details class="more" open><summary>Compare scenario leaders</summary>
      <div class="table-wrap"><table><thead><tr><th scope="col">Scenario</th><th scope="col">Pairs</th><th scope="col">Spearman</th><th scope="col">Total-order</th></tr></thead>
      <tbody>${Object.keys(scenarios).filter(id => scenarioRuns.has(id)).map(id => {
        const entry = scenarioRuns.get(id);
        return `<tr><th scope="row">${scenarios[id]}</th><td>${formatCount(entry.count)}</td><td>${entry.screen}</td><td>${entry.total}</td></tr>`;
      }).join("")}</tbody></table></div></details>` : ""}`;
}

const logRuns = new Map();
function renderLogs(result, { grouped, count }) {
  const { scores, baseline, naive, test } = result;
  logRuns.set(grouped, { scores, count });
  const min = Math.min(0, ...scores.map(value => value.delta));
  const max = Math.max(0.01, ...scores.map(value => value.delta));
  return `
    <p class="run-label">${grouped ? "Cache counters grouped" : "Individual features"} · ${count} shuffles · ${formatCount(test)} test rows</p>
    ${stats([["Forest test MAE", `${format(baseline)} ms`], ["Median-only test MAE", `${format(naive)} ms`]])}
    ${bars(scores, [{ key: "delta", label: "Mean Δ MAE ± shuffle SD (ms)", show: (value, item) => `${signed(value)} ± ${format(item.sd)}`, color: "teal" }], { min, max })}
    ${logRuns.size === 2 ? `<details class="more" open><summary>Compare the cache shuffles</summary><div class="table-wrap"><table>
      <thead><tr><th scope="col">Shuffled columns</th><th scope="col">Shuffles</th><th scope="col">Δ MAE (ms)</th></tr></thead>
      <tbody>${[[false, "edge_miss_pct"], [false, "origin_fetch_pct"], [true, "cache_proxies"]].map(([mode, id]) => {
        const run = logRuns.get(mode);
        const row = run.scores.find(item => item.id === id);
        return `<tr><th scope="row">${row.label}</th><td>${run.count}</td><td>${signed(row.delta)} ± ${format(row.sd)}</td></tr>`;
      }).join("")}</tbody>
    </table></div></details>` : ""}
    <p class="chart-note">A large positive change means that the model loses predictive accuracy. Small or negative changes can occur from weak signals or shuffle variation.</p>`;
}

function connect(formId, resultId, task, getOptions, render) {
  const form = document.getElementById(formId);
  if (!form) return;
  const output = document.querySelector(`#${resultId} .output`);
  const status = form.querySelector(".status");
  const controls = Array.from(form.elements).filter(control => control.type !== "button");
  const submit = form.querySelector("button:not([type])");
  form.addEventListener("change", () => {
    status.textContent = "Run again to apply your changes.";
  });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const options = getOptions(new FormData(form));
    for (const control of controls) control.disabled = true;
    output.setAttribute("aria-busy", "true");
    status.textContent = task === "logs" ? "Evaluating the forest on held-out rows…" : "Running the experiment…";
    try {
      output.innerHTML = render(await run(task, options), options);
      status.textContent = "Results updated.";
    } catch (error) {
      status.textContent = error.message;
    } finally {
      for (const control of controls) control.disabled = false;
      output.removeAttribute("aria-busy");
    }
  });
  submit.disabled = false;
}

connect("screen-form", "screen-results", "screen", data =>
  ({ seed: Number(data.get("seed")), count: Number(data.get("count")) }), renderScreen);
connect("ranges-form", "ranges-results", "ranges", () => ({ seed: 42, count: 8192 }), renderRanges);
connect("assumptions-form", "assumptions-results", "assumptions", data => {
  const scenario = data.get("scenario");
  return { scenario, seed: 42, count: Number(data.get("count")), queue: scenario === "queue" };
}, renderAssumptions);
connect("logs-form", "logs-results", "logs", data =>
  ({ grouped: data.get("grouping") === "grouped", count: Number(data.get("count")) }), renderLogs);

const inputTable = document.getElementById("input-table");
if (inputTable) inputTable.innerHTML = `<div class="table-wrap"><table>
  <thead><tr><th scope="col">Input</th><th scope="col">Stage</th><th scope="col">Assumed range</th></tr></thead>
  <tbody>${inputs.map(input => `<tr><th scope="row">${input.label}</th><td>${input.stage}</td><td>${input.range.join("–")} ${input.unit}</td></tr>`).join("")}</tbody>
</table></div>`;

function download(name, content, mime) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function connectCsv(id, status, task, filename) {
  const button = document.getElementById(id);
  if (!button) return;
  button.addEventListener("click", async () => {
    const message = document.querySelector(status);
    button.disabled = true;
    message.textContent = "Preparing the CSV…";
    try {
      download(filename, await run(task), "text/csv");
      message.textContent = "CSV ready.";
    } catch (error) {
      message.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });
  button.disabled = false;
}

connectCsv("csv", ".csv-status", "csv", "pipeline-runs.csv");
connectCsv("energy-csv", "#energy-csv-status", "energy-csv", "household-energy-runs.csv");

function connectNote(id, noteKey, filename, title) {
  const note = document.getElementById(id);
  if (!note) return;
  const status = document.getElementById("note-status");
  const button = document.getElementById("download-note");
  const unavailable = "Browser storage is unavailable. Download your note to keep it.";
  try {
    note.value = localStorage.getItem(noteKey) ?? "";
  } catch {
    status.textContent = unavailable;
  }
  button.disabled = !note.value.trim();
  note.addEventListener("input", () => {
    button.disabled = !note.value.trim();
    try {
      localStorage.setItem(noteKey, note.value);
      status.textContent = "Saved in this browser.";
    } catch {
      status.textContent = unavailable;
    }
  });
  button.addEventListener("click", () => download(filename, `# ${title}\n\n${note.value.trim()}\n`, "text/markdown"));
}

connectNote("brief", "sensitivity-analysis-lab:investigation-note", "pipeline-investigation.md", "Pipeline investigation");
connectNote("energy-brief", "sensitivity-analysis-lab:energy-note", "energy-investigation.md", "Household electricity investigation");

const money = value => `$${format(value)}`;
function renderPractice(result, { method, colder, grouped }) {
  const scenario = colder ? "Colder season" : "Usual conditions";
  switch (method) {
    case "rank":
      return `<p class="run-label">${scenario} · Spearman rank correlation</p>${rankChart(result.scores)}`;
    case "sobol":
      return `<p class="run-label">${scenario} · 8,192 sample pairs</p>${sobolChart(result)}`;
    case "logs": {
      const min = Math.min(0, ...result.scores.map(score => score.delta));
      const max = Math.max(0.01, ...result.scores.map(score => score.delta));
      const series = [{ key: "delta", label: "Mean Δ MAE ($)", show: signed, color: "teal" }];
      return `<p class="run-label">Recorded runs · ${grouped ? "weather signals grouped" : "individual features"} · ${result.test} test rows · 5 shuffles</p>
        ${stats([["Forest test MAE", money(result.baseline)], ["Median-only test MAE", money(result.naive)]])}
        ${bars(result.scores, series, { min, max })}`;
    }
    case "change": {
      const row = (label, value) => `<tr><th scope="row">${label}</th><td>${money(value.median)}</td><td>${money(value.p95)}</td><td>${format(value.overBudget * 100, 1)}%</td></tr>`;
      return `<p class="run-label">${scenario} · 8,192 matched months</p>
        <div class="table-wrap"><table>
          <thead><tr><th scope="col">Option</th><th scope="col">Median bill</th><th scope="col">p95 bill</th><th scope="col">Over $200</th></tr></thead>
          <tbody>${row("Baseline", result.baseline)}${row(result.label, result.alternative)}</tbody>
        </table></div>`;
    }
  }
}

const method = document.getElementById("method");
if (method) {
  const update = () => {
    document.getElementById("practice-scenario").hidden = !method.value || method.value === "logs";
    document.getElementById("practice-group").hidden = method.value !== "logs";
    document.getElementById("practice-change").hidden = method.value !== "change";
  };
  method.addEventListener("change", update);
  window.addEventListener("pageshow", update);
  update();
}
connect("practice-form", "practice-results", "practice", data => ({
  method: data.get("method"), colder: data.get("season") === "colder",
  grouped: data.get("grouping") === "grouped", change: data.get("change"),
}), renderPractice);

for (const check of document.querySelectorAll(".knowledge-check")) {
  const feedback = check.querySelector(".check-feedback");
  check.addEventListener("change", () => { feedback.textContent = ""; });
  check.addEventListener("submit", event => {
    event.preventDefault();
    const choice = check.querySelector("input:checked");
    feedback.textContent = choice.dataset.feedback;
  });
  check.querySelector("button").disabled = false;
}
