import { inputs, latency, overloaded, sampleInput, seededRandom } from "./model.mjs";

export const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
export const variance = (values, center = mean(values)) => mean(values.map(value => (value - center) ** 2));

function ranks(values) {
  const order = values.map((_, index) => index).sort((a, b) => values[a] - values[b]);
  const rank = Array(values.length);
  let start = 0;
  while (start < order.length) {
    let end = start + 1;
    while (end < order.length && values[order[start]] === values[order[end]]) end++;
    // Give tied observations their average rank.
    for (let i = start; i < end; i++) rank[order[i]] = (start + end - 1) / 2;
    start = end;
  }
  return rank;
}

function spearman(values, rankedOutput) {
  const rankedInput = ranks(values);
  const center = (values.length - 1) / 2;
  const covariance = mean(rankedInput.map((rank, i) => (rank - center) * (rankedOutput[i] - center)));
  return covariance / Math.sqrt(variance(rankedInput, center) * variance(rankedOutput, center));
}

export function screen({ seed, count, wideNetwork = false, queue = false }) {
  const random = seededRandom(seed);
  const rows = Array.from({ length: count }, () => sampleInput(random, wideNetwork));
  const output = rows.map(row => latency(row, queue));
  const rankedOutput = ranks(output);
  const sorted = [...output].sort((a, b) => a - b);
  return {
    median: sorted[Math.ceil(count * 0.5) - 1],
    p95: sorted[Math.ceil(count * 0.95) - 1],
    queueRate: queue ? mean(rows.map(row => Number(overloaded(row[2], row[3])))) : 0,
    scores: inputs.map(({ id, label }, column) => ({
      id, label, rho: spearman(rows.map(row => row[column]), rankedOutput),
    })).sort((a, b) => Math.abs(b.rho) - Math.abs(a.rho)),
  };
}

export function sobol({ seed, count, wideNetwork = false, queue = false }) {
  const random = seededRandom(seed);
  const a = Array.from({ length: count }, () => sampleInput(random, wideNetwork));
  const b = Array.from({ length: count }, () => sampleInput(random, wideNetwork));
  const outputA = a.map(row => latency(row, queue));
  const outputB = b.map(row => latency(row, queue));
  const combined = [...outputA, ...outputB];
  const center = mean(combined);
  const outputVariance = variance(combined, center);

  return inputs.map(({ id, label }, column) => {
    let first = 0;
    let total = 0;
    for (let i = 0; i < count; i++) {
      const hybrid = a[i].slice();
      hybrid[column] = b[i][column];
      const difference = latency(hybrid, queue) - outputA[i];
      first += (outputB[i] - center) * difference;
      total += difference ** 2;
    }
    // Saltelli first-order and Jansen total-order pick-freeze estimates.
    return { id, label, first: first / (count * outputVariance),
      total: total / (2 * count * outputVariance) };
  }).sort((left, right) => right.total - left.total);
}
