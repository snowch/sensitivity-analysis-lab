import { inputs, latency, sampleInput, seededRandom } from "./model.mjs";
import { mean, variance } from "./sensitivity.mjs";

const features = [
  ...inputs.slice(1).map(({ id, label }) => ({ id, label })),
  { id: "edge_miss_pct", label: "Edge miss rate" },
  { id: "origin_fetch_pct", label: "Origin fetch rate" },
  { id: "deploy_age_h", label: "Deploy age" },
];
const telemetry = {
  id: "cache_proxies", label: "Cache telemetry pair", columns: [12, 13],
};
const dataSeed = 824;
const rowCount = 10000;

export function normal(random) {
  return Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
}

function rounded(value) {
  return Number(value.toFixed(3));
}

export function makeLogs() {
  const random = seededRandom(dataSeed);
  return Array.from({ length: rowCount }, () => {
    const knobs = sampleInput(random);
    const miss = 100 - knobs[0];
    const measurements = [
      ...knobs.slice(1),
      miss + normal(random) * 0.9,
      miss + normal(random) * 0.9,
      random() * 168,
    ];
    // Two noisy, occasionally missing proxies for a cache setting absent from the logs.
    return {
      x: measurements.map((value, j) =>
        telemetry.columns.includes(j) && random() < 0.04 ? null : rounded(value)),
      y: rounded(latency(knobs, true) + normal(random) * 3),
    };
  });
}

export function toCsv(rows, columns = features, target = "latency_ms") {
  const header = [...columns.map(feature => feature.id), target];
  return [header.join(","), ...rows.map(({ x, y }) => [...x, y].join(","))].join("\n") + "\n";
}

function shuffledIndices(length, random) {
  const order = Array.from({ length }, (_, index) => index);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function prepare(rows) {
  const order = shuffledIndices(rows.length, seededRandom(206));
  const cut = Math.floor(order.length * 0.8);
  const train = order.slice(0, cut).map(index => rows[index]);
  const test = order.slice(cut).map(index => rows[index]);
  const medians = rows[0].x.map((_, column) => {
    const values = train.map(({ x }) => x[column]).filter(value => value !== null).sort((a, b) => a - b);
    const middle = Math.floor(values.length / 2);
    return (values[middle] + values[Math.floor((values.length - 1) / 2)]) / 2;
  });
  const impute = ({ x, y }) => ({ x: x.map((value, j) => value ?? medians[j]), y });
  return { train: train.map(impute), test: test.map(impute) };
}

function growTree(rows, random, depth = 0) {
  const average = mean(rows.map(row => row.y));
  if (depth === 8 || rows.length < 40) return { value: average };

  let best;
  // Search exact cuts in five randomly selected features using squared-error reduction.
  for (const feature of shuffledIndices(rows[0].x.length, random).slice(0, 5)) {
    const sorted = [...rows].sort((a, b) => a.x[feature] - b.x[feature]);
    const total = average * rows.length;
    let left = 0;
    for (let i = 1; i < sorted.length; i++) {
      left += sorted[i - 1].y;
      const low = sorted[i - 1].x[feature];
      const high = sorted[i].x[feature];
      if (i < 16 || sorted.length - i < 16 || low === high) continue;
      const gain = left ** 2 / i + (total - left) ** 2 / (sorted.length - i) - total * average;
      if (gain > (best?.gain ?? 1e-9)) best = { feature, cut: (low + high) / 2, gain };
    }
  }
  if (!best) return { value: average };

  const { feature, cut } = best;
  const left = [];
  const right = [];
  for (const row of rows) (row.x[feature] <= cut ? left : right).push(row);
  return { feature, cut, left: growTree(left, random, depth + 1), right: growTree(right, random, depth + 1) };
}

function predictTree(tree, x) {
  let node = tree;
  while (node.feature !== undefined) node = x[node.feature] <= node.cut ? node.left : node.right;
  return node.value;
}

function fitForest(train) {
  const random = seededRandom(691);
  return Array.from({ length: 24 }, () => {
    const sample = Array.from({ length: train.length }, () => train[Math.floor(random() * train.length)]);
    return growTree(sample, random);
  });
}

export function fitLogs(rows = makeLogs()) {
  const { train, test } = prepare(rows);
  const forest = fitForest(train);
  const predict = x => mean(forest.map(tree => predictTree(tree, x)));
  const baseline = mean(test.map(({ x, y }) => Math.abs(y - predict(x))));
  const medianPredictor = train.map(({ y }) => y).sort((a, b) => a - b);
  const midpoint = Math.floor(medianPredictor.length / 2);
  const median = (medianPredictor[Math.floor((medianPredictor.length - 1) / 2)] + medianPredictor[midpoint]) / 2;
  const naive = mean(test.map(({ y }) => Math.abs(y - median)));
  return { predict, test, baseline, naive };
}

export function permutation(fitted, { count = 5, grouped = false, columns = features, pair = telemetry } = {}) {
  const { test, predict, baseline, naive } = fitted;
  const groups = columns.flatMap((feature, i) => {
    if (!grouped || !pair.columns.includes(i)) return [{ ...feature, columns: [i] }];
    if (i === pair.columns[0]) return [pair];
    return [];
  });

  const scores = groups.map(({ id, label, columns }) => {
    const random = seededRandom(943);
    const deltas = Array.from({ length: count }, () => {
      const order = shuffledIndices(test.length, random);
      return mean(test.map(({ x, y }, i) => {
        const modified = x.slice();
        for (const column of columns) modified[column] = test[order[i]].x[column];
        return Math.abs(y - predict(modified));
      })) - baseline;
    });
    return { id, label, delta: mean(deltas), sd: Math.sqrt(variance(deltas)) };
  }).sort((a, b) => b.delta - a.delta);

  return { scores, baseline, naive, test: test.length };
}
