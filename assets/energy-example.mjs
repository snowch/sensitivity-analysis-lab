import { screen, sobol } from "./sensitivity.mjs";

// Replace the factors and formula with your own. These draws assume independence.
const factors = [
  { id: "cold_days", label: "Cold days", range: [0, 22] },
  { id: "heat_loss", label: "Heat loss multiplier", range: [0.7, 1.5] },
  { id: "rate", label: "Electricity rate ($/kWh)", range: [0.22, 0.36] },
];

const draw = random => factors.map(({ range: [low, high] }) => low + random() * (high - low));
const evaluate = ([cold, loss, rate]) => 12 + rate * (205 + 18 * cold * loss);
const options = { seed: 42, count: 8192, factors, draw, evaluate };

console.table(screen(options).scores);
console.table(sobol(options));
