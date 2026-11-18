# Cutting Through the Noise: Sensitivity Analysis & Attribution

[Open the Sensitivity Analysis Lab](https://snowch.github.io/sensitivity-analysis-lab/)

A pipeline is running slowly. You have time to investigate two inputs. Pick the drivers, challenge your ranking, and design one test you could run. The core path takes about 12 minutes and runs entirely in your browser.

| Investigation | Try it |
| --- | --- |
| **Rank the knobs** · 3 min | Screen 13 inputs with Monte Carlo simulation and a signed Spearman chart. |
| **Break the ranking** · 4 min | Widen one input range and switch on a queue interaction. Compare first-order and total-order Sobol indices. |
| **Work from logs** · 5 min | Predict latency from 10,000 synthetic runs. Compare individual and grouped permutation importance on held-out data. Download the same runs as CSV. |

The pipeline inputs, queue rule and log observations are synthetic. Inspect the assumed ranges and experiment source in the lab. Worked explanations are available after each investigation.

## Run locally

From the repository root, serve the files with Python and open [localhost:8000](http://localhost:8000/).

```sh
python3 -m http.server 8000
```

The three modules use JavaScript and a Web Worker. No package installation or external runtime is needed. To generate the exact CSV used by the lab from a terminal with Node.js installed:

```sh
node --input-type=module -e 'import {makeLogs, toCsv} from "./assets/logs.mjs"; process.stdout.write(toCsv(makeLogs()))' > pipeline-runs.csv
```

## Related labs

- Browser experiments and reproducible draws. [Monte Carlo Lab](https://snowch.github.io/monte-carlo-lab/)
- Predictions and evidence checks. [Scientific Method Lab](https://snowch.github.io/scientific-method-lab/)
- Traceable ranges and model assumptions. [Sizing & TCO Lab](https://snowch.github.io/sizing/)
