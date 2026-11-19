export const sources = {
  saltelli: ["Saltelli et al. (2020), Five ways to ensure that models serve society", "https://www.nature.com/articles/d41586-020-01812-9", "Make assumptions visible and test uncertainty in the inference."],
  lhs: ["McKay, Beckman & Conover (1979), A comparison of three methods for selecting values of input variables", "https://doi.org/10.1080/00401706.1979.10489755", "Original comparison introducing Latin hypercube sampling."],
  qmc: ["SciPy documentation, Quasi-Monte Carlo", "https://docs.scipy.org/doc/scipy/reference/stats.qmc.html", "How sampling designs spread points and where they can struggle."],
  spearman: ["SciPy documentation, spearmanr", "https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.spearmanr.html", "How to interpret a rank correlation and handle ties."],
  regression: ["NIST Engineering Statistics Handbook, General linear least squares", "https://www.itl.nist.gov/div898/handbook/pmd/section4/pmd431.htm", "Fitting a linear mean model and documenting the model form."],
  morris: ["Morris (1991), Factorial sampling plans for preliminary computational experiments", "https://doi.org/10.1080/00401706.1991.10484804", "Elementary effects and trajectories for screening."],
  campolongo: ["Campolongo, Cariboni & Saltelli (2007), An effective screening design for sensitivity analysis of large models", "https://doi.org/10.1016/j.envsoft.2006.10.004", "Mean absolute elementary effects and spread-optimised trajectories."],
  sobol: ["Sobol (2001), Global sensitivity indices for nonlinear mathematical models", "https://doi.org/10.1016/S0378-4754(00)00270-6", "Independent-input decomposition and numerical estimates."],
  saltelli2009: ["Saltelli et al. (2010), Variance based sensitivity analysis of model output", "https://doi.org/10.1016/j.cpc.2009.09.018", "How to estimate first- and total-order Sobol indices from paired runs."],
  jansen: ["Jansen (1999), Analysis of variance designs for model output", "https://doi.org/10.1016/S0010-4655(98)00154-4", "Squared-difference variance estimation."],
  salib: ["SALib documentation, Sensitivity analysis methods", "https://salib.readthedocs.io/en/latest/api/SALib.analyze.html", "Established implementation and estimator, bootstrap and screening documentation."],
  owen: ["Owen & Prieur (2017), On Shapley value for measuring importance of dependent inputs", "https://arxiv.org/abs/1610.02080", "Variance allocation under dependence and examples of shared information."],
  song: ["Song, Nelson & Staum (2016), Shapley effects for global sensitivity analysis", "https://doi.org/10.1137/15M1048070", "Theory, computation and conditional simulation tradeoffs."],
  stochastic: ["Marrel et al. (2012), Global sensitivity analysis of stochastic computer models with joint metamodels", "https://doi.org/10.1007/s11222-011-9274-8", "How to distinguish changes in the average response from noise within a setting."],
  voi: ["Wilson (2015), Value of information analysis", "https://doi.org/10.1007/s40273-014-0219-x", "Express the decision in losses and compare actions with and without information."],
  permutation: ["scikit-learn documentation, Permutation feature importance", "https://scikit-learn.org/stable/modules/permutation_importance.html", "Held-out evaluation, model dependence and correlated columns."],
  randomsearch: ["Bergstra & Bengio (2012), Random search for hyper-parameter optimization", "https://jmlr.org/papers/v13/bergstra12a.html", "Search budgets and different relevance of hyperparameters across datasets."],
  validation: ["scikit-learn documentation, Nested versus non-nested cross-validation", "https://scikit-learn.org/stable/auto_examples/model_selection/plot_nested_cross_validation_iris.html", "Separate model selection from evaluating the selection procedure."],
  shap: ["Lundberg & Lee (2017), A unified approach to interpreting model predictions", "https://proceedings.neurips.cc/paper/2017/hash/8a20a8621978632d76c43dfd28b67767-Abstract.html", "Shapley-based explanations of individual predictions relative to a reference."],
};

export const sourceLink = key => {
  const [label, url] = sources[key];
  return `<a href="${url}">${label}</a>`;
};

export const sourceGroups = [
  ["Input assumptions and sampling", ["saltelli", "lhs", "qmc"]],
  ["Screening and variance", ["spearman", "regression", "morris", "campolongo", "sobol", "saltelli2009", "jansen", "salib", "owen", "song"]],
  ["Reliability and decisions", ["stochastic", "voi", "randomsearch", "validation", "permutation", "shap"]],
];
