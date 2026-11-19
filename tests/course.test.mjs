import { test } from "node:test";
import assert from "node:assert/strict";
import { experiments, eventWait } from "../assets/course-experiments.mjs";
import {
  binaryDistribution, conditionalShares, continuousModel, design, estimatedNoise, inverseInput,
  morris, pairSobol, pearson, radicalInverse, tiedRanks, twoInputRegression,
} from "../assets/course-math.mjs";

const near = (actual, expected, tolerance = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `Expected ${actual} within ${tolerance} of ${expected}`);

test("local changes retain physical units and elasticity on the same fare", () => {
  const run = units => Object.fromEntries(experiments.local({ distance: 4, rate: 2, step: 1, units }).tables[0].rows);
  const km = run("km"), metres = run("m");
  assert.equal(km["Reference cost ($)"], 12);
  assert.equal(km["New cost ($)"], 14);
  near(km["Slope ($/km)"], 2);
  near(metres["Slope ($/m)"], .002);
  near(km["Elasticity (no units)"], 2/3);
  near(km["Elasticity (no units)"], metres["Elasticity (no units)"]);
});

test("finite difference spans a discontinuity and a regime can hide an interaction", () => {
  const difference = experiments.curves({ shape: "threshold", baseline: 4.9, step: .1 }).tables[0].rows[0];
  near(difference.at(-1), 51);
  const effects = (model, high) => experiments["interaction-lab"]({ model, regime: 5, low: 4, high }).tables[0].rows.at(-1);
  assert.deepEqual(effects("add", 6).slice(1), [2,2]);
  assert.deepEqual(effects("regime", 6).slice(1), [2,7]);
});

test("Latin hypercube stratifies each marginal and design seeds reproduce exactly", () => {
  const points = design("lhs", 37, 3, 88);
  for (let i = 0; i < 3; i++) assert.equal(new Set(points.map(p => Math.floor(37*p[i]))).size,37);
  assert.deepEqual(design("halton", 64, 2, 23), design("halton", 64, 2, 23));
  assert.deepEqual([1,2,3,4].map(i=>radicalInverse(i,2)),[.5,.25,.75,.125]);
  near(inverseInput(.25,40,100,"triangle"),55);
});

test("a deterministic U-shaped effect has zero signed correlation", () => {
  const input = [-2,-1,0,1,2];
  const output = input.map(x=>x*x);
  near(pearson(input,output),0);
  near(pearson(tiedRanks(input),tiedRanks(output)),0);
  assert.equal(new Set(output).size,3);
  const x = [-1,-1,1,1], z = [-1,1,-1,1];
  const [bx,bz,r2] = twoInputRegression(x,z,x.map((value,i)=>3*value+z[i]));
  near(bx,3/Math.sqrt(10));
  near(bz,1/Math.sqrt(10));
  near(r2,1);
});

test("Morris recovers additive slopes and detects varying effects from curvature and interaction", () => {
  const additive = morris(([x,z,w])=>3*x+z+.5*w,3,64,42);
  assert.equal(additive.path.length,4);
  additive.scores.forEach(([mu,star,sd],i)=>{
    near(mu,[3,1,.5][i]); near(star,mu); near(sd,0);
  });
  assert.ok(morris(([x,z])=>3*x*x+z,2,64,42).scores[0][2]>.5);
  assert.ok(morris(([x,z])=>3*x*z+z,2,64,42).scores[0][2]>.5);
});

test("exact switches recover the independent interaction and dependent proxy credit", () => {
  const exact = conditionalShares(binaryDistribution(.5,(x,z)=>x*z));
  near(exact.average,.25);
  near(exact.total,3/16);
  near(exact.shares[0],1/3);
  near(1-exact.shares[0]-exact.shares[1],1/3);
  const proxy = conditionalShares(binaryDistribution(.9,(_,z)=>z));
  near(proxy.shapley[0],.32);
  near(proxy.shapley[1],.68);
});

test("sampled indices agree with analytic additive and product benchmarks", () => {
  for (const [model, first, total, second] of [
    ["add",[.2,.8],[.2,.8],0],
    ["product",[3/7,3/7],[4/7,4/7],1/7],
  ]) {
    const result=pairSobol(row=>continuousModel(model,row),32768,207);
    for (let i=0;i<2;i++) {
      near(result.first[i],first[i],.025);
      near(result.total[i],total[i],.025);
    }
    near(result.pair,second,.04);
  }
});

test("signed second-order estimates converge across a repeated design rather than a lucky seed", () => {
  const {rows}=experiments.reliability({count:256,seed:42,model:"add"}).tables[0];
  const [small,,large]=rows;
  assert.ok(small[4]>0 && small[4]<20);
  assert.ok(large[3]-large[2] < .6*(small[3]-small[2]));
  const raw=pairSobol(row=>continuousModel("tail",row),32768,42);
  const event=pairSobol(row=>Number(continuousModel("tail",row)>14),32768,42);
  assert.ok(raw.total[0]>raw.total[1]);
  near(event.total[0],0);
  near(event.total[1],1,.08);
});

test("stochastic replication reuses input settings and recovers the no-noise identity", () => {
  const a=estimatedNoise(4,4,42);
  const b=estimatedNoise(4,16,42);
  assert.deepEqual(a.groups.map(row=>row.x), b.groups.map(row=>row.x));
  near(b.within,16,2);
  const noiseless=estimatedNoise(0,16,42);
  near(noiseless.within,0);
  near(noiseless.signal,noiseless.between);
});

test("decisions match across interventions and reveal benchmark reversals", () => {
  const args={premium:.12,loss:15,risk:.25,structure:"simple",seed:42,threshold:14};
  const [options,,information]=experiments.decisions(args).tables;
  assert.equal(options.rows[0][2], options.rows[1][2]);
  assert.equal(options.rows[2][2],0);
  near(information.rows[0].at(-1),10.5);
  assert.ok(experiments.decisions({...args,structure:"spill"}).tables[0].rows[2][2] > options.rows[0][2]);
  const grid=experiments.benchmark({load:8,payload:8,mode:"grid",seed:42}).tables[0].rows;
  near(grid[0].at(-1),7.52);
  assert.ok(grid.at(-1).at(-1)<0);
  const tuning=experiments.tuning({budget:12,dataset:"small",cost:45,seed:42}).tables;
  const [best]=tuning[0].rows;
  assert.equal(best[2], Math.min(...tuning[2].rows.filter(row=>row[3]<=45).map(row=>row[2])));
});

test("capstone preserves matching, handles dependence and enforces a coherent range", () => {
  near(eventWait([160,30,.75],2,"peak"),30);
  near(eventWait([160,30,.75],3,"peak"),10);
  const base={guestsLow:60,guestsHigh:160,serviceLow:20,serviceHigh:40,burstLow:.3,burstHigh:.8,
    shape:"uniform",dependence:"independent",team:2,shiftCost:25,limit:10,summary:"Exceedance probability",
    analysis:"wait",method:"rank",structure:"peak",count:1024,seed:42};
  const simulated=experiments.capstone(base).tables[0].rows;
  near(simulated[0].at(-1),238/1024);
  near(simulated[1].at(-1),31/1024);
  assert.ok(experiments.capstone({...base,serviceLow:12}).tables[0].rows[1].at(-1)>.1);
  assert.match(experiments.capstone({...base,dependence:"linked",method:"sobol"}).tables[2].rows[0][0],/Linked inputs/);
  assert.throws(()=>experiments.capstone({...base,guestsLow:200}),/lower bound/);
});
