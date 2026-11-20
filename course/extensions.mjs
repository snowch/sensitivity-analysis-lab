import { number, select, seed, when } from "./foundations.mjs";

export const extensions = {
  benchmark: {
    experimentTitle: "Compare two systems on the same workload",
    goal: "Choose benchmark conditions by asking where the comparison could change.",
    concept: `<h2>Find conditions where the comparison changes</h2>
    <p>A benchmark compares systems under a defined workload. Here the workload depends on requests per second and payload size. Sample combinations of both if load affects small and large requests differently. Testing only one workload can miss cases where A responds faster at one combination of load and payload while B responds faster at another.</p>
    <h2>Make a fair comparison</h2>
    <p>You can study each system’s response time or compare <strong>B minus A</strong>. A delay can affect both systems equally and cancel in their difference.</p>
    <p>In a real test, give both systems the same workloads. Vary the test order, for example by running A first in half the pairs. Repeat runs to measure noise. Record the test machine, cache state and workloads so others can tell which conditions you checked.</p>`,
    example: `<p>The prepared low-workload case uses 20 requests per second and a 2 MB payload. The formulas express load in tens of requests per second, so substitute 2 for load and 2 for payload.</p>
    <ul>
      <li><strong>A’s base time.</strong> 20 + 1.4 × 2 + 2 × 2 + 0.7 × 2 × 2 = 29.6 ms.</li>
      <li><strong>B’s base time.</strong> 32 + 1.1 × 2 + 2 + 0.23 × 2 × 2 = 37.12 ms.</li>
    </ul>
    <p>B minus A is +7.52 ms. A is quicker here. A delay added to both times cancels when you subtract.</p>`,
    setup: "The page starts with the one low-load, small-payload case. For each workload, the teaching model adds the same random delay to A and B in each of 64 paired runs. The table reports the two average times and their difference.",
    fields:[select("mode","Workload design","single",[["single","One low-load, small-payload setting"],["grid","Cross load and payload"]]),when(number("load","High load (tens of requests/s)",8,3,20),"mode","grid"),when(number("payload","Large payload (MB)",8,3,20),"mode","grid"),seed],
    predict:"Would the result at low load and small payload justify keeping either condition fixed?",
    read: "In <strong>Predicted response times in a teaching model</strong>, compare <strong>A (ms)</strong> and <strong>B (ms)</strong>. Which system is faster at this workload?",
    steps: ["Set <strong>Workload design</strong> to <strong>Cross load and payload</strong>. The page shows <strong>High load (tens of requests/s)</strong> and <strong>Large payload (MB)</strong>, both at 8. Run again. Find a row where <strong>B minus A (ms)</strong> is negative and read its load and payload. Which system is faster there?","Set <strong>High load (tens of requests/s)</strong> and <strong>Large payload (MB)</strong> to 3 and run again. Read <strong>B minus A (ms)</strong> in all four rows. Does either system win at every workload in this narrower range?"],
    task:"Design a real benchmark to test whether A has lower response times at low load with a small payload, while B has lower response times at high load with a large payload. State which settings you vary together, which you hold fixed and how you would make the comparison fair.",
    answer:"At high load and large payload B wins in the illustrative formula, though A wins at the low setting. Include a crossed design spanning plausible loads and sizes. Match request contents for both systems. Keep hardware and software versions fixed and vary which system runs first. Decide the smallest response-time difference that would change your choice. In a real benchmark, repeat paired measurements at each workload. Report the mean of B minus A and an uncertainty interval for that mean. Collect more pairs if the interval spans differences that would lead to different choices.",
    refs:["saltelli"],
  },
  tuning: {
    experimentTitle: "Search within a training budget",
    goal:"Use sensitivity to plan where to search and optimisation to choose a feasible setting.",
    concept:`<h2>Choose which settings to vary</h2>
    <p>A <strong>hyperparameter</strong> is a setting you choose before fitting a machine learning model. For example, the learning rate sets how far the model adjusts at each training step.</p>
    <p>Before spending more trials on a setting, compare its effect on validation loss with the spread of losses across training seeds or validation splits. Prioritise settings that can change which configuration you would choose within the time limit.</p>
    <p>Check learning rates at several plausible model sizes. If changing the rate gives little repeatable improvement in validation loss, fix it and use the trials to compare more sizes. Keep varying the rate if it improves loss enough to change your choice at a size you might select. Optimisation searches for the lowest-loss configuration within the budget.</p>
    <h2>Measure performance on fresh examples</h2>
    <ul>
      <li><strong>Training set.</strong> Use these examples to fit the model.</li>
      <li><strong>Validation set.</strong> Compare configurations on examples held back during fitting. <strong>Validation loss</strong> measures prediction error on these examples. Lower is better here.</li>
      <li><strong>Test set.</strong> Evaluate the chosen configuration on examples held back from both fitting and tuning. If comparing tuning procedures, use the same untouched test examples for both.</li>
    </ul>
    <p>A procedure can appear better because it fit quirks in one validation set. When results vary across splits or training seeds, repeat the comparison.</p>`,
    example:`<p>Suppose two trial pairs compare learning rates of 0.001 and 0.01. Hold model size fixed within each pair.</p>
    <ul>
      <li><strong>Size 3.</strong> Loss drops from 0.36 to 0.24, an improvement of 0.12.</li>
      <li><strong>Size 7.</strong> Loss drops from 0.39 to 0.38, an improvement of 0.01.</li>
    </ul>
    <p>The effect of the learning rate depends on size in this example. If the 0.24 candidate takes 34 seconds and the budget is 30 seconds, look for the best candidate among trials that fit the budget.</p>`,
    setup:"The page computes loss and training time from illustrative formulas. It samples model sizes 1–8 and learning rates from 0.0001 to 0.1 on a base-10 log scale. Each step of 1 on that scale multiplies the rate by 10. The page selects the lowest simulated loss among trials that fit the time limit.",
    fields:[select("budget","Trial budget",12,[4,12,32,64],true),select("dataset","Dataset regime","small",[["small","Small sample"],["large","Large sample"]]),number("cost","Training time limit (seconds)",45,16,90),seed],
    predict:"Will the lowest-loss candidate always satisfy the time limit or stay best on another dataset?",
    read: "In <strong>Sensitivity at a shared reference</strong>, compare <strong>Loss at low</strong> and <strong>Loss at high</strong> with <strong>Loss at reference</strong> for each parameter. Which change moves the loss most? In <strong>Selected by simulated validation score</strong>, find the chosen <strong>Validation loss</strong> and <strong>Training time (seconds)</strong>.",
    steps: ["Set <strong>Trial budget</strong> to 32 and run again. Open the first run under <strong>Earlier runs</strong> and compare <strong>Validation loss</strong> and <strong>Training time (seconds)</strong> in <strong>Selected by simulated validation score</strong>. The 32-trial design draws a fresh set of candidates. Does it give a lower loss within the time limit?","Set <strong>Dataset regime</strong> to <strong>Large sample</strong>. Keep <strong>Trial budget</strong> at 32 and <strong>Training time limit (seconds)</strong> at 45. Run again. Compare the selected <strong>Model size</strong> and <strong>Learning rate</strong> with the preceding run. In <strong>Candidate runs in design order</strong>, find trials with a <strong>Validation loss</strong> below that of the selected trial. Does any of those trials have a <strong>Training time (seconds)</strong> above 45?"],
    task:"Outline a tuning plan. Name the settings you would vary first, how many runs you would spend, and which data you would set aside for the final evaluation.",
    answer:"With seed 42 on Small sample, the selected loss is about 0.202 in 34 seconds at 12 trials and about 0.212 in 42 seconds at 32 trials. The larger design can miss a good candidate from the smaller one. On Large sample, one excluded trial scores about 0.264 at 50 seconds, below the selected loss of about 0.310. For a real search, vary plausible rates and sizes together. Compare configurations on validation data and reserve untouched test data for final evaluation.",
    refs:["randomsearch","validation"],
  },
};
