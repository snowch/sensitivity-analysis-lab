# Cutting Through the Noise: Sensitivity Analysis & Attribution

[Start the browser course](https://snowch.github.io/sensitivity-analysis-lab/) · [Curriculum audit and coverage](CURRICULUM.md)

A self-paced course in four units. Start with arithmetic and a simple fare model, then decide what to measure, choose how to vary inputs, test numerical reliability, and defend an analysis in an editable event-staffing capstone. The pipeline and household examples carry the methods into practical decisions. Two applied lessons cover benchmark design and hyperparameter optimisation. No programming or calculus is required for the browser lessons.

| Unit | What you’ll do |
| --- | --- |
| Frame a question and measure a change | Choose an outcome, calculate slopes and elasticities, and interpret response curves and one-at-a-time plots. |
| Build a defensible experiment | Choose ranges, distribution shapes and dependence. Compare sample designs, regression, correlations and Morris elementary effects. |
| Understand interactions and variance | Read joint responses, derive exact Sobol indices, check estimates and allocate shared variance under dependence. |
| Test reliability and make a decision | Separate numerical, structural and simulator uncertainty. Compare interventions and benchmarks, examine predictive attribution and complete a capstone report. |

## Build and verify

The repository has no runtime package dependencies. Use Node.js 20 or newer for local builds and tests. Pages are rendered into `_site/` for deployment.

```sh
npm ci
npm test
npm run build
python3 -m http.server 8000 --directory _site
```

Open [localhost:8000](http://localhost:8000/). Use the lesson declarations in `course/` for new content and the published legacy HTML files for the original exercises. The generated pages use the same design and preserve the deployed links and previous notes. The worker runs the numerical experiments in the browser.

The models, data and validation surfaces are illustrative. The course links references next to the relevant method. The capstone offers editable assumptions for a bounded model and exports a draft plus numerical evidence. Text drafts and up to six capstone runs stay in browser storage. The other experiments keep recent runs on the page and offer CSV download.

## Reuse the examples

```sh
node assets/energy-example.mjs
node --input-type=module -e 'import {makeLogs, toCsv} from "./assets/logs.mjs"; process.stdout.write(toCsv(makeLogs()))' > pipeline-runs.csv
node --input-type=module -e 'import {energyCsv} from "./assets/energy.mjs"; process.stdout.write(energyCsv())' > household-energy-runs.csv
```

The [field guide](https://snowch.github.io/sensitivity-analysis-lab/apply.html) helps select a method for a question of your own. For further practice, see [Monte Carlo Lab](https://snowch.github.io/monte-carlo-lab/), [Scientific Method Lab](https://snowch.github.io/scientific-method-lab/) and [Sizing & TCO Lab](https://snowch.github.io/sizing/).

## Offline access

Open App status and choose **Save offline copy** before disconnecting. Wait for **Downloaded and ready to use offline**. The complete course includes all lessons and experiment workers; its CSV and report exports work offline. External reference websites need internet access. Online version checks are automatic and do not download the full course.

Use **Update offline copy**, then **Restart to update**, to replace the saved version without discarding open work. Notes, settings and recorded results are restored; experiments are never rerun automatically. See [the offline design and verification](docs/offline-update-design.md).

Run `npm run test:browser` after building to test real offline lessons and guarded updates. Set `CHROMIUM` to a Chromium executable, or use `npx playwright install --with-deps chromium` to install the pinned browser for CI.
