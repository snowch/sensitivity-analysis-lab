import { number, select, seed, when } from "./foundations.mjs";
import { benchmarkSizingWorkflow, kafkaSizingDiagram, tuningDiagram, tuningRelationshipDiagram } from "./concept-diagrams.mjs";

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
    followup: `<section class="lesson-section" aria-labelledby="benchmark-sizing">
      <div class="reading">
        <h2 id="benchmark-sizing">Design a Kafka benchmark for sizing</h2>
        <p>Start with the decision. How many partitions should you provision for a given workload and cluster? Define capacity as the highest sustained rate you observe with p99 produce latency at or below 20 ms and no growing consumer backlog. Increase the offered rate at each setting to find that limit. Use the same throughput unit for capacity and peak demand.</p>
        ${benchmarkSizingWorkflow}
        <h3>Use the pilot to decide what to vary</h3>
        <p>Try a few combinations of message size, partition count and realistic payload formats. Repeat the same settings to measure ordinary run-to-run variation. If changing format shifts capacity by about as much as repeat runs across the tested workloads and leaves the sizing choice the same, fix one format and record that assumption. If adding partitions has a different effect at different message sizes, vary those two factors together in the main benchmark. Keep replication and producer settings fixed unless they are part of the decision.</p>
        ${kafkaSizingDiagram}
        <h3>Spend more runs near the sizing cutoff</h3>
        <p>Suppose peak demand is 45 MiB/s. Leaving 25% of capacity unused requires 45 ÷ 0.75 = <strong>60 MiB/s</strong>. For 8 KiB messages, 6 partitions fall short and 12 reach 71 MiB/s. If the exact minimum matters, test counts between 6 and 12. Doubling from 12 to 24 adds only 3 MiB/s in this example. For 1 KiB messages, even 24 partitions fall short, so test a different cluster size or configuration.</p>
        <h3>Turn the measurements into a sizing rule</h3>
        <p>Ask for message size, peak rate and the desired reserve. At a fixed broker count, choose the lowest tested partition count that reaches the required rate and meets the latency limit. Show the tested range and confirm the recommendation in a separate run at the required rate. If the calculator should choose broker count, benchmark multiple cluster sizes.</p>
      </div>
    </section>`,
    refs:["saltelli"],
  },
  tuning: {
    experimentTitle: "Search within a training budget",
    goal:"Use the same trials to understand what affects prediction error and to choose settings within a time limit.",
    concept:`<h2>What to vary and what to choose</h2>
    <p>A <strong>hyperparameter</strong> is a setting you choose before fitting a machine learning model. The learning rate, for example, controls how far the model adjusts at each training step. <strong>Validation loss</strong> measures prediction error on examples held back during fitting. Lower is better.</p>
    ${tuningRelationshipDiagram}
    <p>Use <strong>sensitivity analysis</strong> to compare the effects of settings over the ranges you tested. If the effect of learning rate depends on model size, try varying them together in the next round. When training is noisy, repeat trials with different seeds to see whether the loss differences persist.</p>
    <p>Use <strong>hyperparameter tuning</strong> to choose settings. In this lesson, the rule is to pick the lowest validation loss among the trials that finish within the time limit.</p>
    <h2>Measure performance on fresh examples</h2>
    ${tuningDiagram}
    <p>A procedure can appear better because it fit quirks in one validation set. When results vary across splits or training seeds, repeat the comparison.</p>`,
    example:`<p>These five illustrative trials use the same validation examples. Suppose each trial must finish within 30 seconds.</p>
    <table class="tuning-worked-trials">
      <caption class="sr-only">Illustrative tuning trials</caption>
      <thead><tr><th scope="col">Model size</th><th scope="col">Learning rate</th><th scope="col">Validation loss</th><th scope="col">Time (s)</th></tr></thead>
      <tbody><tr><td>2</td><td>0.001</td><td>0.33</td><td>26</td></tr>
        <tr><td>3</td><td>0.001</td><td>0.36</td><td>34</td></tr>
        <tr><td>3</td><td>0.01</td><td>0.24</td><td>34</td></tr>
        <tr><td>7</td><td>0.001</td><td>0.39</td><td>66</td></tr>
        <tr><td>7</td><td>0.01</td><td>0.38</td><td>66</td></tr></tbody>
    </table>
    <p><strong>Sensitivity analysis.</strong> Increasing the rate from 0.001 to 0.01 lowers loss by 0.12 at size 3 and by 0.01 at size 7. The effect of learning rate depends on size.</p>
    <p><strong>Tuning.</strong> With a 30-second limit, choose size 2 at rate 0.001, with loss 0.33. With a 45-second limit, choose size 3 at rate 0.01, with loss 0.24.</p>`,
    setup:"The page computes loss and training time from illustrative formulas. It compares settings at a fixed reference for the sensitivity table. It separately samples trials with model sizes 1–8 and rates from 0.0001 to 0.1 on a base-10 log scale. Each step of 1 on that scale multiplies the rate by 10. The page selects the lowest simulated loss among trials that fit the time limit.",
    fields:[select("budget","Trial budget",12,[4,12,32,64],true),select("dataset","Dataset regime","small",[["small","Small sample"],["large","Large sample"]]),number("cost","Training time limit (seconds)",45,16,90),seed],
    predict:"Will the lowest-loss candidate always satisfy the time limit or stay best on another dataset?",
    read: "In <strong>Sensitivity at a shared reference</strong>, compare <strong>Loss at low</strong> and <strong>Loss at high</strong> with <strong>Loss at reference</strong> for each parameter. Which change moves the loss most? In <strong>Selected by simulated validation score</strong>, find the chosen <strong>Validation loss</strong> and <strong>Training time (seconds)</strong>.",
    steps: ["Set <strong>Training time limit (seconds)</strong> to 30 and run again. Open the first run under <strong>Earlier runs</strong>. In <strong>Selected by simulated validation score</strong>, compare <strong>Model size</strong> and <strong>Validation loss</strong>. Do any values in <strong>Sensitivity at a shared reference</strong> change?", "Set <strong>Training time limit (seconds)</strong> back to 45 and set <strong>Trial budget</strong> to 32. Run again. Open the first run under <strong>Earlier runs</strong> and compare <strong>Validation loss</strong> and <strong>Training time (seconds)</strong> in <strong>Selected by simulated validation score</strong>. The 32-trial design draws a fresh set of candidates. Does it give a lower loss within the time limit?","Set <strong>Dataset regime</strong> to <strong>Large sample</strong>. Keep <strong>Trial budget</strong> at 32 and <strong>Training time limit (seconds)</strong> at 45. Run again. Compare the selected <strong>Model size</strong> and <strong>Learning rate</strong> with the preceding run. In <strong>Candidate runs in design order</strong>, find trials with a <strong>Validation loss</strong> below that of the selected trial. Does any of those trials have a <strong>Training time (seconds)</strong> above 45?"],
    task:"Outline a tuning plan. Name the settings you would vary first, how many runs you would spend, and which data you would set aside for the final evaluation.",
    answer:"With seed 42 and 12 trials on Small sample, the 45-second limit selects size 3 with loss about 0.202. At 30 seconds, the same trials select size 2 with loss about 0.223. The sensitivity values at the shared reference stay the same. Back at 45 seconds, the 32-trial design selects a loss of about 0.212 in 42 seconds. The larger design can miss a good candidate from the smaller one. On Large sample, one excluded trial scores about 0.264 at 50 seconds, below the selected loss of about 0.310. For a real search, vary plausible rates and sizes together. Compare configurations on validation data and reserve untouched test data for final evaluation.",
    refs:["randomsearch","validation"],
  },
};
