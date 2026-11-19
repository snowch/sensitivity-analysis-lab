import { seededRandom } from "./model.mjs";
import { screen, sobol } from "./sensitivity.mjs";
import {
  binaryDistribution, clamp, conditionalShares, continuousModel, design, estimatedNoise, exactContinuous,
  inverseInput, mean, morris, outputStats, pairSobol, pearson, quantile, range, sampleVariance, tiedRanks, twoInputRegression,
} from "./course-math.mjs?v=2";

const metrics = ["Mean", "Variance", "p95", "Exceedance probability"];
const modelNames = { add: "Additive", product: "Product", tail: "Rare jump" };
const designNames = { random: "Random", lhs: "Latin hypercube", halton: "Shifted Halton" };
const plot = (x, y, series, extra = {}) => ({ x, y, series, ...extra });
const line = (label, points) => ({ label, points });
const dots = (label, points) => ({ label, points, dots: true });
const table = (caption, columns, rows) => ({ caption, columns, rows });
const factors = ["Guests", "Service rate", "Burst share"].map((label, id) => ({ id, label }));

function questions({ scenario, threshold, metric }) {
  const stable = [20, 20, 20, 20, 20];
  const variable = scenario === "bursts" ? [10, 10, 10, 10, 60] : [12, 16, 20, 24, 28];
  const selected = metrics.indexOf(metric);
  const summarise = value => selected === 3 ? `${Math.round(value * 100)}%`
    : `${Number(value.toFixed(3))} ${selected === 1 ? "min²" : "min"}`;
  const label = scenario === "bursts" ? "Variable · occasional long trip" : "Variable · moderate spread";
  const rows = [["Steady", stable], [label, variable]].map(([label, runs]) =>
    [label, runs.join(", "), ...outputStats(runs, threshold)]);
  return {
    headline: metric,
    text: `Steady: ${summarise(rows[0][2 + selected])}. Variable: ${summarise(rows[1][2 + selected])}. A trip is late when it takes more than ${threshold} minutes.`,
    tables: [table("Five equally likely journey times", ["Service", "Time (minutes)", "Mean (min)", "Variance (min²)", "p95 (min)", "P(above limit)"], rows)],
    charts: [plot("Outcome number", "Journey time (minutes)", [
      dots("Steady", stable.map((y, i) => [i + 1, y])), dots("Variable", variable.map((y, i) => [i + 1, y])),
      line("Limit", [[1, threshold], [5, threshold]]),
    ])],
  };
}

function local({ distance, rate, step, units }) {
  const scale = units === "m" ? 1000 : 1;
  const fixed = 4;
  const before = fixed + rate * distance;
  const change = rate * step;
  const after = before + change;
  return {
    headline: "One change to distance",
    tables: [
      table("Cost calculation", ["Quantity", "Value"], [
        ["Reference distance (" + units + ")", distance * scale],
        ["Distance after change (" + units + ")", (distance + step) * scale],
        ["Fixed fare ($)", fixed], ["Reference cost ($)", before], ["New cost ($)", after],
        ["Change in cost ($)", change], ["Slope ($/" + units + ")", change / (step * scale)],
        ["Distance change (%)", step / distance * 100], ["Cost change (%)", change / before * 100],
        ["Elasticity (no units)", (change / before) / (step / distance)],
      ]),
    ],
    charts: [plot(`Distance (${units})`, "Fare ($)", [
      line("Fare", [[0, fixed], [(distance + step + 2) * scale, after + 2 * rate]]),
      dots("Compared distances", [[distance * scale, before], [(distance + step) * scale, after]]),
    ])],
  };
}

const responseFunctions = {
  curve: x => x ** 2,
  saturation: x => 10 * x / (2 + x),
  threshold: x => x + 5 * Number(x >= 5),
  valley: x => (x - 5) ** 2,
};

function curves({ shape, baseline, step }) {
  const f = responseFunctions[shape];
  const y0 = f(baseline), y1 = f(baseline + step);
  const points = range(121).map(i => [i / 12, f(i / 12)]);
  if (shape === "threshold") points.splice(60, 0, [5, null]);
  return {
    headline: "Change over the selected step",
    tables: [table("Finite difference", ["Start input", "Start output", "End input", "End output", "Output change", "Change per input unit"], [
      [baseline, y0, baseline + step, y1, y1 - y0, (y1 - y0) / step],
    ])],
    charts: [plot("Input (units)", "Output (points)", [line("Response", points), line("Secant between endpoints", [[baseline, y0], [baseline + step, y1]])])],
  };
}

function tornado({ baseline, width, rateWidth }) {
  const names = ["Jobs per hour", "Capacity per hour", "Fixed delay"];
  const center = [baseline, 70, 8];
  const half = [width, rateWidth, 4];
  const evaluate = ([demand, capacity, delay]) => delay + 0.05 * demand + 0.2 * Math.max(0, demand - capacity) ** 2;
  const base = evaluate(center);
  const vary = (j, offset) => evaluate(center.map((value, i) => value + (i === j ? half[j] * offset : 0)));
  const rows = names.map((name, j) => {
    const low = vary(j, -1), high = vary(j, 1);
    return [name, center[j] - half[j], center[j] + half[j], low, high, Math.abs(high - low)];
  }).sort((a,b) => b[5] - a[5]);
  return {
    headline: `Reference delay: ${base.toFixed(2)} minutes`,
    tables: [table("One input varies at a time", ["Input", "Low input", "High input", "Delay at low (min)", "Delay at high (min)", "Endpoint span (min)"], rows)],
    tornado: { base, rows: rows.map(([name, , , low, high]) => [name, low, high]) },
    charts: [plot("Percent of the selected half-range from reference", "Delay (minutes)", names.map((name, j) =>
      line(name, range(21).map(i => [(i - 10) * 10, vary(j, (i - 10) / 10)]))))],
  };
}

function inputs({ shape, dependence, seed }) {
  const random = seededRandom(seed);
  const sample = range(3000).map(() => {
    const d = random(), spare = random(), choose = random();
    const capacity = dependence === "linked" && choose < 0.8 ? d : spare;
    return [inverseInput(d, 40, 100, shape), 40 + 60 * capacity];
  });
  const demand = sample.map(row => row[0]);
  const bad = ([d, c]) => d > 80 && c < 60;
  const displayed = sample.slice(0, 200);
  const histogram = range(10).map(i => {
    const low = 40 + i * 6;
    return [low + 3, mean(demand.map(d => Number(d >= low && d < low + 6)))];
  });
  return {
    headline: "Marginal assumptions and joint possibilities",
    tables: [table("From 3,000 input pairs", ["Mean demand (jobs/h)", "Demand p95 (jobs/h)", "P(demand >80 and capacity <60)", "Pearson correlation"], [
      [mean(demand), quantile(demand, .95), mean(sample.map(pair => Number(bad(pair)))), pearson(demand, sample.map(row => row[1]))],
    ])],
    charts: [
      plot("Demand bin midpoint (jobs/hour)", "Fraction within each 6-job bin", [line("Demand distribution", histogram)]),
      plot("Demand (jobs/hour)", "Capacity (jobs/hour)", [dots("Other pairs", displayed.filter(pair => !bad(pair))), dots("High demand, low capacity", displayed.filter(bad))], { xDomain: [40, 100], yDomain: [40, 100] }),
    ],
  };
}

function designs({ count, seed }) {
  const names = Object.keys(designNames);
  const current = names.map(kind => [kind, design(kind, count, 2, seed)]);
  return {
    headline: "Estimate the average of X × Z over a unit square",
    tables: [table("Exact mean = 0.25", ["Design", "Model evaluations", "Estimate", "Absolute error", "Mean absolute error across 12 seeds"], current.map(([kind, points]) => {
      const estimate = mean(points.map(([x,z]) => x*z));
      const errors = range(12).map(i => Math.abs(mean(design(kind, count, 2, seed + i * 7919).map(([x,z]) => x*z)) - .25));
      return [designNames[kind], count, estimate, Math.abs(estimate - .25), mean(errors)];
    }))],
    charts: current.map(([kind, points]) => plot("X (0–1)", "Z (0–1)", [dots(designNames[kind], points)], { xDomain: [0, 1], yDomain: [0, 1] })),
  };
}

function patterns({ shape, noise, seed }) {
  const sample = design("random", 256, 3, seed).map(([u, v, w]) => {
    const x = 2 * u - 1, z = 2 * v - 1;
    const response = shape === "u" ? x*x : shape === "cubic" ? x**3 : x;
    return [x, z, response + 0.35 * z + noise * (2 * w - 1)];
  });
  const [x, z, y] = range(3).map(j => sample.map(row => row[j]));
  const [bx, bz, r2] = twoInputRegression(x, z, y);
  const rows = [["X", x, bx], ["Z", z, bz]].map(([name, values, beta]) =>
    [name, pearson(values,y), pearson(tiedRanks(values),tiedRanks(y)), beta]);
  return {
    headline: "Different screens answer different questions",
    tables: [table("Global screens on the same sample", ["Input", "Pearson r", "Spearman ρ", "Standardised slope"], rows), table("Model fit", ["Linear model R²"], [[r2]])],
    charts: [plot("X (scaled units)", "Output (points)", [dots("Sampled output", x.map((value,i)=>[value,y[i]]))]),
      plot("Z (scaled units)", "Output (points)", [dots("Sampled output", z.map((value,i)=>[value,y[i]]))])],
  };
}

function trajectories({ model, count, seed }) {
  const evaluate = ([x, z, w]) => 0.5 * w + (model === "curved" ? 3*x*x + z : model === "product" ? 3*x*z + z : 3*x + z);
  const { scores, path } = morris(evaluate, 3, count, seed);
  return {
    headline: `${count} trajectories · ${4 * count} model evaluations`,
    tables: [
      table("Screening results", ["Input", "Mean effect μ", "Mean absolute effect μ*", "Effect SD σ"], scores.map((row,i) => ["XZW"[i], ...row])),
      table("First trajectory", ["Changed", "X", "Z", "W", "Output", "Effect for this step"], path.map(([j, ...row]) => [typeof j === "number" ? "XZW"[j] : j, ...row])),
    ],
    charts: [plot("μ* (output points per scaled unit)", "σ (same units)", scores.map(([, star, sd], i) => dots("XZW"[i], [[star,sd]])), { xDomain: [0, 4], yDomain: [0, 2] })],
  };
}

function interaction({ model, regime, low, high }) {
  if (low >= high) throw new Error("Set Low arrivals (scaled units) below High arrivals (scaled units), then run again.");
  const f = (x,z) => 5 + x + (model === "add" ? 3*z : 5*z*Math.max(0,x-regime));
  const rows = [low,high].map(x => [x, f(x,0), f(x,1)]);
  const delta = [0,1].map(z => f(high,z)-f(low,z));
  const xs = range(11);
  const zs = range(6).map(i=>i/5);
  return {
    headline: `Difference between the two arrival effects: ${(delta[1] - delta[0]).toFixed(2)} minutes`,
    tables: [table("Complete a two-input comparison", ["Arrivals (scaled units)", "Delay at Z=0 (min)", "Delay at Z=1 (min)"], [...rows, ["High minus low", ...delta]])],
    heatmap: { x: "Arrivals (scaled units)", y: "Capacity pressure (0–1)", xs, zs, values: zs.map(z => xs.map(x=>f(x,z))) },
    charts: [plot("Arrivals (scaled units)", "Delay (minutes)", [0,0.5,1].map(z=>line(`Pressure ${z}`, xs.map(x=>[x,f(x,z)]))), { xDomain: [0,10] })],
  };
}

function varianceLab({ rule }) {
  const rows = binaryDistribution(.5, (x,z) => rule === "both" ? x*z : x+z);
  const { average, total, means, shares } = conditionalShares(rows);
  return {
    headline: "Exactly enumerate the four outcomes",
    tables: [
      table("Each combination has weight 1/4", ["X", "Z", "Probability", "Output Y", "(Y − mean)²"], rows.map(row=>[...row,(row[3]-average)**2])),
      table("Variance explained by conditional averages", ["Know", "Mean when off", "Mean when on", "First-order share", "Total-order share"], [0,1].map(i=>
        ["XZ"[i], ...means[i].map(row=>row[0]), shares[i], 1-shares[1-i]])),
      table("Output summary", ["Mean", "Variance", "Pair share"], [[average, total, 1-shares[0]-shares[1]]]),
    ],
  };
}

function sobolLab({ model, count, seed, objective }) {
  const event = objective === "event";
  const selected = event ? "tail" : model;
  const evaluate = row => {
    const value = continuousModel(selected,row);
    return event ? Number(value > 14) : value;
  };
  let estimate;
  try {
    estimate = pairSobol(evaluate,count,seed);
  } catch (error) {
    if (error.code !== "NO_VARIANCE") throw error;
  }
  const [sx,sz,pair] = exactContinuous(selected,event);
  return {
    headline: event ? "Decompose variance of the event indicator Y > 14" : `${modelNames[selected]} model · decompose variance of Y`,
    text: estimate
      ? `${count.toLocaleString()} independent pairs, ${(4*count).toLocaleString()} model evaluations. Signs are retained on every estimate.`
      : "All base outputs were the same, so this sample has no variance to divide up. The exact shares still appear below. Increase Independent sample pairs and run again.",
    tables: [table("Estimated versus exact", ["Quantity", "Estimate", "Exact"], [
      ["X first order",estimate?.first[0],sx],["Z first order",estimate?.first[1],sz],
      ["X × Z second order",estimate?.pair,pair],["X total order",estimate?.total[0],sx+pair],["Z total order",estimate?.total[1],sz+pair],
    ])],
  };
}

function dependence({ agreement, model }) {
  const evaluate = (x,z) => model === "proxy" ? z : x+2*z;
  const rows = binaryDistribution(agreement,evaluate);
  const { total, means, shares, shapley } = conditionalShares(rows);
  return {
    headline: "Allocate explained variance by averaging two orders",
    tables: [
      table("Joint distribution (each variable is on half the time)", ["X", "Z", "Probability", "Output"], rows),
      table("How each input adds information", ["Input", "Mean when off", "Mean when on", "Explained alone", "Added after the other", "Shapley effect"], [0,1].map(i=>
        ["XZ"[i], ...means[i].map(row=>row[0]), shares[i], 1-shares[1-i], shapley[i]])),
      table("Total output variance", ["Variance"], [[total]]),
    ],
  };
}

function reliability({ count, seed, model }) {
  const exact = exactContinuous(model)[2];
  const sizes = [Math.max(16, count/4), count, count*4];
  const data = sizes.map(n => {
    const estimates = range(20).map(i => pairSobol(row => continuousModel(model,row),n,seed+104729*i).pair);
    return { n, estimates, average: mean(estimates), low: quantile(estimates,.1), high: quantile(estimates,.9),
      meanHalfWidth: 2.093 * Math.sqrt(sampleVariance(estimates) / estimates.length) };
  });
  return {
    headline: "Repeat the second-order estimate",
    text: "The middle range shows the 10th to 90th percentiles of estimates from 20 designs. It describes run-to-run variation at a fixed model and settings.",
    tables: [table("Run-to-run spread", ["Pairs per run", "Mean estimate", "10th percentile", "90th percentile", "Negative estimates (of 20)", "Exact share"], data.map(({n,estimates,average,low,high}) =>
      [n,average,low,high,estimates.filter(e=>e<0).length,exact])),
      table("Approximate 95% interval for the repeated-design mean", ["Pairs per run", "Lower end", "Upper end"], data.map(({ n,average,meanHalfWidth })=>[n,average-meanHalfWidth,average+meanHalfWidth]))],
    charts: [plot("Sample-size step (each step ×4)", "Pair index", [
      dots("Independent design estimates", data.flatMap(({estimates},i)=>estimates.map((value,j)=>[i+1+(j-9.5)/105,value]))),
      line("Mean estimate", data.map(({average},i)=>[i+1,average])), line("Exact value", [[1,exact],[3,exact]]),
    ], { xTicks: sizes.map((n,i)=>[i+1,n.toLocaleString()]) })],
  };
}

function stochastic({ noise, repeats, seed }) {
  const result = estimatedNoise(noise,repeats,seed);
  return {
    headline: "Separate noise from the variation of conditional means",
    tables: [table("96 distinct inputs", ["Quantity", "Estimate (points²)", "Model reference (points²)"], [
      ["Within-input noise",result.within,noise**2], ["Variance of group means",result.between,100/12 + noise**2/repeats],
      ["Noise-corrected input contribution",result.signal,100/12],
    ])],
    charts: [plot("Input X (0–1)", "Mean output at this X (points)", [
      dots("Mean over repeated runs",result.groups.map(row=>[row.x,row.average])), line("True mean",[[0,0],[1,10]]),
    ])],
  };
}

function decisions({ premium, loss, risk, structure, seed, threshold }) {
  const sample = design("random",8192,2,seed);
  const outcomes = sample.map(([x,z])=>[10*x, 18*Number(z>.98)]);
  const result = [[0,0,0],[premium,0,.65],[premium,1,0]].map(([price,block,ordinary],i) => {
    const values = outcomes.map(([regular,jump]) => regular*(1-ordinary) + jump*(1-block) + (structure === "spill" ? 6*block : 0));
    const [, , p95, exceed] = outputStats(values,threshold);
    return [["Current", "Cut ordinary delay", "Prevent rare failure"][i], p95, exceed, price, price+loss*exceed];
  });
  const avoided = result[0][2]-result[2][2];
  const without = Math.min(18, 60*risk);
  const perfect = 18*risk;
  return {
    headline: "Costs and risks under matched conditions",
    tables: [
      table("Technical model · one run is one job", ["Option", "p95 delay (min)", `P(delay > ${threshold} min)`, "Price per job ($)", "Expected total cost per job ($)"], result),
      table("Rare failure prevention versus current", ["Break-even price per job ($)"], [[loss*avoided]]),
      table("Perfect signal example · separate decision", ["Chance of severe day", "Best action without signal", "Best expected cost without signal ($)", "Expected cost with perfect signal ($)", "Value of perfect information ($)"], [[risk,risk < 0.3 ? "Wait" : risk > 0.3 ? "Mitigate" : "Either",without,perfect,without-perfect]]),
    ],
  };
}

export function eventWait([guests, service, burst], volunteers, structure) {
  const share = structure === "spread" ? .65*burst + .35*.4 : burst;
  const backlog = Math.max(0, guests*share - volunteers*service);
  return 30*backlog/(volunteers*service);
}

function capstone(o) {
  const bounds = [[o.guestsLow,o.guestsHigh],[o.serviceLow,o.serviceHigh],[o.burstLow,o.burstHigh]];
  if (bounds.some(([low,high])=>low>=high)) throw new Error("Check the guest, service-rate and burst-share ranges. Each lower bound must be below its upper bound.");
  const linked = o.dependence === "linked";
  const makeScale = () => {
    const linkRandom = seededRandom(o.seed + 868);
    return ([g,s,b]) => {
      const percentiles = [g,s,linked && linkRandom() < .8 ? g : b];
      return percentiles.map((value,i) => inverseInput(value,...bounds[i],i === 0 ? o.shape : "uniform"));
    };
  };
  const sample = design("random",o.count,3,o.seed).map(makeScale());
  const options = [o.team,o.team+1].map(team=>sample.map(row=>eventWait(row,team,o.structure)));
  const chosen = metrics.indexOf(o.summary);
  const outcome = row => {
    const value = eventWait(row,o.team,o.structure);
    return o.analysis === "event" ? Number(value>o.limit) : value;
  };
  const scale = makeScale();
  const setup = { count: o.count, seed: o.seed, factors, draw: random=>scale(bounds.map(random)), evaluate: outcome };
  const compare = options.map((values,i)=>[o.team+i, ...outputStats(values,o.limit)]);
  const results = [
    table("Matched staffing choices", ["Volunteers", "Mean (min)", "Variance (min²)", "p95 (min)", `P(wait > ${o.limit} min)`], compare),
    table("Chosen decision summary", ["Outcome", "Current team", "One extra volunteer", "Extra shift cost ($)"], [[o.summary,compare[0][chosen+1],compare[1][chosen+1],o.shiftCost]]),
  ];
  if (o.method === "oat") {
    const center = bounds.map(([a,b])=>(a+b)/2);
    const y0 = outcome(center);
    const rows = bounds.map(([a,b],j)=>[factors[j].label,a,b,
      outcome(center.map((x,i)=>i===j?a:x))-y0, outcome(center.map((x,i)=>i===j?b:x))-y0]);
    results.push(table("One-at-a-time changes from reference", ["Input", "Low", "High", "Low − reference", "High − reference"],rows));
  } else if (o.method === "rank") {
    results.push(table("Global rank screen on current staffing", ["Input", "Spearman ρ"], screen(setup).scores.map(row=>[row.label,row.rho])));
  } else if (linked) {
    results.push(table("Sobol diagnostic", ["Result"], [["Linked inputs do not support this independent-input Sobol decomposition. Compare matched outcomes or select a descriptive rank screen."] ]));
  } else {
    try {
      results.push(table("Independent-input Sobol screen on current staffing", ["Input", "First order", "Total order"], sobol(setup).map(row=>[row.label,row.first,row.total])));
    } catch (error) {
      if (error.message !== "Sobol indices require a varying output.") throw error;
      results.push(table("Sobol diagnostic", ["Result"], [["No output variation in the base sample. Use wait time or choose a threshold that produces both outcomes."]]));
    }
  }
  return {
    headline: "Staffing outcomes and sensitivity",
    text: `${linked ? "Linked guest and burst percentiles" : "Independent draws"} · ${o.count.toLocaleString()} matched samples · seed ${o.seed} · ${o.structure === "spread" ? "spread arrival model" : "full burst share"}. Sensitivity uses ${o.analysis === "event" ? "1 for waits above the limit and 0 otherwise" : "wait in minutes for one event"}.`,
    tables: results,
    charts: [plot("Guests (people)", "Wait proxy (minutes)", options.map((values,i)=>
      dots(`${o.team+i} volunteers`, sample.slice(0,100).map((row,j)=>[row[0],values[j]]))))],
  };
}

function benchmark({ load, payload, mode, seed }) {
  const cells = [2,load].flatMap(requests=>[2,payload].map(size=>[requests,size]));
  const evaluate = (requests,size) => {
    const shared = design("random",64,1,seed).map(([u])=>3*u);
    const a = mean(shared.map(noise=>20+1.4*requests+2*size+.7*requests*size+noise));
    const b = mean(shared.map(noise=>32+1.1*requests+size+.23*requests*size+noise));
    return [a,b,b-a];
  };
  const rows = (mode === "single" ? cells.slice(0,1) : cells).map(([requests,size])=>[requests,size,...evaluate(requests,size)]);
  return {
    headline: mode === "single" ? "One workload condition" : "Matched comparison at four workload settings",
    tables: [table("Predicted response times in a teaching model", ["Load (tens of requests/s)", "Payload (MB)", "A (ms)", "B (ms)", "B minus A (ms)"],rows)],
    charts: mode === "single" ? [] : [plot("Load (tens of requests per second)","B minus A (ms)",[2,payload].map(size=>
      line(`${size} MB`,[2,load].map(requests=>[requests,evaluate(requests,size)[2]]))).concat(line("Equal latency",[[2,0],[load,0]])))],
  };
}

function tuning({ budget, dataset, cost, seed }) {
  const validationLoss = (logRate, units) => {
    const target = dataset === "small" ? -2.8+.07*units : -2.1-.08*units;
    const bestSize = dataset === "small" ? 3 : 7;
    return .2+.12*(logRate-target)**2+.012*(units-bestSize)**2;
  };
  const candidates = design("lhs",budget,2,seed).map(([rate,size])=>{
    const logRate = -4 + 3*rate;
    const units = Math.round(1+7*size);
    return [10**logRate, units, validationLoss(logRate,units), 10+8*units];
  });
  const eligible = candidates.filter(row=>row[3]<=cost).sort((a,b)=>a[2]-b[2]);
  const best = eligible[0];
  return {
    headline: best ? "Lowest simulated validation loss within the time limit" : "No candidate fits the time limit",
    text: best ? undefined : "In Candidate runs in design order, check Training time (seconds) for the shortest trial. Increase Training time limit (seconds) or change Trial budget and run again to test more options.",
    tables: [
      ...(best ? [table("Selected by simulated validation score", ["Learning rate", "Model size", "Validation loss", "Training time (seconds)"], [best])] : []),
      table("Sensitivity at a shared reference (log learning rate −2.5, size 4)", ["Parameter", "Loss at low", "Loss at reference", "Loss at high"], [
        ["Log learning rate: −4 to −1",validationLoss(-4,4),validationLoss(-2.5,4),validationLoss(-1,4)],
        ["Model size: 1 to 8",validationLoss(-2.5,1),validationLoss(-2.5,4),validationLoss(-2.5,8)],
      ]),
      table("Candidate runs in design order", ["Learning rate", "Model size", "Validation loss", "Training time (seconds)"],candidates),
    ],
    charts: [plot("log₁₀ learning rate", "Validation loss", [
      dots("Meets time limit",eligible.map(([rate,,loss])=>[Math.log10(rate),loss])),
      dots("Exceeds time limit",candidates.filter(row=>row[3]>cost).map(([rate,,loss])=>[Math.log10(rate),loss])),
    ])],
  };
}

export const experiments = {
  questions, local, curves, tornado, inputs, designs, patterns, morris: trajectories,
  "interaction-lab": interaction, variance: varianceLab, "sobol-lab": sobolLab,
  dependence, reliability, stochastic, decisions, benchmark, tuning, capstone,
};
