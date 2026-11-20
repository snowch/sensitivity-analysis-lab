import { number, select, seed, count } from "./foundations.mjs";
import { replicateDiagram, forecastDiagram, backlogDiagram } from "./concept-diagrams.mjs";

export const application = {
  reliability: {
    experimentTitle: "Repeat the estimate at three budgets",
    goal: "Tell whether you need more simulation runs or better evidence about the model.",
    concept: `<h2>Repeat the calculation with new samples</h2>
    <p><strong>Simulation error</strong> comes from using a finite sample. Repeat the whole design with different seeds to see how estimates vary. Look for a narrower spread as the number of sample pairs grows.</p>
    <ul>
      <li><strong>Run-to-run spread.</strong> The 10th and 90th percentiles estimate where the middle 80% of estimates land. The plot shows individual estimates, their mean and the exact share.</li>
      <li><strong>Interval for the mean.</strong> The second table gives an approximate 95% interval for the average estimate across repetitions. It describes uncertainty about that average. The exact share can land outside the interval through sampling variation or bias.</li>
    </ul>
    <details><summary>How to estimate sampling uncertainty</summary><p>The interval uses mean ± 2.093 × sample standard deviation ÷ √20. Another approach is a bootstrap, which builds new samples by drawing the original observations again with replacement. For this Sobol design, draw whole groups of four linked evaluations so the comparisons stay paired.</p></details>
    <h2>Check whether the model fits the question</h2>
    <p>When using sensitivity scores to choose what to investigate first, try more sample pairs if a new seed changes which input leads. If the scores are stable across seeds and a different plausible queue model changes the leader, collect latency measurements near the queue threshold to help distinguish the models.</p>
    <p>Repeated shuffles in <a href="logs.html">Work from logs</a> show another source of variation. Each shuffle uses the same test data and fitted model.</p>`,
    example: `<p>Suppose five designs estimate the same pair share as −0.04, −0.01, 0.00, 0.02 and 0.03. Their mean is 0.00.</p>
    <p>A true independent-input pair index is nonnegative. Keep the signed estimates to see how far the calculation can move in either direction. Replacing the two negatives with zero would raise the mean to 0.01.</p>`,
    setup: "The page repeats 20 independently seeded designs at each of three budgets. Each design estimates a pair index for a known model. At the starting settings, the budgets are 64, 256 and 1,024 pairs per design. Changing <strong>Middle budget (pairs per design)</strong> sets the other budgets to one quarter and four times that value. The plot spaces the three budgets equally.",
    fields: [select("model","Reference model","add",[["add","Additive: exact pair index 0"],["product","Product: exact pair index 1/7"]]),count("Middle budget (pairs per design)",256,[64,256,1024]),seed],
    predict: "What should happen to the cloud of estimates as the number of pairs rises?",
    read: "In <strong>Run-to-run spread</strong>, read <strong>Negative estimates (of 20)</strong> for each value of <strong>Pairs per run</strong>. Subtract <strong>10th percentile</strong> from <strong>90th percentile</strong> to compare the width of the middle range. Does it narrow as you use more pairs?",
    steps: ["Set <strong>Reference model</strong> to <strong>Product: exact pair index 1/7</strong> and run again. Compare the percentile gaps across the three <strong>Pairs per run</strong> rows. How does the spread around the new <strong>Exact share</strong> change with sample size?","Set <strong>Middle budget (pairs per design)</strong> to 1,024 and run again. In <strong>Run-to-run spread</strong>, compare the percentile gap at 4,096 pairs with the 1,024-pair row. The page uses the same set of 20 seeds for both budgets. Does the larger budget reduce the spread across these repetitions?"],
    task: "Name one check for sampling stability and one check for whether the model describes real data.",
    answer: "With the starting seed and Product model, the percentile gap is about 0.125 at 1,024 pairs and 0.046 at 4,096 pairs. A narrower gap between the 10th and 90th percentiles means the pair-index estimates vary less across the 20 designs. When two estimates from the same budget differ by an amount similar to that spread, the difference can reflect sampling variation. To check the pipeline model, collect separate latency measurements near the queue threshold. Compare how closely the abrupt step penalty and a gradually increasing penalty predict those measured latencies.",
    refs: ["saltelli","salib"],
  },
  stochastic: {
    experimentTitle: "Repeat runs at the same inputs",
    goal: "Separate variability within one input setting from changes in the typical outcome across settings.",
    concept: `<h2>Run the simulator again at the same input</h2>
    <p>A deterministic model always gives the same output at the same inputs. A <strong>stochastic simulator</strong> can give different outputs because it makes its own random draws.</p>
    <p>A <strong>replicate</strong> is another run at the same input. To estimate the chance of crossing a limit, count the replicates that go over and divide by the total.</p>
    <h2>Separate two sources of variation</h2>
    ${replicateDiagram}
    <p>The <strong>law of total variance</strong> adds the average variance within one input setting to the variance of the true means across settings.</p>
    <p>With a finite number of replicates, the estimated means still contain noise. If replicate noise is independent and has the same variance at each setting, divide the within-input variance by the number of replicates. Subtract that amount from the variance across estimated means. This estimates the input contribution, and a small, noisy sample can make it negative.</p>`,
    example: `<p>The model averages 10X at input X. Draw X uniformly from 0 to 1.</p>
    <ul>
      <li><strong>Across inputs.</strong> The variance of 10X is 100 ÷ 12 ≈ 8.33 points².</li>
      <li><strong>Within each input.</strong> Random noise with standard deviation 4 adds 4² = 16 points². Total output variance is about 24.33 points².</li>
      <li><strong>With four replicates.</strong> Each estimated mean still has noise variance 16 ÷ 4 = 4 points². Across settings, these means have expected variance 8.33 + 4 = 12.33 points².</li>
    </ul>`,
    setup: "The page draws 96 settings for X. At each setting it adds independent, bell-shaped noise with mean zero to 10X. Keep <strong>Random seed</strong> fixed to reuse the settings and the original noise draws as you add replicates.",
    fields: [number("noise","Noise standard deviation (points)",4,0,12,1),select("repeats","Replicates per input",4,[2,4,16,64],true),seed],
    predict: "Which quantity should move toward 8.33 when replicates increase: within-input variance or variance of group means?",
    read: "In <strong>96 distinct inputs</strong>, compare <strong>Estimate (points²)</strong> with <strong>Model reference (points²)</strong> for <strong>Within-input noise</strong> and <strong>Variance of group means</strong>.",
    steps: ["Set <strong>Replicates per input</strong> to 16 and run again. Open the first run under <strong>Earlier runs</strong>, then open <strong>Plots from this run</strong>. Which plot has less scatter around the <strong>True mean</strong> line? Compare <strong>Variance of group means</strong> with its reference value in each run.","Set <strong>Noise standard deviation (points)</strong> to 0 and run again. In <strong>96 distinct inputs</strong>, do <strong>Variance of group means</strong> and <strong>Noise-corrected input contribution</strong> now have the same estimate?"],
    task: "Explain why spending all evaluations replicating a single input cannot estimate variation across inputs.",
    answer: "Within-input noise stays near 16 under the original noise setting. More replicates bring group means closer to the conditional means, but the design still samples only 96 distinct inputs. At zero noise the two input estimates coincide. In a pilot, add repeats at a setting if the means from separate batches vary by more than your tolerance. Once you have precise enough means, add distinct input settings to see how the mean changes across inputs. Compare the spread within each setting to see whether the amount of noise changes with the inputs.",
    refs: ["stochastic"],
  },
  decisions: {
    experimentTitle: "Compare the cost of three options",
    goal: "Compare ways to reduce delay and work out when a forecast would be worth paying for.",
    concept: `<h2>Compare changes you can make</h2>
    <p>An importance score describes variation. A decision also depends on what you can change, how much you can change it and what that costs. Use <strong>matched conditions</strong> by comparing every option on the same simulated jobs.</p>
    <p>Expected cost here is the price per job plus the chance of being late times the loss per late job. Use p95 to compare where the slowest 5% of jobs begin. Use the chance of exceeding a fixed limit, such as 14 minutes here, when crossing that limit incurs a loss. Compare both if you have a target for p95 as well as a cost for late jobs.</p>
    <p>The <strong>break-even price</strong> per job is the price at which the paid option and the current setup have the same expected total cost per job. Multiply the reduction in late-job probability by the loss per late job. A negative result means the option raises late risk and would need compensation to tie.</p>
    <h2>Decide whether extra information is worth buying</h2>
    <p><strong>Value of information</strong> measures the gain from using new information to choose an action. For the severe-day forecast, compare the lowest expected daily cost of deciding whether to pay for prevention with and without a forecast. Subtract the cost with the forecast from the cost without it. Under the same costs and options, a perfect signal puts an upper bound on the value of a real measurement of the same uncertainty.</p>`,
    example: `${forecastDiagram}`,
    setup: "All three options use the same 8,192 jobs. Ordinary delay is uniform from 0 to 10 minutes. An independent failure adds 18 minutes about 2% of the time. The paid options cut ordinary delay by 65% or prevent the failure.",
    fields: [number("threshold","Late-job limit (minutes)",14,3,25),number("premium","Price of either option per job ($)",.12,0,10,.01),number("loss","Loss per late job ($)",15,1,200),select("structure","Model structure","simple",[["simple","Prevention removes jump only"],["spill","Prevention also adds a 6-minute check"]]),number("risk","Chance of a severe day (0–1)",.25,0,1,.05),seed],
    predict: "At the 14-minute limit, which option will reduce the late-job risk? Which looks better by p95?",
    read: "In <strong>Delay and cost by option</strong>, compare <strong>p95 delay (min)</strong>, <strong>P(delay &gt; 14 min)</strong> at the starting limit and <strong>Expected total cost per job ($)</strong>. Does the same option lead on p95 and cost? <strong>Perfect signal example · separate decision</strong> uses the forecast example above. A chance of 0.25 means 25%.",
    steps: ["In the first run, read <strong>Break-even price per job ($)</strong> for preventing the failure. Set <strong>Price of either option per job ($)</strong> to 0.50 and run again. In <strong>Expected total cost per job ($)</strong>, does prevention still cost less than <strong>Current</strong>?","Restore <strong>Price of either option per job ($)</strong> to 0.12. Set <strong>Model structure</strong> to <strong>Prevention also adds a 6-minute check</strong> and run again. Compare <strong>Expected total cost per job ($)</strong> with the first run at the same price. Which option would you choose now?","Set <strong>Chance of a severe day (0–1)</strong> to 0.6 and run again. This changes the forecast example. Compare <strong>Best action without signal</strong> and <strong>Value of perfect information ($)</strong> with the first run. Does a perfect forecast become more or less valuable?"],
    task: "At $0.12 per job, recommend an option under each structure. If the two model structures favour different options, what would you measure about the prevention check to see which structure better describes the real system? Explain what measurement result would change your choice. Compare the cost of measuring with how much the new choice could save and how likely the measurement is to change your decision.",
    answer: "At the original 14-minute limit, ordinary delay alone cannot cause lateness. Cutting it lowers p95 but does not avoid the jump. At $0.12 per job, prevention is cheapest when it only removes the jump. At $0.50 the current option costs less. At $0.12 with the extra six-minute check, the current option also costs less because the check introduces more late jobs. Time the extra check on a comparable workload. At severe probability 0.6 you mitigate without a signal for $18. With a perfect signal, you pay $18 only on severe days, or $10.80 on average. The signal is worth $18 − $10.80 = $7.20.",
    refs: ["voi"],
  },
  capstone: {
    experimentTitle: "Test a staffing decision",
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
    example: `${backlogDiagram}`,
    setup: "The page tests both teams on the same simulated events. The starting case compares two volunteers with three, using a 10-minute wait limit and a $25 extra shift.",
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
    predict: "How much would an extra volunteer need to reduce waits to justify the shift?",
    plan: "Before you run, write a rule in <strong>Report draft</strong>. You can use the example rule and the starting settings, or set <strong>Decision summary</strong> and <strong>Wait limit (minutes)</strong> to match a rule of your own. For the example, pay $25 if a third volunteer takes the chance of waiting over 10 minutes from above 10% to 10% or less. Record where your input ranges came from. Select <strong>Run experiment</strong> to compare the two teams.",
    read: "Compare <strong>Current team</strong> and <strong>One extra volunteer</strong> in <strong>Chosen decision summary</strong>. A chance of 0.10 means 10%. Does the extra shift meet your rule? With the starting settings, find the largest absolute <strong>Spearman ρ</strong> in <strong>Global rank screen on current staffing</strong>. Each score shows whether higher values of an input tend to go with longer or shorter waits for the current team, and how consistently.",
    steps: [
      "<strong>Try another arrival model.</strong> Set <strong>Arrival model</strong> to <strong>Spread arrival assumption</strong> and run again. Compare both teams in <strong>Chosen decision summary</strong> with the first run. Does spreading arrivals change your recommendation?",
      "<strong>Try a different range.</strong> Set <strong>Arrival model</strong> back to <strong>Full burst share</strong>. Set <strong>People per volunteer per 30 min · lower</strong> to 12 and run again. In <strong>Chosen decision summary</strong>, does the extra shift still meet your rule?",
      "<strong>Check sample size.</strong> Set <strong>People per volunteer per 30 min · lower</strong> back to 20. Set <strong>Input dependence</strong> to <strong>Independent</strong>, <strong>Per-event sensitivity output</strong> to <strong>1 if wait is above the limit</strong>, and <strong>Sensitivity method</strong> to <strong>First- and total-order Sobol</strong>. Run with <strong>Samples or Sobol base pairs</strong> at 1,024 and <strong>Random seed</strong> at 42. Set <strong>Samples or Sobol base pairs</strong> to 4,096 and run again. In <strong>Independent-input Sobol screen on current staffing</strong>, does the order by <strong>Total order</strong> change?",
      "<strong>Check the seed.</strong> Keep <strong>Samples or Sobol base pairs</strong> at 4,096. Set <strong>Random seed</strong> to 19 and run again. Compare the leading <strong>Total order</strong> input with the preceding run. Record the pair counts, seeds and rankings in <strong>Report draft</strong>.",
    ],
    task: "Use <strong>Assess the report</strong> to check your assumptions and evidence. In <strong>Report draft</strong>, recommend keeping the current team or adding one volunteer. Name a measurement, such as check-ins per volunteer per half hour, and the measured result that would change your staffing recommendation. Select <strong>Download report</strong> to save a copy with your run settings and result tables.",
    report: true,
    refs: ["saltelli"],
  },
};
