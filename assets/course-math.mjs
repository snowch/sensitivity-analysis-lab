import { seededRandom } from "./model.mjs";
import { mean, variance } from "./sensitivity.mjs";

export { mean, variance };
export const range = n => Array.from({ length: n }, (_, i) => i);
export const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
export const quantile = (values, p) => [...values].sort((a, b) => a - b)[Math.max(0, Math.ceil(p * values.length) - 1)];

export function shuffle(items, random) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function radicalInverse(index, base) {
  let result = 0;
  for (let place = 1 / base; index > 0; place /= base) {
    result += (index % base) * place;
    index = Math.floor(index / base);
  }
  return result;
}

export function design(kind, n, dimensions, seed) {
  const random = seededRandom(seed);
  const columns = range(dimensions);
  if (kind === "lhs") {
    const strata = columns.map(() => shuffle(range(n), random));
    return range(n).map(i => strata.map(order => (order[i] + random()) / n));
  }
  if (kind === "halton") {
    const bases = [2, 3, 5, 7, 11, 13];
    if (dimensions > bases.length) throw new Error("This teaching design supports up to six inputs.");
    const shift = columns.map(random);
    return range(n).map(i => columns.map(j => (radicalInverse(i + 1, bases[j]) + shift[j]) % 1));
  }
  return range(n).map(() => columns.map(random));
}

export function inverseInput(u, low, high, shape) {
  const width = high - low;
  if (shape === "triangle") {
    // A triangular density with its mode one quarter of the way across the range.
    return u < 0.25 ? low + width * Math.sqrt(u * 0.25) : high - width * Math.sqrt((1 - u) * 0.75);
  }
  if (shape === "right") return low + width * Math.sqrt(u);
  return low + width * u;
}

export function pearson(x, y) {
  const mx = mean(x);
  const my = mean(y);
  const scale = Math.sqrt(variance(x, mx) * variance(y, my));
  return scale ? mean(x.map((value, i) => (value - mx) * (y[i] - my))) / scale : null;
}

export function tiedRanks(values) {
  const order = range(values.length).sort((a, b) => values[a] - values[b]);
  const ranks = [];
  let start = 0;
  while (start < order.length) {
    let end = start + 1;
    while (end < order.length && values[order[start]] === values[order[end]]) end++;
    for (let i = start; i < end; i++) ranks[order[i]] = (start + end - 1) / 2;
    start = end;
  }
  return ranks;
}

export function twoInputRegression(x, z, y) {
  const xz = pearson(x, z);
  const xy = pearson(x, y);
  const zy = pearson(z, y);
  if ([xz, xy, zy].some(value => value === null) || 1 - xz ** 2 < 1e-9) return [null, null, null];
  // Solve the two normal equations after centering and dividing each column by its SD.
  const bx = (xy - xz * zy) / (1 - xz ** 2);
  const bz = (zy - xz * xy) / (1 - xz ** 2);
  return [bx, bz, bx * xy + bz * zy];
}

export function morris(evaluate, dimensions, trajectories, seed) {
  const random = seededRandom(seed);
  const delta = 2 / 3;
  const columns = range(dimensions);
  const effects = columns.map(() => []);
  const path = [];
  for (let t = 0; t < trajectories; t++) {
    const directions = columns.map(() => random() < 0.5 ? 1 : -1);
    const point = directions.map(sign => (sign === 1 ? 0 : delta) + (random() < 0.5 ? 0 : 1 / 3));
    let before = evaluate(point);
    if (t === 0) path.push(["Start", ...point, before, null]);
    for (const j of shuffle([...columns], random)) {
      const step = directions[j] * delta;
      point[j] = clamp(point[j] + step, 0, 1);
      const after = evaluate(point);
      const effect = (after - before) / step;
      effects[j].push(effect);
      if (t === 0) path.push([j, ...point, after, effect]);
      before = after;
    }
  }
  const scores = effects.map(values => {
    const mu = mean(values);
    return [mu, mean(values.map(Math.abs)), Math.sqrt(variance(values, mu) * values.length / (values.length - 1))];
  });
  return { scores, path };
}

export function continuousModel(kind, [x, z]) {
  if (kind === "product") return x * z;
  if (kind === "tail") return 10 * x + 18 * Number(z > 0.98);
  return x + 2 * z;
}

export function exactContinuous(kind, event = false) {
  if (event) return [0, 1, 0];
  if (kind === "product") return [3 / 7, 3 / 7, 1 / 7];
  if (kind === "tail") {
    const ordinary = 100 / 12;
    const rare = 18 ** 2 * 0.02 * 0.98;
    return [ordinary / (ordinary + rare), rare / (ordinary + rare), 0];
  }
  return [0.2, 0.8, 0];
}

export function pairSobol(evaluate, n, seed) {
  const random = seededRandom(seed);
  const pairs = range(n).map(() => {
    const ax = random(), az = random(), bx = random(), bz = random();
    return [[ax, az], [bx, bz], [bx, az], [ax, bz]].map(row => evaluate(row));
  });
  const base = pairs.flatMap(([a, b]) => [a, b]);
  const center = mean(base);
  const v = variance(base, center);
  if (!v) {
    const error = new Error("The base samples have no output variation.");
    error.code = "NO_VARIANCE";
    throw error;
  }
  const first = j => mean(pairs.map(row => (row[1] - center) * (row[j] - row[0]))) / v;
  const total = j => mean(pairs.map(row => (row[j] - row[0]) ** 2)) / (2 * v);
  const sx = first(2), sz = first(3);
  // B with A's X equals A with B's Z in two dimensions.
  const joint = mean(pairs.map(([a, b, , az]) => (az - center) ** 2 - (a - center) * (b - center))) / v;
  return { first: [sx, sz], total: [total(2), total(3)], pair: joint - sx - sz };
}

export function binaryDistribution(agreement, evaluate) {
  return [[0, 0], [0, 1], [1, 0], [1, 1]].map(([x, z]) =>
    [x, z, (x === z ? agreement : 1 - agreement) / 2, evaluate(x, z)]);
}

export function conditionalShares(rows) {
  const average = rows.reduce((sum, [, , p, y]) => sum + p * y, 0);
  const total = rows.reduce((sum, [, , p, y]) => sum + p * (y - average) ** 2, 0);
  if (!total) throw new Error("These outcomes have zero variance.");
  const condition = column => [0, 1].map(group => {
    const cells = rows.filter(row => row[column] === group);
    const probability = cells.reduce((sum, row) => sum + row[2], 0);
    return [cells.reduce((sum, row) => sum + row[2] * row[3], 0) / probability, probability];
  });
  const means = [condition(0), condition(1)];
  const shares = means.map(values => values.reduce((sum, [value, p]) => sum + p * (value - average) ** 2, 0) / total);
  return { average, total, means, shares, shapley: [(shares[0] + 1 - shares[1]) / 2, (shares[1] + 1 - shares[0]) / 2] };
}

export function sampleVariance(values) {
  return variance(values) * values.length / (values.length - 1);
}

export function estimatedNoise(noise, repeats, seed, n = 96) {
  const inputRandom = seededRandom(seed);
  const groups = range(n).map(i => {
    const x = inputRandom();
    const random = seededRandom(seed + (i + 1) * 104729);
    const values = range(repeats).map(() => {
      const gaussian = Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
      return 10 * x + noise * gaussian;
    });
    return { x, average: mean(values), variance: sampleVariance(values) };
  });
  const within = mean(groups.map(g => g.variance));
  const between = sampleVariance(groups.map(g => g.average));
  return { groups, within, between, signal: between - within / repeats };
}

export function outputStats(values, threshold) {
  return [mean(values), variance(values), quantile(values, 0.95), mean(values.map(value => Number(value > threshold)))];
}
