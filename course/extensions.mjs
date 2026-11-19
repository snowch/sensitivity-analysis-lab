import { number, select, seed, when } from "./foundations.mjs";

export const extensions = {
  benchmark: {
    goal: "Choose benchmark conditions by asking where the comparison could change.",
    concept: `<h2>Find conditions where the comparison changes</h2>
    <p>A benchmark compares systems under a defined workload. Here the workload depends on requests per second and payload size. Sample combinations of both if load affects small and large requests differently. One average workload can hide where the systems trade places.</p>
    <h2>Make a fair comparison</h2>
    <p>You can study each system’s response time or compare <strong>B minus A</strong>. A delay can affect both systems equally and cancel in their difference.</p>
    <p>In a real test, give both systems the same workloads. Vary the test order, for example by running A first in half the pairs. Repeat runs to measure noise. Record the test machine, cache state and workloads so others can tell which conditions you checked.</p>`,
    example: `<p>Set load to 2 (20 requests per second) and payload to 2 MB.</p>
    <ul>
      <li><strong>A’s base time.</strong> 20 + 1.4 × 2 + 2 × 2 + 0.7 × 2 × 2 = 29.6 ms.</li>
      <li><strong>B’s base time.</strong> 32 + 1.1 × 2 + 2 + 0.23 × 2 × 2 = 37.12 ms.</li>
    </ul>
    <p>B minus A is +7.52 ms. A is quicker here. A delay added to both times cancels when you subtract.</p>`,
    setup: "The two timing formulas are illustrative. For each selected workload, the page calculates 64 pairs of response times. Each pair adds the same random delay to both systems. The table contains averages. In a real benchmark, repeat under independent or carefully matched conditions and report measurement error.",
    fields:[select("mode","Workload design","single",[["single","One low-load, small-payload setting"],["grid","Cross load and payload"]]),when(number("load","High load (tens of requests/s)",8,3,20),"mode","grid"),when(number("payload","Large payload (MB)",8,3,20),"mode","grid"),seed],
    predict:"Would the result at low load and small payload justify keeping either condition fixed?",
    steps:["With <strong>Workload design</strong> set to <strong>One low-load, small-payload setting</strong>, select <strong>Run experiment</strong>. In <strong>Predicted response times in a teaching model</strong>, compare <strong>A (ms)</strong> and <strong>B (ms)</strong>. Which system is faster here?","Set <strong>Workload design</strong> to <strong>Cross load and payload</strong> and run again. Find a row where <strong>B minus A (ms)</strong> is negative. Read that row’s <strong>Load (tens of requests/s)</strong> and <strong>Payload (MB)</strong>. In the plot, find which workload puts B minus A below zero.","Set <strong>High load (tens of requests/s)</strong> and <strong>Large payload (MB)</strong> to 3 and run again. Read <strong>B minus A (ms)</strong> in all four rows. Does narrowing the range keep the sign the same for every workload?"],
    task:"Design a real benchmark to test the reversal. State which settings you vary together, which you hold fixed and how you would make the comparison fair.",
    answer:"At high load and large payload B wins in the illustrative formula, though A wins at the low setting. Include a crossed design spanning plausible loads and sizes. Match request contents for both systems. Control software versions and hardware, vary execution order and repeat enough to check thermal, cache and scheduling effects.",
    refs:["saltelli"],
  },
  tuning: {
    goal:"Use sensitivity to plan where to search and optimisation to choose a feasible setting.",
    concept:`<h2>Choose which settings to vary</h2>
    <p>A <strong>hyperparameter</strong> is a setting you choose before fitting a machine learning model. For example, the learning rate sets how far the model adjusts at each training step.</p>
    <p>A sensitivity study helps decide where to spend trials. If a setting barely changes prediction error across the range you tested, you might hold it fixed. Check whether that holds at other settings or on other data. Optimisation then searches for the best configuration that fits the training budget.</p>
    <h2>Measure performance on fresh examples</h2>
    <ul>
      <li><strong>Training set.</strong> Use these examples to fit the model.</li>
      <li><strong>Validation set.</strong> Compare configurations on examples held back during fitting. <strong>Validation loss</strong> measures prediction error on these examples. Lower is better here.</li>
      <li><strong>Test set.</strong> Evaluate the chosen configuration on examples held back from both fitting and tuning. If comparing tuning procedures, use the same untouched test examples for both.</li>
    </ul>
    <p>A procedure can appear better because it fit quirks in one validation set. When results vary across splits or training seeds, repeat the comparison.</p>`,
    example:`<p>Increase the learning rate from 0.001 to 0.01. The effect on validation loss depends on model size.</p>
    <ul>
      <li><strong>Size 3.</strong> Loss drops from 0.36 to 0.24, an improvement of 0.12.</li>
      <li><strong>Size 7.</strong> Loss drops from 0.39 to 0.38, an improvement of 0.01.</li>
    </ul>
    <p>The effect of the learning rate depends on size in this example. If the 0.24 candidate takes 34 seconds and the budget is 30 seconds, look for the best candidate among trials that fit the budget.</p>`,
    setup:"The page calculates loss from an illustrative formula. It samples base-ten log learning rates between −4 and −1 and a model size index from 1 to 8. The index represents smaller and larger configurations in this example. Moving the log learning rate up by one multiplies the learning rate by ten. For example, −3 means 0.001 and −2 means 0.01. The two dataset settings change which combinations yield lower loss in the formula. The page selects the lowest simulated validation loss among trials that meet the time limit.",
    fields:[select("budget","Trial budget",12,[4,12,32,64],true),select("dataset","Dataset regime","small",[["small","Small sample"],["large","Large sample"]]),number("cost","Training time limit (seconds)",45,16,90),seed],
    predict:"Will the lowest-loss candidate always satisfy the time limit or stay best on another dataset?",
    steps:["Select <strong>Run experiment</strong> with the starting settings. In <strong>Sensitivity at a shared reference</strong>, compare <strong>Loss at low</strong> and <strong>Loss at high</strong> with <strong>Loss at reference</strong>. The page changes one setting at a time for that table. In <strong>Candidate runs in design order</strong>, check whether a lower-loss candidate exceeds the time limit.","Increase <strong>Trial budget</strong> to 32 and select <strong>Run experiment</strong> again. In <strong>Selected by simulated validation score</strong>, compare <strong>Validation loss</strong> and <strong>Training time (seconds)</strong> with the first run. The larger design has its own set of candidates. Did the new choice improve the loss within the limit?","Set <strong>Dataset regime</strong> to <strong>Large sample</strong> and run again, keeping the trial budget and time limit fixed. Compare the <strong>Model size</strong> and <strong>Learning rate</strong> of the two selected trials. In <strong>Sensitivity at a shared reference</strong>, find which endpoint loss changes most. Would you reuse the earlier settings?"],
    task:"Outline a tuning plan. Name the settings you would vary first, how many runs you would spend, and which data you would set aside for the final evaluation.",
    answer:"Screen plausible log-scale rates and sizes jointly with validation splits and multiple seeds. Search where evidence suggests room for improvement while keeping cost and interaction in view. Select using validation only, then estimate final performance on untouched test data and report the tuning budget and conditions.",
    refs:["randomsearch","validation"],
  },
};
