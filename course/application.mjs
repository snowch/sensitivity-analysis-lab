import { number, select, seed, count } from "./foundations.mjs";

export const application = {
  reliability: {
    goal: "Tell whether you need more simulation runs or better evidence about the model.",
    concept: `<h2>Repeat the calculation with new samples</h2>
    <p><strong>Simulation error</strong> comes from using a finite sample. Repeat the whole design with different seeds to see how estimates vary. Look for a narrower spread as the number of sample pairs grows.</p>
    <ul>
      <li><strong>Run-to-run spread.</strong> The 10th and 90th percentiles estimate where the middle 80% of estimates land. The plot shows individual estimates, their mean and the exact share.</li>
      <li><strong>Interval for the mean.</strong> The second table gives an approximate 95% interval for the mean across repetitions. A biased method can still miss the exact share.</li>
    </ul>
    <details><summary>How to estimate sampling uncertainty</summary><p>The interval uses mean ± 2.093 × sample standard deviation ÷ √20. Another approach is a bootstrap, which builds new samples by drawing the original observations again with replacement. For this Sobol design, draw whole groups of four linked evaluations so the comparisons stay paired.</p></details>
    <h2>Check whether the model fits the question</h2>
    <p>Changing the input ranges or model equations can change the conclusion even with a large sample. Check assumptions against relevant measurements and try alternative model structures.</p>
    <p>Repeated shuffles in <a href="logs.html">Work from logs</a> show another source of variation. Each shuffle uses the same test data and fitted model.</p>`,
    example: `<p>Suppose five designs estimate the same pair share as −0.04, −0.01, 0.00, 0.02 and 0.03. Their mean is 0.00.</p>
    <p>A true independent-input pair index is nonnegative. Keep the signed estimates to see how far the calculation can move in either direction. Replacing the two negatives with zero would raise the mean to 0.01.</p>`,
    setup: "The page repeats 20 independently seeded designs at each of three budgets. Each design estimates a pair index for a known model. The smaller budget is one quarter of the middle budget. The larger budget is four times the middle budget. The plot spaces the three budgets equally.",
    fields: [select("model","Reference model","add",[["add","Additive: exact pair index 0"],["product","Product: exact pair index 1/7"]]),count("Middle budget (pairs per design)",256,[64,256,1024]),seed],
    predict: "What should happen to the cloud of estimates as the number of pairs rises?",
    read: "For each budget, compare <strong>Negative estimates (of 20)</strong> and the gap between the 10th and 90th percentiles.",
    steps: ["Set <strong>Reference model</strong> to <strong>Product</strong> and run again. Does the spread narrow around the different exact share?","Set <strong>Middle budget (pairs per design)</strong> to 1,024 and run again. Compare the distance between the <strong>10th percentile</strong> and <strong>90th percentile</strong> at 4,096 pairs with the 1,024-pair row of the preceding run. Does the extra budget reduce spread for this seed?"],
    task: "Name one check for sampling stability and one check for whether the model describes real data.",
    answer: "Use multiple seeds and larger budgets to see whether differences matter relative to estimator spread. Validate the queue model against separate measurements around the threshold, check the latency tail and compare a gradual overload model with the step penalty. A sharp ranking at high sample size can still describe the wrong structure.",
    refs: ["saltelli","salib"],
  },
  stochastic: {
    goal: "Separate variability within one input setting from changes in the typical outcome across settings.",
    concept: `<h2>Run the simulator again at the same input</h2>
    <p>A deterministic model always gives the same output at the same inputs. A <strong>stochastic simulator</strong> can give different outputs because it makes its own random draws.</p>
    <p>A <strong>replicate</strong> is another run at the same input. Average the replicates to estimate the mean. To estimate the chance of crossing a limit, count the replicates that go over and divide by the total.</p>
    <h2>Separate two sources of variation</h2>
    <p>The <strong>law of total variance</strong> adds the average variance within one input setting to the variance of the true means across settings.</p>
    <p>With a finite number of replicates, the estimated means still contain noise. If replicate noise is independent and has the same variance at each setting, divide the within-input variance by the number of replicates. Subtract that amount from the variance across estimated means. This estimates the input contribution, and a small, noisy sample can make it negative.</p>`,
    example: `<p>The model averages 10X at input X. Draw X uniformly from 0 to 1.</p>
    <ul>
      <li><strong>Across inputs.</strong> The variance of 10X is 100 ÷ 12 ≈ 8.33 points².</li>
      <li><strong>Within each input.</strong> Random noise with standard deviation 4 adds 4² = 16 points². Total output variance is about 24.33 points².</li>
      <li><strong>With four replicates.</strong> Each estimated mean still has noise variance 16 ÷ 4 = 4 points². Across settings, these means have expected variance 8.33 + 4 = 12.33 points².</li>
    </ul>`,
    setup: "The page draws 96 inputs and simulates independent, bell-shaped noise centred on 10X. Keeping the seed fixed reuses the 96 inputs when you change the number of replicates. It repeats the original noise draws and adds more at each input.",
    fields: [number("noise","Noise standard deviation (points)",4,0,12,1),select("repeats","Replicates per input",4,[2,4,16,64],true),seed],
    predict: "Which quantity should move toward 8.33 when replicates increase: within-input variance or variance of group means?",
    read: "Compare <strong>Within-input noise</strong> and <strong>Variance of group means</strong> with their reference values.",
    steps: ["Set <strong>Replicates per input</strong> to 16 and run again. Open the first run under <strong>Earlier runs</strong>, then open <strong>Plots from this run</strong>. In the two mean-output plots, compare the scatter around the <strong>True mean</strong> line. Check <strong>Variance of group means</strong> against its two reference values.","Set <strong>Noise standard deviation (points)</strong> to 0 and run again. Compare <strong>Variance of group means</strong> with <strong>Noise-corrected input contribution</strong>."],
    task: "Explain why spending all evaluations replicating a single input cannot estimate variation across inputs.",
    answer: "Within-input noise stays near 16 under the original noise setting. More replicates bring group means closer to the conditional means, but the design still samples only 96 distinct inputs. At zero noise the two input estimates coincide. For real simulations, pilot both numbers and inspect whether noise changes with the inputs.",
    refs: ["stochastic"],
  },
  decisions: {
    goal: "Compare interventions by the decision criterion and test whether extra information could change the action.",
    concept: `<h2>Compare changes you can make</h2>
    <p>An importance score describes variation. A decision also depends on what you can change, how much you can change it and what that costs. Use <strong>matched conditions</strong> by comparing every option on the same simulated jobs.</p>
    <p>Expected cost here is the price per job plus the chance of being late times the loss per late job. Check p95 and the chance of exceeding a deadline separately when the decision requires both.</p>
    <p>The <strong>break-even price</strong> is the largest extra price that leaves expected cost unchanged. Multiply the reduction in late-job probability by the loss per late job. A negative result means the option raises late risk and would need compensation to tie.</p>
    <h2>Decide whether extra information is worth buying</h2>
    <p><strong>Value of information</strong> compares the best expected result before and after learning something that could change your action. Under the same costs and options, a perfect signal puts an upper bound on the value of a real measurement of the same uncertainty.</p>`,
    example: `<p>A severe day costs $60 in losses. A mild day costs $0. You can pay $18 to prevent the loss. One in four days is severe.</p>
    <ol>
      <li><strong>Without a forecast.</strong> Waiting costs 0.25 × $60 = $15 on average. This is cheaper than paying $18 every day.</li>
      <li><strong>With a perfect forecast.</strong> Pay $18 only on severe days. That costs 0.25 × $18 = $4.50 on average.</li>
      <li><strong>Value of the forecast.</strong> Subtract the two costs. Perfect information saves $15 − $4.50 = $10.50 per day in this example.</li>
    </ol>`,
    setup: "All three options use the same 8,192 jobs. Ordinary delay is uniform from 0 to 10 minutes. An independent failure adds 18 minutes about 2% of the time. The paid options cut ordinary delay by 65% or prevent the failure.",
    fields: [number("threshold","Late-job limit (minutes)",14,3,25),number("premium","Price of either option per job ($)",.12,0,10,.01),number("loss","Loss per late job ($)",15,1,200),select("structure","Model structure","simple",[["simple","Prevention removes jump only"],["spill","Prevention also adds a 6-minute check"]]),number("risk","Chance of a severe day (0–1)",.25,0,1,.05),seed],
    predict: "At the 14-minute limit, which option will reduce the late-job risk? Which looks better by p95?",
    read: "Compare <strong>p95 delay (min)</strong>, the chance of exceeding the limit and <strong>Expected total cost per job ($)</strong>. Does the same option lead on p95 and cost? The <strong>Perfect signal example</strong> is a separate decision. Its chance of 0.25 means 25%.",
    steps: ["Set <strong>Price of either option per job ($)</strong> to 0.50, above the displayed <strong>Break-even price per job ($)</strong>, and run again. Does prevention still cost less than the current option?","Set the price back to 0.12. Set <strong>Model structure</strong> to <strong>Prevention also adds a 6-minute check</strong> and run again. Compare <strong>Expected total cost per job ($)</strong> with the first run at the same price. Which option would you choose now?","Set <strong>Chance of a severe day (0–1)</strong> to 0.6 and run again. In <strong>Perfect signal example</strong>, compare <strong>Best action without signal</strong> and <strong>Value of perfect information ($)</strong> with the first run."],
    task: "At $0.12 per job, recommend an option under each structure. Name a measurement that could resolve the disagreement and a reason it might be worth collecting.",
    answer: "At the original 14-minute limit, ordinary delay alone cannot cause lateness. Cutting it lowers p95 but does not avoid the jump. At $0.12 per job, prevention is cheapest when it only removes the jump. At $0.50 the current option costs less. At $0.12 with the extra six-minute check, the current option also costs less because the check introduces more late jobs. Time the extra check on a comparable workload. At severe probability 0.6 you mitigate without a signal for $18. With a perfect signal, you pay $18 only on severe days, or $10.80 on average. The signal is worth $18 − $10.80 = $7.20.",
    refs: ["voi"],
  },
  capstone: {
    goal: "Choose and defend an analysis for a community event, then document the evidence that could overturn your recommendation.",
    concept: `<h2>Decide what would justify another shift</h2>
    <p>A community group can keep its current registration team or schedule one extra volunteer. Choose what counts as a long wait and how much improvement would justify the extra cost.</p>
    <h2>Estimate the time to clear the queue</h2>
    <p>The model estimates the backlog at the end of a 30-minute arrival window.</p>
    <ol>
      <li><strong>Count arrivals.</strong> Multiply total guests by the <strong>burst share</strong>, the fraction who arrive in that window.</li>
      <li><strong>Find the backlog.</strong> Team capacity is team size × the number of people one volunteer can serve in 30 minutes. Subtract capacity from arrivals, using zero if capacity is larger.</li>
      <li><strong>Estimate the wait.</strong> Divide the backlog by team capacity and multiply by 30 minutes. Check actual arrival and wait records before relying on this approximation.</li>
    </ol>
    <h2>Choose the arrival and sampling assumptions</h2>
    <p><strong>Full burst share</strong> uses the input burst share directly. <strong>Spread arrival assumption</strong> moves it 35% of the way towards 0.4. Compare both to see whether the staffing decision depends on how concentrated arrivals are.</p>
    <p>The starting ranges are independent and uniform. You can choose a triangular guest count with a peak a quarter of the way across its range. You can also make busier events tend to have a larger burst share by linking the two percentiles on 80% of draws.</p>
    <p>Use evidence for these choices or label them as what-if assumptions. Use classical Sobol indices with independent inputs.</p>`,
    example: `<p>Suppose 160 guests attend and 75% arrive in the first half hour. That is 160 × 0.75 = 120 arrivals. Each volunteer can serve 30 people in that time.</p>
    <ul>
      <li><strong>Two volunteers.</strong> Capacity is 60 people and the backlog is 60. Clearing it takes 60 ÷ 60 × 30 = 30 minutes.</li>
      <li><strong>Three volunteers.</strong> Capacity is 90 and the backlog is 30. Clearing it takes 30 ÷ 90 × 30 = 10 minutes.</li>
    </ul>
    <p>Only the two-person team goes over 10 minutes in this example. Now check the options across a range of plausible events.</p>`,
    setup: "Both staffing options use the same simulated events. The starting case compares two volunteers with three, using a 10-minute limit and a $25 extra shift.",
    fields: [
      number("guestsLow","Guests · lower bound",60,5,400),number("guestsHigh","Guests · upper bound",160,10,500),
      number("serviceLow","People per volunteer per 30 min · lower",20,2,90),number("serviceHigh","People per volunteer per 30 min · upper",40,3,100),
      number("burstLow","Burst share · lower bound",.3,.05,.95,.05),number("burstHigh","Burst share · upper bound",.8,.1,1,.05),
      select("shape","Guest-count distribution","uniform",[["uniform","Uniform"],["triangle","Triangular, lower peak"]]),
      select("dependence","Input dependence","independent",[["independent","Independent"],["linked","Link guest and burst percentiles"]]),
      number("team","Current volunteers",2,1,10),number("shiftCost","Price of extra shift ($)",25,0,300),number("limit","Wait limit (minutes)",10,0,100),
      select("summary","Decision summary","Exceedance probability",["Mean","Variance","p95","Exceedance probability"]),
      select("analysis","Per-event sensitivity output","wait",[["wait","Wait time"],["event","1 if wait is above the limit"]]),
      select("method","Sensitivity method","rank",[["oat","One input at a time"],["rank","Spearman rank screen"],["sobol","First- and total-order Sobol"]]),
      select("structure","Arrival model","peak",[["peak","Full burst share"],["spread","Spread arrival assumption"]]),
      count("Samples or Sobol base pairs",1024,[256,1024,4096,16384]),seed,
    ],
    predict: "What should the group change and what minimum improvement would justify it? Choose before you run.",
    plan: "In <strong>Report draft</strong>, write what would justify the extra shift. For example, pay $25 if a third volunteer takes the chance of waiting over 10 minutes from above 10% to 10% or less. Set <strong>Decision summary</strong> and <strong>Wait limit (minutes)</strong> to match your rule. Record the source of your input ranges.",
    read: "Compare both teams in <strong>Chosen decision summary</strong>. A chance of 0.10 means 10%. The sensitivity table covers the current team. If you used the rank screen, find the largest absolute <strong>Spearman ρ</strong>.",
    steps: [
      "<strong>Try another arrival model.</strong> Switch <strong>Arrival model</strong> to <strong>Spread arrival assumption</strong> and run again. Compare both teams’ decision results with the first run.",
      "<strong>Try a different range.</strong> Restore <strong>Full burst share</strong> and set <strong>People per volunteer per 30 min · lower</strong> to 12. Run again. Did the arrival model or the lower bound change your choice?",
      "<strong>Check sample size.</strong> Restore the lower bound to 20. Set <strong>Per-event sensitivity output</strong> to <strong>1 if wait is above the limit</strong> and <strong>Sensitivity method</strong> to <strong>First- and total-order Sobol</strong>. Run with 1,024 pairs and seed 42. Set <strong>Samples or Sobol base pairs</strong> to 4,096 and run again. Compare the two <strong>Total order</strong> rankings.",
      "<strong>Check the seed.</strong> Keep 4,096 pairs. Set <strong>Random seed</strong> to 19, then run again. Does the leading input stay the same? Record the budgets, seeds and rankings in the report.",
    ],
    task: "Use <strong>Assess the report</strong> to check your assumptions and evidence. Finish <strong>Report draft</strong> with your recommendation and a measurement that could change it. Select <strong>Download report</strong> below the checklist to take a copy.",
    report: true,
    refs: ["saltelli"],
  },
};
