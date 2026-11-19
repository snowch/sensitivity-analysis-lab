export const number = (id, label, value, min, max, step = 1) => ({ id, label, value, min, max, step });
export const select = (id, label, value, options, numeric = false) => ({ id, label, value, options, numeric });
export const when = (field, control, value) => ({ ...field, when: [control, value] });
export const seed = number("seed", "Random seed", 42, 0, 999999);
export const summary = value => select("metric", "Decision summary", value, ["Mean", "Variance", "p95", "Exceedance probability"]);
export const count = (label, value, choices) => select("count", label, value, choices.map(n => [n, n.toLocaleString("en")]), true);

export const foundations = {
  questions: {
    experimentTitle: "Compare the two services",
    goal: "Choose a measure that helps you decide which route to take.",
    concept: `<h2>What matters about the journey?</h2>
    <p>Suppose you must choose a route to class. Average journey time might matter on a free afternoon. If class starts at 9 am, you might care more about the chance of arriving late.</p>
    <p>A <strong>model</strong> uses inputs to calculate an outcome. Route and departure time are choices. Weather and traffic are conditions you face. A <strong>parameter</strong>, such as how many minutes the model adds per kilometre, sets how its calculation works.</p>
    <p>The <strong>output</strong> is what the model produces, such as journey time. A summary of that output, such as the chance of missing a deadline, can help you decide. <strong>Sensitivity analysis</strong> asks how much the result changes when you change an input or assumption. First choose the result you care about.</p>
    <details><summary>How this relates to other methods</summary>
      <ul>
        <li><strong>Uncertainty analysis</strong> describes what journey times are plausible and, when evidence supports it, how likely they are. The experiment below shows a simple case.</li>
        <li><strong>Scenario analysis</strong> compares conditions, such as weekday and weekend traffic. You can compare them even if their chances are unknown. <a href="ranges.html">Change the assumptions</a></li>
        <li><strong>Optimisation</strong> searches for the best available choice under a stated goal and constraints. <a href="tuning.html">Spend an ML tuning budget</a></li>
        <li><strong>Predictive attribution</strong> asks which inputs a fitted model relies on to make predictions. <a href="logs.html">Work from logs</a></li>
      </ul>
    </details>`,
    example: `<p>Suppose two equally likely trips take 10 and 30 minutes. Compare four ways to describe those times.</p>
    <ul>
      <li><strong>Mean.</strong> Add the times and divide by two. (10 + 30) ÷ 2 = 20 minutes.</li>
      <li><strong>Chance of going over 25 minutes.</strong> One trip takes more than 25 minutes. The chance is 1 ÷ 2 = 50%. This is the <em>exceedance probability</em>.</li>
      <li><strong>95th percentile (p95).</strong> Find the smallest observed time with at least 95% of trips at or below it. Here that time is 30 minutes.</li>
      <li><strong>Variance.</strong> Both trips are 10 minutes from the mean. Square those distances and average them. (100 + 100) ÷ 2 = 100 min².</li>
    </ul>
    <p>Use the mean to compare long-run journey times. Use the chance of going over the limit to compare missed deadlines.</p>`,
    setup: "The page prepares five equally likely trips for each service. The time limit starts at 25 minutes. Once you run, the plot shows the five times for each service and the limit.",
    fields: [select("scenario", "Variable service", "bursts", [["bursts","Occasional long trip"],["moderate","Moderate spread"]]),number("threshold","Time limit (minutes)",25,1,70),summary("Exceedance probability")],
    predict: "Can two services with the same mean journey time have different chances of missing a deadline?",
    read: "In <strong>Five equally likely journey times</strong>, compare the mean, p95 and <strong>P(above limit)</strong>. The table shows chances as fractions, so 0.2 means 20%. Which measure distinguishes the risk of a late trip?",
    steps: ["Set <strong>Variable service</strong> to <strong>Moderate spread</strong> and <strong>Time limit (minutes)</strong> to 30. Select <strong>Run experiment</strong> again. Compare <strong>P(above limit)</strong> for the two services. Would either miss the new deadline?"],
    task: "Explain which output you would report if late arrival costs more than leaving early.",
    answer: "Both original means are 20 minutes. One of five variable trips exceeds 25 minutes (20%). All five steady trips meet the deadline. Under the edited settings both risks are zero in this small model, even though the spreads differ. A real decision would also check how well the five outcomes represent the journeys you care about.",
  },
  local: {
    experimentTitle: "Change the trip distance",
    goal: "Change one input, calculate the effect, and attach the right units.",
    concept: `<h2>Measure the change from a starting point</h2>
    <p>A taxi fare has a fixed charge and a distance charge. In this example, distance changes while both prices stay fixed. The starting distance is the <strong>reference point</strong>.</p>
    <p>Subtract the reference fare from the new fare to get the change in cost. Divide that change by the extra distance to get the <strong>slope</strong> over the step.</p>
    <h2>Compare percentage changes</h2>
    <p><strong>Elasticity</strong> divides the percentage change in cost by the percentage change in distance. Measure each percentage from its starting value. An elasticity of 0.5 means a 10% increase in distance gives a 5% increase in cost for that comparison.</p>
    <p>A negative sign means the input and output move in opposite directions. A percentage change requires a nonzero starting value.</p>`,
    example: `<p>The taxi costs $4 to start and $2 per kilometre. At 4 km the fare is $12. At 5 km it is $14.</p>
    <ol>
      <li><strong>Slope.</strong> The extra kilometre adds $14 − $12 = $2. That is $2/km, or $0.002/m.</li>
      <li><strong>Percentage changes.</strong> Distance rises by 1 ÷ 4 = 25%. The fare rises by 2 ÷ 12 ≈ 16.7%.</li>
      <li><strong>Elasticity.</strong> Divide 16.7% by 25% to get about 0.667. The percentages stay the same in metres.</li>
    </ol>
    <p>The $4 starting charge makes up part of the reference fare. It stays the same as you add distance.</p>`,
    setup: "The page prepares a $4 fixed fare and adds rate times distance. Changing the displayed unit converts both distances and the reported slope. Enter <strong>Starting distance (km)</strong> and <strong>Increase (km)</strong> in kilometres, even when the table shows metres.",
    fields: [number("distance","Starting distance (km)",4,1,20),number("rate","Rate ($/km)",2,.1,5,.1),number("step","Increase (km)",1,.1,5,.1),select("units","Display distance in","km",[["km","Kilometres"],["m","Metres"]])],
    predict: "Which result changes when you display metres: cost change, slope, or elasticity?",
    read: "In <strong>Cost calculation</strong>, compare the change in cost, the slope and the elasticity. Check the units next to each value.",
    steps: ["Choose <strong>Metres</strong> in <strong>Display distance in</strong> and run again. Open the first run under <strong>Earlier runs</strong> to compare the three rows. Which number changes when the slope is shown in dollars per metre?","Set <strong>Starting distance (km)</strong> to 8. Keep the rate at $2/km and the increase at 1 km. Run and compare <strong>Elasticity (no units)</strong> with the first run."],
    task: "Explain why a slope expressed per metre can look small and why the fixed charge changes the elasticity.",
    answer: "The same $2 is divided by 1,000 metres instead of 1 km. At 8 km the reference fare is $20, so a $2 increase is 10% while a 1 km increase is 12.5%; elasticity is 0.8. The fixed $4 is a smaller share of the longer trip’s fare. Report the units when you use a slope to compare changes.",
  },
  curves: {
    experimentTitle: "Measure the slope over a step",
    goal: "See how the same input can have a different effect at a new baseline or step.",
    concept: `<h2>Read the slope between two points</h2>
    <p>A response curve shows what the model predicts as one input varies. The straight line joining two points is a <strong>secant</strong>. Its slope is the change in output divided by the change in input.</p>
    <p>On a smooth curve, a smaller step brings that line closer to the <strong>tangent</strong>, which points in the curve’s direction at the start of the step. The slope at that point is called a <strong>derivative</strong>.</p>
    <h2>Look beyond one slope</h2>
    <p>A response can level off, jump at a threshold or turn around. A slope measured over one step may miss these changes. A secant across a jump includes the whole jump. At the jump itself, there is no finite derivative.</p>`,
    example: `<p>Square the input to get the output. Start at input 2, where the output is 4.</p>
    <ul>
      <li><strong>Step of 1.</strong> At input 3 the output is 9. The slope is (9 − 4) ÷ 1 = 5.</li>
      <li><strong>Step of 0.1.</strong> At input 2.1 the output is 4.41. The slope is (4.41 − 4) ÷ 0.1 = 4.1.</li>
    </ul>
    <p>The smaller step gives a slope closer to the tangent slope of 4 at input 2.</p>`,
    setup: "The plot shows the selected illustrative response and a line between the two points used in the calculation.",
    fields: [select("shape","Response shape","curve",[["curve","Square: x²"],["saturation","Saturation: 10x ÷ (2+x)"],["threshold","Jump: add 5 at x=5"],["valley","Valley: (x−5)²"]]),number("baseline","Start input",2,0,8,.1),number("step","Step",1,.1,2,.1)],
    predict: "For the square response, will shrinking the step make the reported slope smaller or larger?",
    read: "Find <strong>Change per input unit</strong> in <strong>Finite difference</strong>. Use it as your starting slope.",
    steps: ["Set <strong>Step</strong> to 0.1 and run again. Compare <strong>Change per input unit</strong> with the first run. Which slope is closer to 4?","Set <strong>Response shape</strong> to <strong>Jump</strong> and <strong>Start input</strong> to 4.9. Keep <strong>Step</strong> at 0.1 and run. Set <strong>Start input</strong> to 5 and run again. Compare <strong>Start output</strong> and <strong>End output</strong> for the last two runs. Which step crosses the jump?","Set <strong>Response shape</strong> to <strong>Valley</strong>. Run at <strong>Start input</strong> 4 and again at 6, keeping the 0.1 step. Compare the signs in <strong>Change per input unit</strong>."],
    task: "Explain why a slope measured on one side of the valley or threshold does not describe the whole response. For a further check, set <strong>Response shape</strong> to <strong>Saturation</strong>. Run at <strong>Start input</strong> 1 and again at 7. Keep <strong>Step</strong> at 0.1. Which run has the smaller <strong>Change per input unit</strong>?",
    answer: "Across the jump, the output rises from 4.9 to 10, so the finite slope is 51. Just after the jump a 0.1 step gives slope 1. The valley slopes have opposite signs, and the saturation slope shrinks as the input rises. The appropriate baseline and step depend on the changes you could actually make.",
  },
  tornado: {
    experimentTitle: "Find the widest span",
    goal: "Use one-at-a-time changes to compare selected ranges around a reference.",
    concept: `<h2>Compare endpoints and the path between them</h2>
    <p>A <strong>tornado plot</strong> shows the outcomes at each input’s low and high settings. Change one input at a time with all other inputs at their starting values. The widest gap between endpoints appears first.</p>
    <p>A <strong>spider plot</strong> shows what happens between those endpoints. Each input’s curve runs from −100% at its low setting, through 0% at its starting point, to +100% at its high setting. The curve can reveal a turn the endpoints conceal.</p>
    <p>Both plots depend on the starting point and ranges you choose. You also need other tests if you want to see what happens when several inputs change together.</p>`,
    example: `<p>Start with fixed delay and add 0.05 minutes per job/hour of demand. If demand exceeds capacity, also add 0.2 times the squared excess.</p>
    <p>Hold capacity at 70 jobs/hour and fixed delay at 8 minutes. At the reference demand of 60 jobs/hour, delay is 8 + 0.05 × 60 = 11 minutes.</p>
    <ul>
      <li><strong>Demand of 40.</strong> Delay is 8 + 0.05 × 40 = 10 minutes.</li>
      <li><strong>Demand of 80.</strong> Demand exceeds capacity by 10 jobs/hour. That adds 0.2 × 10² = 20 minutes, so delay is 8 + 4 + 20 = 32 minutes.</li>
    </ul>
    <p>The endpoint span is 32 − 10 = 22 minutes.</p>`,
    setup: "Start with demand at 60 jobs/hour. A half-range of 20 tests both 40 and 80. The model starts capacity at 70 jobs/hour and varies fixed delay from 4 to 12 minutes around 8.",
    fields: [number("baseline","Reference demand (jobs/hour)",60,35,90),number("width","Demand half-range (jobs/hour)",20,2,30),number("rateWidth","Capacity half-range (jobs/hour)",10,2,30)],
    predict: "Which input gives the widest span? Will it still lead if demand varies less?",
    read: "In the tornado plot, find the longest bar. In the <strong>One input varies at a time</strong> table, check the low and high delays for that input.",
    steps: ["Change <strong>Demand half-range (jobs/hour)</strong> to 2 and rerun. Compare <strong>Endpoint span (min)</strong> with the first run under <strong>Earlier runs</strong>. Which input now has the largest span?","Set <strong>Reference demand (jobs/hour)</strong> to 75. Run again. In the spider plot, follow <strong>Capacity per hour</strong> from low to high and find where delay stops falling."],
    task: "Explain the ranking reversal using the selected ranges. Name a combination this test would miss.",
    answer: "At demand 60 with a half-range of 2, demand contributes only a 0.2 min span and the fixed delay leads at 8 min. Changing the demand baseline to 75 brings the system near or above capacity. A joint change to high demand and low capacity could give much worse delays than either one-at-a-time run.",
  },
  inputs: {
    experimentTitle: "Compare independent and linked draws",
    goal: "Choose which values and pairs of inputs the model should use.",
    concept: `<h2>Choose which values are likely</h2>
    <p>A distribution describes how likely different values are. The three distributions here use the same range but give different parts of it different weight.</p>
    <ul>
      <li><strong>Uniform.</strong> Equal-width intervals have equal chances.</li>
      <li><strong>Triangular.</strong> Values near the peak are more common. The weights fall to zero at either end.</li>
      <li><strong>Right-weighted.</strong> High values are more common than low ones.</li>
    </ul>
    <p>Record where the bounds and typical values came from. You can use representative observations, a physical limit, expert judgement or a stated what-if assumption. Demand varies hour to hour. If you are also unsure how it will vary next month, compare plausible scenarios and report which ones change your conclusion.</p>
    <h2>Check which pairs can occur</h2>
    <p>Inputs are <strong>independent</strong> if knowing one leaves the other’s distribution unchanged. <strong>Correlation</strong> describes one kind of association.</p>
    <p>A percentile marks a position in a distribution. For example, the 50th percentile marks its halfway point. The linked design here gives capacity the same percentile as demand 80% of the time. Each input keeps its own distribution, but different pairs appear.</p>
    <p>For a real service, check the rule with paired measurements. For example, does capacity rise immediately with demand or respond after a delay?</p>`,
    example: `<p>Demand and capacity are each uniform from 40 to 100 jobs/hour. What’s the chance demand is above 80 while capacity is below 60?</p>
    <ul>
      <li><strong>Independent draws.</strong> Each condition occurs in one third of its range. Both happen with probability (1/3) × (1/3) = 1/9.</li>
      <li><strong>Linked draws.</strong> The two conditions cannot happen at the same percentile. Only the 20% of pairs drawn independently can meet both, so the chance is 0.2 × (1/9) ≈ 2.2%.</li>
    </ul>`,
    setup: "The page draws 3,000 pairs. Demand and capacity range from 40 to 100 jobs/hour. The triangle peaks at 55. The scatter shows the first 200 pairs and highlights demand above 80 with capacity below 60.",
    fields: [select("shape","Demand distribution","uniform",[["uniform","Uniform"],["triangle","Triangular, peak at 55"],["right","Weighted toward high demand"]]),select("dependence","How capacity follows demand","independent",[["independent","Independent percentiles"],["linked","Share demand percentile 80% of the time"]]),seed],
    predict: "Will linking the percentiles change demand’s mean, the rate of mismatched pairs, or both?",
    read: "In <strong>From 3,000 input pairs</strong>, read <strong>P(demand &gt;80 and capacity &lt;60)</strong>. Find those pairs in the plot to the right of 80 and below 60.",
    steps: ["Set <strong>How capacity follows demand</strong> to <strong>Share demand percentile 80% of the time</strong>. Keep <strong>Random seed</strong> at 42 and run again. Compare the fraction of these pairs and <strong>Mean demand (jobs/h)</strong> with the first run. Which quantity stays the same?","Set <strong>Demand distribution</strong> to <strong>Triangular, peak at 55</strong> and run again. Compare <strong>Demand p95 (jobs/h)</strong>, the demand at or below which 95% of the draws sit, with the immediately preceding run. Open <strong>Plots from this run</strong> under that earlier run to compare where demand is most common."],
    task: "How could measurements of demand and capacity help you choose between drawing them independently, reusing measured pairs, or modelling how capacity follows demand?",
    answer: "Sharing percentiles keeps the same demand values and reduces the fraction of high-demand, low-capacity pairs. The triangular distribution shifts most demand toward lower values. Matching both marginal distributions would not detect an unrealistic joint model. Look for joint load and capacity measurements across normal hours and transitions.",
    refs: ["saltelli"],
  },
  designs: {
    experimentTitle: "Compare three sampling designs",
    goal: "Compare sampling designs at the same model-evaluation budget.",
    concept: `<h2>Decide where to place the sample points</h2>
    <p>A sample is a limited set of input combinations. Each design uses its points differently.</p>
    <ul>
      <li><strong>Independent random sampling.</strong> Draw each point separately. Some areas can cluster by chance.</li>
      <li><strong>Latin hypercube.</strong> Divide each axis into equal-probability bins. Draw one value per bin and pair values across axes in a shuffled order. This spreads each axis out, though the combinations can still leave gaps.</li>
      <li><strong>Low-discrepancy design.</strong> Use a pattern that aims to cover combinations evenly. This lesson uses a Halton sequence, then shifts each axis by a random amount and wraps values at 1.</li>
    </ul>
    <p>A <strong>seed</strong> reproduces the same random draws, shuffles or shifts when the other settings stay fixed. Compare larger designs and several seeds to check whether a conclusion is stable.</p>
    <details><summary>How Halton places points</summary><p>On the first axis, write the indices 1, 2 and 3 in binary as 1, 10 and 11. Reverse the digits and put them after the binary point. The positions are 0.1, 0.01 and 0.11 in binary, or 1/2, 1/4 and 3/4. The other axis does the same in base 3.</p></details>`,
    example: `<p>Draw X and Z independently and uniformly from 0 to 1. Each has mean 0.5, so the exact mean of X × Z is 0.5 × 0.5 = 0.25.</p>
    <p>Suppose four sample points produce 0.04, 0.16, 0.36 and 0.64. The sample estimate is (0.04 + 0.16 + 0.36 + 0.64) ÷ 4 = 0.30. Its absolute error is |0.30 − 0.25| = 0.05.</p>`,
    setup: "The page starts with 32 points per design. It displays the design for the selected seed, then draws 11 more per method for the average error. One point costs one model evaluation.",
    fields: [count("Points per design",32,[8,16,32,64,128,256]),seed],
    predict: "Which design will look least clustered? Will its estimate always be closest to 0.25?",
    read: "Compare how the points fill the squares. In <strong>Exact mean = 0.25</strong>, look for the smallest <strong>Mean absolute error across 12 seeds</strong>.",
    steps: ["Change <strong>Points per design</strong> to 128 and rerun. Compare <strong>Mean absolute error across 12 seeds</strong> with the first run. Which method’s average error fell most?","Set <strong>Random seed</strong> to 19 and rerun. Does the design with the smallest <strong>Absolute error</strong> for this seed also have the smallest <strong>Mean absolute error across 12 seeds</strong>?"],
    task: "Recommend an evaluation budget and a stability check for a slow model. State why this example cannot guarantee a design always wins.",
    answer: "More regular coverage often helps this smooth two-input average. A single seed can favour a different design. How well a design works depends on the response shape and the number of inputs. Even an evenly spread design can miss a small region with a sudden jump. Compare error or stability against cost on the question you actually need to answer.",
    refs: ["qmc","lhs"],
  },
};
