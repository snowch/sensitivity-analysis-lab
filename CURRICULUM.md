# Curriculum audit and coverage

Audit of the four-lesson course at `2e08e41`. The source already included a seeded pipeline simulation, two fixed network ranges, a queue interaction, held-out permutation importance, exact Spearman and Sobol worked follow-ups, and a household-budget exercise. These were worth keeping as applications. The original sequence asked learners to interpret rankings before they could construct a model, choose an output, inspect response shapes or justify a design. The queue lesson jumped from a threshold to first- and total-order results. The household exercise gave learners a decision but limited changes to three predefined options. The catalogue below adds prerequisites and a second, editable transfer problem, with a route through the existing work.

| Requirement | Starting point and change | Evidence of completion |
| --- | --- | --- |
| Questions and decisions | Implicit question in pipeline and household examples. Teach methods by the questions they answer and distinguish uncertainty sources. | **Choose an output.** Choose a summary and show how equal means can hide different threshold risks. |
| Small models | No manual sensitivity calculation. Start with a journey cost and visible substitutions. | **Calculate a change.** Predict and check absolute, percentage, slope and elasticity results in two units. |
| Local methods | No local plots or step-size experiment. | **Explore a response**, **Build a tornado.** Vary the baseline and step, interpret response curves and compare endpoint spans with spider plots. |
| Input assumptions and design | Fixed distributions and a range comparison. | **Justify the inputs**, **Sample deliberately**, existing **Change the assumptions.** Edit distribution assumptions, inspect joint samples, compare random, Latin hypercube and randomized Halton designs. |
| Global screening | Spearman chart and standalone hand calculation. | **Look at the scatter**, **Walk a Morris trajectory**, then **Rank the knobs.** Compare correlations, regression and elementary effects on matched teaching models. |
| Interactions | Queue threshold taught without a manipulable small table. | **Change two inputs**, then **Find hidden interactions.** Calculate conditional differences, probe a grid and distinguish dependence from an interaction. |
| Variance and Sobol | Exact switches followed by prepared queue scores, without second order, dependence or tail analysis. | **Partition variance**, **Estimate Sobol indices**, **Share variance under dependence.** Derive conditional means, estimate and check first, pair and total orders, and explain a proxy’s Shapley effect. |
| Numerical and model credibility | Seeds and sample sizes available. | **Check numerical stability**, **Separate simulator noise.** Repeat designs, read sampling intervals and negative values, compare stochastic replication and challenge model structure. |
| Decisions | Matched household interventions and threshold risk. | **Compare decisions**, **Independent household practice.** Compare break-even, price of action and robustness under an alternative formula; compute the value of a perfect signal in a small decision. The benchmark and ML tuning lessons apply those distinctions to an evaluation budget and a constrained search. |
| Observed data | Strong starter on grouped permutation and held-out evaluation. | **Work from logs**, **Plan a fair test on real logs.** Run individual and grouped shuffles, explain split/leakage and error choice, distinguish importance, predictive Shapley explanations and treatment effects. |
| Independent application | Household task, saved notes and field guide. | **Capstone.** Specify an outcome and decision rule, edit a new event model, choose method and ranges, stress-test assumptions, and export evidence and a structured report. |

## Entry requirements and outcomes

Learners need arithmetic, percentages and browser navigation. The sequence introduces probability as fractions of possibilities, then treats variation numerically before using variance decomposition. No calculus or programming is required for essential work.

A learner completing the core and capstone can state an actionable question and justify the output; calculate and interpret a local effect with units and reference point; propose defensible input ranges and a dependence model; choose and challenge a screening or variance-based measure; recognise instability and distinguish it from structural uncertainty; and document a conditional recommendation with evidence that could overturn it. Each new activity separates the prepared setup, the learner’s action, the result to inspect and a revealable explanation. Optional calculations support depth without making the core path depend on them.

## Implementation decisions

Keep the existing browser worker, deployed URLs, generated data and local note keys. Build the new static pages from course content and an explicit route list. Centralise experiment controls, history, tables and chart rendering. Keep method implementations testable outside the browser. The capstone offers a bounded editable model and synthetic cases, so browser work needs no arbitrary code execution or server.

## Checks and scope

The repository tests exact fare changes and elasticity under unit conversion, a discontinuity, conditional interaction effects, Latin hypercube stratification, a U-shaped rank failure, Morris scores, exact switch decompositions, sampled Sobol estimates, repeated-design convergence, stochastic replication and matched decisions. The first-, pair- and total-order estimators were also compared with SALib using the same centred model evaluations. Correlations and standardised regression were checked against SciPy and NumPy.

The exercises use illustrative models and controlled synthetic data. The capstone supports a bounded editable simulator rather than arbitrary model upload. The benchmark and tuning labs teach experimental choices on synthetic surfaces. Scaling Shapley estimation to larger problems, running production optimisers and establishing causal intervention effects require additional tools and evidence. Functional checks are separate from a study of learning effectiveness.

## Learner wording and layout review

The review covers all 30 rendered pages, including the overview, bibliography, 18 generated investigations, five retained labs and five worked examples or notes. Instructions use the labels on the page and identify the result to compare. Earlier-run tables and plots support those comparisons. Optional drafts, exports, derivations and sources have separate disclosures.

The pipeline rank and household practice retain the specific comparisons their instructions ask for. A rare-event sample without variation is shown as a valid result with undefined estimates and the exact shares. Saved predictions, explanations, reports, recent capstone runs and legacy notes keep their original browser storage keys.

### Follow-up review of the published course

The opening pass checked the published `a376244` version from the stated starting point of arithmetic, percentages and browser navigation. It read the headings, setup, instructions, examples, optional references and visible feedback on all 30 pages. It compared every requested control, result and interpretation with the browser interface and teaching models. The closing pass used the same criteria on the revised pages.

| Review area | Revision and closing check |
| --- | --- |
| Prepared state and action | The sequenced lessons distinguish what the page prepares, what learners change and when they run. The field guide gives a runnable, optional Node.js edit with exact file, input and output columns. The household lesson names the two interventions to repeat in both seasons. |
| Definitions, interpretation and limitations | Learners can identify probabilities shown as fractions, read the ranks or delays the instructions name, and distinguish the toy models from measured jobs and actual training. The tuning lesson specifies the same untouched examples for comparing procedures. |
| Purpose of each comparison | The decision example isolates price from structure. The reliability comparison adds a larger design, and the staffing report varies arrival structure, service bounds, sample budget and seed separately. Results and explanations name the evidence and the question to answer. |
| Progression, width and optional material | The learner moves from a worked example and prediction to the experiment and its explanation. Run is the primary experiment action. Earlier settings and plots, worked solutions, draft fields, methods and exports have descriptive disclosures. The review checked reflow and keyboard access at four widths and in both themes. |
| Feedback and saved work | A changed or failed run identifies the result still on screen as earlier evidence. Generated investigations give its run number. A valid analysis without varying outputs keeps its explanatory result. Knowledge-check feedback stays with its question. Draft and run storage use separate messages. The old records reopen from their existing keys. If storage fails, a tab copy stays available to export. |

The browser walkthrough ran all 23 sequenced lessons and each stated variant, for 81 runs. It replayed the optional plot and export controls and checked the legacy questions. Node tests checked the numerical models. These checks establish that the tasks and comparisons work in the tested browser. Learning effectiveness remains unmeasured.
