import { fitLogs, normal, permutation, toCsv } from "./logs.mjs";
import { seededRandom } from "./model.mjs";
import { mean, screen, sobol } from "./sensitivity.mjs";

export const factors = [
  { id: "cold_days", label: "Cold days", range: [0, 22], unit: "days", colder: [12, 26] },
  { id: "heat_loss", label: "Heat-loss multiplier", range: [0.7, 1.5], unit: "×" },
  { id: "rate", label: "Electricity rate", range: [0.22, 0.36], unit: "$/kWh" },
  { id: "base", label: "Other electricity use", range: [160, 250], unit: "kWh" },
  { id: "dryer_cycles", label: "Dryer cycles", range: [4, 30], unit: "cycles" },
];

function drawMonth(random, colder) {
  return factors.map(({ range, colder: winterRange }) => {
    const [low, high] = (colder && winterRange) || range;
    return low + random() * (high - low);
  });
}

export function bill([cold, heatLoss, rate, base, cycles]) {
  return 12 + rate * (18 * cold * heatLoss + base + 3 * cycles);
}

const weatherPair = { id: "weather_pair", label: "Cold-weather proxy pair", columns: [0, 1] };
const columns = [
  { id: "cold_outdoor_days", label: "Outdoor-sensor cold days" },
  { id: "heater_request_days", label: "Thermostat-request days" },
  ...factors.slice(1),
];
const budget = 200;
const seed = 187;
const count = 8192;
const options = {
  drafts: { label: "Reduce heat loss by 30%", edit: ([cold, loss, ...rest]) => [cold, 0.7 * loss, ...rest] },
  dryer: { label: "Halve dryer cycles", edit: ([cold, loss, rate, base, cycles]) => [cold, loss, rate, base, cycles / 2] },
  timers: { label: "Cut other use by 25 kWh", edit: ([cold, loss, rate, base, cycles]) => [cold, loss, rate, base - 25, cycles] },
};

export function makeEnergyLogs() {
  const random = seededRandom(519);
  return Array.from({ length: 3000 }, () => {
    const month = drawMonth(random, false);
    const [cold, ...rest] = month;
    const sensors = [cold + normal(random), cold + normal(random) * 1.3];
    return {
      x: [...sensors.map(value => random() < 0.04 ? null : Math.max(0, Math.round(value))), ...rest]
        .map(value => value === null ? null : Number(value.toFixed(3))),
      y: Number((bill(month) + normal(random) * 3).toFixed(2)),
    };
  });
}

let fitted;
export function analyzeEnergy({ method, colder, grouped, change }) {
  const draw = random => drawMonth(random, colder);
  const simulation = { seed, count, factors, draw, evaluate: bill };
  switch (method) {
    case "rank":
      return screen(simulation);
    case "sobol":
      return sobol(simulation);
    case "logs":
      fitted ??= fitLogs(makeEnergyLogs());
      return permutation(fitted, { grouped, columns, pair: weatherPair });
    case "change": {
      const random = seededRandom(seed);
      const months = Array.from({ length: count }, () => draw(random));
      const summarize = values => ({
        median: values[Math.ceil(count * 0.5) - 1],
        p95: values[Math.ceil(count * 0.95) - 1],
        overBudget: mean(values.map(cost => Number(cost > budget))),
      });
      const estimate = edit => summarize(months.map(edit).map(bill).sort((a, b) => a - b));
      return {
        label: options[change].label,
        baseline: estimate(month => month),
        alternative: estimate(options[change].edit),
      };
    }
    default:
      throw new Error("Choose an analysis to run.");
  }
}

export const energyCsv = () => toCsv(makeEnergyLogs(), columns, "monthly_bill_usd");
