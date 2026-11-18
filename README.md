# Cutting Through the Noise: Sensitivity Analysis & Attribution

[Start the course](https://snowch.github.io/sensitivity-analysis-lab/)

Learn to screen many inputs, challenge what you assumed, recognise interactions, and distinguish predictive evidence from the effect of a change. The course teaches each method on a data pipeline, then asks you to apply the techniques to a household electricity budget. Allow about 60–90 minutes including independent practice. You can spread the lessons across sessions.

| Lesson | What you’ll practise |
| --- | --- |
| [Rank the knobs](https://snowch.github.io/sensitivity-analysis-lab/rank.html) | Monte Carlo sampling and Spearman rank correlation |
| [Change the assumptions](https://snowch.github.io/sensitivity-analysis-lab/ranges.html) | Range sensitivity, distributions and dependence |
| [Find hidden interactions](https://snowch.github.io/sensitivity-analysis-lab/interactions.html) | First- and total-order Sobol indices |
| [Work from logs](https://snowch.github.io/sensitivity-analysis-lab/logs.html) | Held-out evaluation and individual or grouped permutation importance |
| [Independent practice](https://snowch.github.io/sensitivity-analysis-lab/practice.html) | Choose methods, test interventions against a budget criterion, and check a written recommendation against a rubric |
| [Field guide](https://snowch.github.io/sensitivity-analysis-lab/apply.html) | Frame and investigate a question of your own |

The course includes separate worked follow-ups on Spearman scores, Sobol indices and testing predictors on real logs. The models and datasets are illustrative. Read the worked calculations and assumptions in each lesson. No programming or statistics course is required.

## Run locally

From the repository root, serve the files with Python and open [localhost:8000](http://localhost:8000/).

```sh
python3 -m http.server 8000
```

The browser uses JavaScript and a Web Worker. Node.js is optional for running a small, adaptable [analysis example](assets/energy-example.mjs) and generating the same CSVs used by the lab.

```sh
node assets/energy-example.mjs
node --input-type=module -e 'import {makeLogs, toCsv} from "./assets/logs.mjs"; process.stdout.write(toCsv(makeLogs()))' > pipeline-runs.csv
node --input-type=module -e 'import {energyCsv} from "./assets/energy.mjs"; process.stdout.write(energyCsv())' > household-energy-runs.csv
```

## Related labs

- Browser experiments and reproducible draws. [Monte Carlo Lab](https://snowch.github.io/monte-carlo-lab/)
- Predictions and evidence checks. [Scientific Method Lab](https://snowch.github.io/scientific-method-lab/)
- Traceable ranges and model assumptions. [Sizing & TCO Lab](https://snowch.github.io/sizing/)
