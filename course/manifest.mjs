export const units = [
  ["Frame a question and measure a change", [
    ["questions", "Choose an output", "Match a decision to a mean, percentile or threshold risk."],
    ["local", "Calculate a change", "Work out a slope, elasticity and the effect of switching units."],
    ["curves", "Explore a response", "Compare local slopes, thresholds and changes in direction."],
    ["tornado", "Build a tornado", "Compare one-at-a-time spans and read a spider plot."],
  ]],
  ["Build a defensible experiment", [
    ["inputs", "Justify the inputs", "Compare distributions and examine which input pairs can occur."],
    ["ranges", "Change the assumptions", "Use matched pipeline runs to see a ranking reverse."],
    ["designs", "Sample deliberately", "Compare random, Latin hypercube and shifted Halton designs."],
    ["patterns", "Look at the scatter", "Compare Pearson, Spearman and a standardised regression."],
    ["morris", "Walk a Morris trajectory", "Use elementary effects to screen many inputs."],
    ["rank", "Rank the pipeline inputs", "Apply a rank screen to the technical case."],
  ]],
  ["Understand interactions and variance", [
    ["interaction-lab", "Change two inputs", "Read a heatmap and compare slopes in different regimes."],
    ["variance", "Partition variance", "Calculate conditional means and exact indices from four outcomes."],
    ["sobol-lab", "Estimate Sobol indices", "Estimate first, pair and total orders and compare against exact results."],
    ["interactions", "Find the pipeline interaction", "Compare Spearman, Sobol and p95 when a queue penalty switches on."],
    ["dependence", "Share variance under dependence", "Calculate exact Shapley effects in a two-input model."],
  ]],
  ["Test reliability and make a decision", [
    ["reliability", "Check numerical stability", "Repeat designs and compare signed estimates across sample sizes."],
    ["stochastic", "Separate simulator noise", "Use repeated evaluations at the same input to partition variation."],
    ["decisions", "Compare decisions", "Compare costs, break-even points, tail risk and value of information."],
    ["benchmark", "Choose what to vary in a benchmark", "Find where workload conditions reverse a comparison."],
    ["tuning", "Spend an ML tuning budget", "Distinguish a sensitive hyperparameter from a good configuration."],
    ["logs", "Work from logs", "On unseen pipeline runs, compare individual and grouped permutation importance."],
    ["practice", "Independent household practice", "Choose methods and defend a budget recommendation across scenarios."],
    ["capstone", "Conduct your own analysis", "Choose assumptions, run checks and export a defensible report."],
  ]],
];

export const route = units.flatMap(([, pages]) => pages);
export const references = [
  ["spearman-calculation", "Calculate Spearman by hand"],
  ["sobol-calculation", "Calculate Sobol indices for two switches"],
  ["predictive-attribution", "Plan a fair test on real logs"],
  ["apply", "Apply it to your own question"],
  ["references", "Bibliography"],
];
