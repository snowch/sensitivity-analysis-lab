import { number, select, seed, count, when } from "./foundations.mjs";

export const methods = {
  patterns: {
    experimentTitle: "Compare the scores with the scatterplots",
    goal: "Use the shape of a scatterplot to decide whether a correlation or a fitted line is useful.",
    concept: `<h2>Look at the shape before reading a score</h2>
    <p>Each dot in the scatterplot is one run. <strong>Pearson correlation</strong> measures how closely the points follow a straight rising or falling line. Give each run one rank for its input value and another for its output. <strong>Spearman correlation</strong> compares those two ranks across runs. The Spearman score can be strong for a curve that always rises.</p>
    <p>In a U shape, the left side falls and the right side rises. The two trends can cancel in either score.</p>
    <h2>Check what a fitted line explains</h2>
    <p>Linear regression fits a straight-line effect for each input and adds those effects to predict the output. Here, <strong>R²</strong> is the fraction of output variance explained by that fit.</p>
    <p>A standard deviation is the square root of variance. It measures spread in the original units. A <strong>standardised slope</strong> measures how many output standard deviations the prediction changes when one input rises by one of its own standard deviations and the other input stays fixed.</p>
    <p>Use the slopes when the fit represents the response and the inputs vary enough on their own. Separate slopes can be unstable when inputs move together. A fit with straight-line effects can miss bends and interactions.</p>`,
    example: `<p>Take the exact response Y = 3X + Z. X and Z are independent and each has standard deviation 1.</p>
    <ol>
      <li><strong>Find the output spread.</strong> The variance is 3² + 1² = 10, so the standard deviation is √10.</li>
      <li><strong>Express both slopes on the same scale.</strong> For X, divide 3 by √10 to get about 0.949. For Z, divide 1 by √10 to get about 0.316.</li>
    </ol>
    <p>Squaring the slopes gives variance shares for this independent additive model. With dependent inputs or a poor fit, interpret them as slopes.</p>`,
    setup: "The page samples X and Z independently from −1 to 1 for 256 runs. The model adds 0.35 × Z to the selected X response. Its random noise ranges from minus to plus the value in <strong>Noise half-width (points)</strong>.",
    fields: [select("shape","X response","linear",[["linear","Straight: X"],["cubic","Always rising: X³"],["u","U shape: X²"]]),number("noise","Noise half-width (points)",.05,0,.5,.05),seed],
    predict: "If X has a strong U-shaped effect, will a small correlation tell you it is safe to drop X?",
    read: "In <strong>Global screens on the same sample</strong>, compare <strong>Pearson r</strong>, <strong>Spearman ρ</strong> and <strong>Standardised slope</strong> for X and Z. Which input scores higher in absolute value in the straight response?",
    steps: ["Set <strong>X response</strong> to <strong>Always rising: X³</strong> and run again. Then select <strong>U shape: X²</strong> and run. In the X row of <strong>Global screens on the same sample</strong>, read <strong>Pearson r</strong> and <strong>Spearman ρ</strong>. In each run, compare those scores with the shape of the X scatterplot. Open the earlier run and its <strong>Plots from this run</strong> to see both. Which shape gives small scores even though the output changes strongly with X? Read <strong>Linear model R²</strong> in <strong>Model fit</strong> to see how much variance the fit explains.","Keep <strong>U shape: X²</strong> selected. Set <strong>Noise half-width (points)</strong> to 0.3 and run again. Can you still see both sides of the U in the X plot? Compare <strong>Linear model R²</strong> with the previous U-shaped run."],
    task: "Decide whether to drop X in the U-shaped case. Name a method that could detect X’s U-shaped effect on the output even when both correlation scores are near zero.",
    answer: "Keep X. A square responds strongly at both ends, while its signed trends average out. The linear fit can favour Z and still miss much of the output. Inspect the scatter and use a more appropriate model, Morris or variance-based sensitivity. Check the resulting assumptions and fit as well.",
    refs: ["spearman","regression"],
  },
  morris: {
    experimentTitle: "Calculate an elementary effect",
    goal: "Use short sequences of one-input changes to find inputs with large or changing effects.",
    concept: `<h2>Follow a path through the input settings</h2>
    <p>On a <strong>Morris trajectory</strong>, start at one grid point and change each input once in a random order. One starting evaluation and three moves cost four model evaluations for three inputs.</p>
    <p>For each move, subtract the old output from the new one. Divide by the signed change on the common 0–1 input scale. This slope is the <strong>elementary effect</strong>. Repeat from other starting points to see how the effect varies.</p>
    <h2>Read the size and spread of the effects</h2>
    <ul>
      <li><strong>Mean effect μ.</strong> Average the slopes with their signs. Positive and negative slopes can cancel.</li>
      <li><strong>Mean absolute effect μ*.</strong> Average the sizes of the slopes. The units are output points per scaled input unit.</li>
      <li><strong>Effect standard deviation σ.</strong> Measure how much the slopes vary across paths. A large σ can come from curvature, interaction or both. Use it to choose which response curves to inspect.</li>
    </ul>`,
    example: `<p>In Y = 3X + Z + 0.5W, hold Z and W at 0. Move X from 0 to 2/3, so Y goes from 0 to 2. The effect is 2 ÷ (2/3) = 3. Every X step gives 3, so μ* = 3 and σ = 0.</p>
    <p>Now use Y = 3X² + Z + 0.5W. Moving X from 0 to 2/3 gives a slope of 2. Moving from 1/3 to 1 gives a slope of 4. The X effect varies even in this formula without interactions.</p>`,
    setup: "The page uses four levels (0, 1/3, 2/3, 1), a step of 2/3, and random step directions and input order. Each path is sampled separately.",
    fields: [select("model","Response","add",[["add","Additive: 3X + Z + 0.5W"],["curved","Curved: 3X² + Z + 0.5W"],["product","Interacting: 3XZ + Z + 0.5W"]]),count("Trajectories",12,[4,12,32,128]),seed],
    predict: "Can both curvature and interaction give X a large σ?",
    read: "In <strong>First trajectory</strong>, compare the <strong>Start</strong> row with the next row. Subtract the earlier <strong>Output</strong> from the later one. Divide by the later minus earlier value of the input named under <strong>Changed</strong>. Check your calculation in <strong>Effect for this step</strong>.",
    steps: ["Set <strong>Response</strong> to <strong>Curved</strong> and run. Then select <strong>Interacting</strong> and run again. In <strong>Screening results</strong>, compare <strong>Mean absolute effect μ*</strong> and <strong>Effect SD σ</strong> for X and Z. Which input has a large effect spread in both models?","Keep <strong>Interacting</strong> selected and set <strong>Trajectories</strong> to 128. Run again. Open the preceding run with 12 trajectories under <strong>Earlier runs</strong>. Does the order by <strong>Mean absolute effect μ*</strong> change?"],
    task: "Explain how you would investigate a high-μ*, high-σ input. What can the Morris results tell you about changes in the input’s effect that a slope measured with all inputs halfway across their ranges could miss?",
    answer: "A centre slope cannot show how the slope changes elsewhere. In Curved, X changes effect as its own start value changes. In Interacting, X changes effect because Z changes. For a follow-up analysis, plot output against X with one line for low Z and another for high Z. Hold W fixed. A bend within a line shows curvature in X. Different slopes at the same X show that X’s effect depends on Z. Few trajectories can miss a narrow active regime, so test a larger design and investigate important thresholds separately.",
    refs: ["morris","campolongo","salib"],
  },
  "interaction-lab": {
    experimentTitle: "Compare the effect at two pressures",
    goal: "Check when the effect of one input depends on the value of another.",
    concept: `<h2>Compare the same change under two conditions</h2>
    <p>Here X is an arrival score from 0 to 10. Z measures pressure from 0 for spare capacity to 1 for high pressure. There is an <strong>interaction</strong> if a change in arrivals affects delay differently at different pressures.</p>
    <p><strong>Input dependence</strong> describes how often pairs occur. A formula can interact even when its inputs are sampled independently. Dependent inputs can also enter a formula that adds their separate effects.</p>
    <ul>
      <li><strong>Additive model.</strong> Delay is 5 + X + 3Z minutes.</li>
      <li><strong>Regime model.</strong> Delay starts at 5 + X minutes. If X crosses a threshold, each excess unit adds 5 × Z minutes.</li>
    </ul>
    <p>The line plot holds pressure fixed on each line. The heatmap shows delay for a larger grid of arrival scores and pressures.</p>`,
    example: `<p>Move arrivals from X = 4 to X = 6. Compare the delay change at low and high pressure.</p>
    <ul>
      <li><strong>Additive model.</strong> At Z = 0, delay rises from 9 to 11 minutes. At Z = 1, it rises from 12 to 14 minutes. The difference between the two changes is 2 − 2 = 0.</li>
      <li><strong>Regime model with threshold 5.</strong> At Z = 0, delay rises by 2 minutes. At Z = 1, it rises by 7 minutes. The high-pressure effect is 5 minutes larger.</li>
    </ul>`,
    setup: "The starting settings compare arrival scores 4 and 6. The page calculates both at pressure 0 and 1. In the heatmap, rows are pressures, columns are arrival scores and cells are delays in minutes.",
    fields: [select("model","Response","add",[["add","Additive"],["regime","Regime interaction"]]),number("low","Low arrivals (scaled units)",4,0,9),number("high","High arrivals (scaled units)",6,1,10),when(number("regime","Regime threshold",5,1,9),"model","regime")],
    predict: "In the regime model, what delay do you get at high arrivals 6 and pressure 1?",
    read: "In <strong>Complete a two-input comparison</strong>, read <strong>High minus low</strong> at both pressure settings. In the Additive run, what do those two values and the parallel lines tell you about the effect of changing arrivals?",
    steps: ["Set <strong>Response</strong> to <strong>Regime interaction</strong>. The page shows <strong>Regime threshold</strong> at 5. Run again and read <strong>Delay at Z=1 (min)</strong> in the row for arrivals 6. Compare the two <strong>High minus low</strong> values. Which combinations have the largest delays in the heatmap?","Set <strong>Low arrivals (scaled units)</strong> to 2 and <strong>High arrivals (scaled units)</strong> to 4. Keep <strong>Regime threshold</strong> at 5 and run again. Compare the two <strong>High minus low</strong> values. Do they differ when both arrival settings are below the threshold?"],
    task: "Explain what a test that raises arrivals only at pressure 0 would miss about delays when arrivals exceed the threshold at high pressure.",
    answer: "In the regime model, the overload penalty is zero at pressure 0. The model adds a penalty only when pressure is above 0 and arrivals exceed the threshold. To use this model for a real service, check paired records of arrivals and pressure to estimate how often arrivals exceed the threshold while pressure is high.",
  },
  variance: {
    experimentTitle: "Find what each switch explains",
    goal: "Work from squared deviations and conditional means to exact variance shares.",
    concept: `<h2>Measure how much outcomes vary</h2>
    <p>Variance is the average squared distance from the mean. Squaring keeps positive and negative deviations from cancelling and gives large deviations extra weight. Variance has squared units. Its square root is the standard deviation, in the original units.</p>
    <p>To see what one input explains, group outcomes by that input and average each group. These <strong>conditional means</strong> tell you where the output tends to land when you know the input.</p>
    <h2>Assign shares of the variance</h2>
    <p>For independent inputs, Sobol indices divide variance into shares.</p>
    <ul>
      <li><strong>First-order index.</strong> Divide the variance of the conditional means by the total variance. This is the input’s share on its own.</li>
      <li><strong>Second-order index.</strong> Group outputs by each combination of the two inputs’ values and calculate each group’s mean. Weight each group mean by the probability of that input combination when calculating their variance. Divide that variance by total output variance to get the joint share. Subtract the two inputs’ first-order shares from the joint share.</li>
      <li><strong>Total-order index.</strong> Add the input’s own share and every interaction that involves it. With just two inputs, this equals 1 minus the other’s first-order share.</li>
    </ul>
    <p>With more inputs, interactions can involve three or more. The gap between total and first order gives an input’s combined interaction share. Inspect its second-order indices to see which pairs contribute. Any share left over comes from interactions involving that input and at least two others.</p>`,
    example: `<p>Two independent switches X and Z each turn on half the time. The four switch combinations are equally likely. Their outputs Y = X × Z are 0, 0, 0 and 1.</p>
    <ol>
      <li><strong>Find total variance.</strong> The mean is 1/4. The variance is [3 × (1/4)² + (3/4)²] ÷ 4 = 3/16.</li>
      <li><strong>Group by X.</strong> The mean is 0 when X is off and 1/2 when it is on. The variance of those means is [(0 − 1/4)² + (1/2 − 1/4)²] ÷ 2 = 1/16.</li>
      <li><strong>Find the shares.</strong> X explains (1/16) ÷ (3/16) = 1/3 on its own. Z also explains 1/3. The pair gets the remaining 1/3, so either input’s total share is 2/3.</li>
    </ol>`,
    setup: "The page calculates all four switch combinations directly. Each row has a probability of one quarter.",
    fields: [select("rule","Output rule","both",[["both","1 only when both switches are on"],["sum","Count the switches that are on"]])],
    predict: "If the output counts switches, what remains for a pair interaction?",
    read: "Find the mean and variance in <strong>Output summary</strong>. Then find X’s <strong>First-order share</strong> in <strong>Variance explained by conditional averages</strong>.",
    steps: ["Set <strong>Output rule</strong> to <strong>Count the switches that are on</strong>. Calculate the mean output when X is off and when it is on. Run again and check <strong>Mean when off</strong> and <strong>Mean when on</strong> for X in <strong>Variance explained by conditional averages</strong>.","Open the first run under <strong>Earlier runs</strong>. Compare <strong>Pair share</strong> in <strong>Output summary</strong> for both runs. Add the values in <strong>Total-order share</strong> for X and Z in each run. When is that sum above 1, and why?"],
    task: "Explain why adding the two switches’ <strong>First-order share</strong> values can give less than 1, while adding their <strong>Total-order share</strong> values can give more than 1.",
    answer: "For the count, outputs 0, 1, 1, 2 have variance 0.5. Conditional means 0.5 and 1.5 have variance 0.25. Both first orders equal their total orders, 0.5, and there is nothing left for the pair. In the product both totals count the same pair term, whereas neither first order counts it.",
    refs: ["sobol"],
  },
  "sobol-lab": {
    experimentTitle: "Compare estimated and exact shares",
    goal: "Estimate first, second and total orders for continuous inputs, then change the output to study a rare event.",
    concept: `<h2>Estimate the shares by swapping inputs</h2>
    <p>For each sample pair, the page draws two independent input settings and evaluates the model at both. It also evaluates two mixed settings, one with X from the first draw and Z from the second, and one with those sources reversed.</p>
    <ul>
      <li><strong>Total order.</strong> Large output changes when you swap X suggest that X has a large total effect.</li>
      <li><strong>First order.</strong> Compare outputs that share the same X to estimate what X explains on its own.</li>
      <li><strong>Pair share.</strong> Estimate how much variance comes from X and Z acting together.</li>
    </ul>
    <p>Swapping requires independent inputs so the mixed settings come from the intended distribution. Finite samples can give estimates that differ from the exact shares, including small negative estimates. The table shows their signs.</p>
    <details><summary>How the sampled indices are calculated</summary>
      <p>Let A and B be two independent settings. Each has an X and a Z value. Let Cₓ use X from B and Z from A. Let Y(A), Y(B) and Y(Cₓ) be their outputs. Estimate the variance V from the base outputs Y(A) and Y(B) across all pairs.</p>
      <p>For each pair, the change from swapping X is Y(Cₓ) − Y(A). The total-order estimate averages the squared change and divides by 2V. For the first-order estimate, multiply the change by Y(B) minus the mean of the base outputs. Average those products and divide by V. Swap the roles of X and Z for Z’s indices.</p>
      <p>For two inputs, the other mixed setting uses X from A and Z from B. Subtract the mean base output from every output. For each pair, square that mixed setting’s centred output and subtract the product of the two centred base outputs. Average those differences, divide by V, and subtract both first-order estimates to estimate the pair share.</p>
    </details>`,
    example: `<p>Let X and Z be independent and uniform on 0–1. Each has mean 1/2 and mean square 1/3, so each input has variance 1/3 − (1/2)² = 1/12.</p>
    <ol>
      <li><strong>Product variance.</strong> The product’s mean is (1/2)² = 1/4. Its mean square is (1/3)² = 1/9. Subtract the squared mean to get 1/9 − 1/16 = 7/144.</li>
      <li><strong>Variance of conditional means.</strong> At X = x the average product is x/2. Halving X divides its variance by four, giving 1/48 = 3/144.</li>
      <li><strong>Shares.</strong> X explains (3/144) ÷ (7/144) = 3/7 on its own. So does Z. The pair gets the remaining 1/7, and either input’s total share is 4/7.</li>
    </ol>`,
    setup: "The page draws X and Z independently and uniformly between 0 and 1. <strong>Model output Y</strong> uses the selected <strong>Continuous model</strong>. The rare-jump model returns 10X and adds 18 when Z exceeds 0.98. <strong>Event indicator</strong> uses that model automatically and records 1 for Y above 14 and 0 otherwise.",
    fields: [select("objective","Output to decompose","raw",[["raw","Model output Y"],["event","Event indicator: rare-jump Y > 14"]]),when(select("model","Continuous model","product",[["add","Additive: X + 2Z"],["product","Product: X × Z"],["tail","Rare jump"]]),"objective","raw"),count("Independent sample pairs",1024,[128,1024,8192,32768]),seed],
    predict: "Will the input with the largest share of variance in Y also have the largest share of variance in whether Y exceeds 14?",
    read: "In <strong>Estimated versus exact</strong>, compare each estimate with the value in <strong>Exact</strong>.",
    steps: ["Set <strong>Independent sample pairs</strong> to 8,192 and run again. Open the first run under <strong>Earlier runs</strong>. In <strong>Estimated versus exact</strong>, which estimates moved closer to their exact values?","Keep <strong>Output to decompose</strong> at <strong>Model output Y</strong>. Set <strong>Continuous model</strong> to <strong>Rare jump</strong> and run again. In the <strong>Exact</strong> column, which input has the larger total-order share for the continuous output Y?","Set <strong>Output to decompose</strong> to <strong>Event indicator: rare-jump Y &gt; 14</strong> and run again. Compare <strong>X total order</strong> and <strong>Z total order</strong> in <strong>Estimated versus exact</strong> with the preceding run. Which input now explains all the exact variance?"],
    task: "In the <strong>Exact</strong> column, which input has the larger total-order share for the rare-jump model’s numeric output Y? Which has the larger share for the indicator of Y exceeding 14? Explain why the two answers differ. Name one risk of interpreting a small negative pair estimate as a real effect.",
    answer: "X explains more continuous variance: 100/12 ≈ 8.33 versus 18² × 0.02 × 0.98 ≈ 6.35 for Z. Only the jump can take the output above 14, so Z explains all exact variance of the event indicator. Small negative estimates may reflect finite sampling; inspect repeated designs and the model before claiming a negligible or important effect.",
    refs: ["sobol","saltelli2009","jansen","salib"],
  },
  dependence: {
    experimentTitle: "Allocate credit between the switches",
    goal: "See how two related inputs can receive credit for information they share.",
    concept: `<h2>Account for shared information</h2>
    <p>If X and Z are related, knowing X can reveal something about Z even when the formula uses only Z. Their contributions overlap. Use a method that accounts for how the inputs vary together.</p>
    <p>A <strong>Shapley effect</strong> keeps the probabilities of the original input pairs. For each possible order of learning the input values, measure how much extra output variance an input explains when its value becomes known. Average those extra shares across the orders. For X there are two orders to consider.</p>
    <ul>
      <li><strong>Learn X first.</strong> Use the share of variance explained by X alone.</li>
      <li><strong>Learn X after Z.</strong> Use the share left unexplained by Z alone. Knowing both inputs accounts for all variance in this model.</li>
    </ul>
    <p>The two credits add to 100%. They depend on the model and on how likely the different pairs are.</p>
    <h2>Choose a practical calculation</h2>
    <p>With many inputs, checking every subset can be expensive. Sparse data can also make conditional means hard to estimate. Sampling the orders reduces the cost and introduces simulation error.</p>
    <p>Group related inputs to measure how much variance they explain together. Analyse operating conditions separately to see whether the variance shares change across them. If you can justify a model with independent underlying drivers, use it to estimate sensitivity to those drivers.</p>`,
    example: `<p>Two switches are each on half the time and agree 90% of the time. The output Y is the value of Z.</p>
    <ol>
      <li><strong>X alone.</strong> When X is off and when it is on, the conditional means are 0.1 and 0.9. Their variance is 0.4² = 0.16. The output variance is 0.25, so X explains 0.16 ÷ 0.25 = 0.64.</li>
      <li><strong>X after Z.</strong> Z already gives you Y, so X adds zero.</li>
    </ol>
    <p>X’s Shapley effect is (0.64 + 0) ÷ 2 = 0.32. Here X is a <strong>proxy</strong>, an input that reveals information about Z.</p>`,
    setup: "The page lists all four pairs. It splits the chance of agreement equally between both switches off and both switches on. It splits the remaining chance between the two mismatched pairs.",
    fields: [number("agreement","Chance the switches agree (0–1)",.9,.05,.95,.05),select("model","Output","proxy",[["proxy","Proxy case: output is Z"],["add","Additive formula: X + 2Z"]])],
    predict: "Can X receive credit when the formula only uses Z?",
    read: "In <strong>How each input adds information</strong>, compare <strong>Explained alone</strong> with <strong>Added after the other</strong> for X. How do they contribute to its Shapley effect?",
    steps: ["Set <strong>Chance the switches agree (0–1)</strong> to 0.5 and run again. Compare X’s <strong>Shapley effect</strong> with the first run. Can X still tell you anything about Z?","Set <strong>Output</strong> to <strong>Additive formula: X + 2Z</strong>. Run with the agreement chance at 0.5. Change <strong>Chance the switches agree (0–1)</strong> to 0.9 and run again. Does the gap between X’s and Z’s <strong>Shapley effect</strong> get larger or smaller?"],
    task: "In the proxy case, what happens if you change X and hold Z fixed? Explain why that answer can differ from X’s Shapley effect.",
    answer: "At agreement 0.5, X reveals nothing about Z and earns zero credit in the proxy case. At 0.9, knowing X is informative and the allocation gives it 0.32. Holding Z fixed in the formula leaves Y unchanged when X changes. A real intervention can also change other variables and needs causal assumptions or experimental evidence.",
    refs: ["owen","song"],
  },
};
