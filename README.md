# Cutting Through the Noise: Sensitivity Analysis & Attribution

[Open the Sensitivity Analysis Lab](https://snowch.github.io/sensitivity-analysis-lab/)

When a system slows down, you need a way to choose which inputs are worth investigating. Use one pipeline to screen candidate drivers, challenge your ranking, and design a controlled test. Start with the introduction and prerequisites, then follow the three browser lessons in order. Allow about 20 minutes. Bring basic comfort reading tables and charts. The lab teaches the statistics it uses and requires no coding.

| Investigation | Try it |
| --- | --- |
| **Rank the knobs** · 5 min | Screen 13 inputs with Monte Carlo simulation and a signed Spearman chart. |
| **Break the ranking** · 7 min | Widen one input range and switch on a queue interaction. Compare first-order and total-order Sobol indices. |
| **Work from logs** · 8 min | Predict latency from 10,000 synthetic runs. Compare individual and grouped permutation importance on held-out data. Download the same runs as CSV. |

The pipeline inputs, queue rule and log observations are synthetic. Inspect the assumed ranges and experiment source in the lab. Each lesson introduces the method with a worked example, gives you a short investigation, and provides feedback on a reasoning question.

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
