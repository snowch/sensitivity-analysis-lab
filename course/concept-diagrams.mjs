const figure = (id, title, content, caption) => `<figure class="concept-figure" id="${id}" aria-labelledby="${id}-title">
  <figcaption id="${id}-title">${title}</figcaption>
  ${content}
  <p class="concept-caption">${caption}</p>
</figure>`;

export const journeyDiagram = figure("journey-model-example", "From one trip to the chance of arriving late", `
  <div class="concept-journey-flow">
    <dl>
      <div><dt>Your choices</dt><dd>Route and departure time</dd></div>
      <div><dt>Conditions</dt><dd>Weather and traffic</dd></div>
      <div><dt>Model parameter</dt><dd>Minutes added per kilometre</dd></div>
    </dl>
    <span class="concept-arrow" aria-hidden="true"></span>
    <strong class="concept-journey-model">Journey-time model</strong>
    <span class="concept-arrow" aria-hidden="true"></span>
    <div class="concept-journey-time"><strong>18 min</strong><span>Output for one trip</span></div>
  </div>
  <div class="concept-ticket-example">
    <div class="concept-row"><strong>Five equally likely journey times</strong><span>25-minute limit</span></div>
    <div class="concept-ticket-groups">
      <div class="concept-ticket-on-time">
        <ul class="concept-tickets" aria-label="On time"><li>14 min</li><li>18 min</li><li>21 min</li><li>25 min</li></ul>
        <span>On time</span>
      </div>
      <div class="concept-ticket-late">
        <ul class="concept-tickets" aria-label="Late"><li>32 min</li></ul>
        <span>Late</span>
      </div>
    </div>
    <div class="concept-result"><span>1 late trip out of 5</span><span class="concept-arrow" aria-hidden="true"></span><strong>20% chance of arriving late</strong></div>
  </div>`,
  "These times are illustrative. The route, departure time and model settings stay fixed while weather and traffic vary. A parameter is a setting that changes how the model calculates its output. Trips exactly at the limit count as on time.");

export const secantDiagram = figure("square-secants", "Compare two steps on Y = X²", `
  <canvas class="concept-curve" role="img" aria-label="The long and short secants and the tangent meet at input 2, output 4. The shorter secant lies closer to the tangent."></canvas>
  <ul class="concept-curve-key">
    <li><span class="concept-swatch concept-line-long" aria-hidden="true"></span><span><strong>Step 1 to (3, 9)</strong><br>(9 − 4) ÷ 1 = 5</span></li>
    <li><span class="concept-swatch concept-line-short" aria-hidden="true"></span><span><strong>Step 0.1 to (2.1, 4.41)</strong><br>(4.41 − 4) ÷ 0.1 = 4.1</span></li>
    <li><span class="concept-swatch concept-line-tangent" aria-hidden="true"></span><span><strong>Tangent at (2, 4)</strong><br>Slope 4</span></li>
  </ul>`, "The slopes are in output points per input unit. The shorter step measures a slope closer to 4 on this smooth curve.");

export const percentileDiagram = figure("linked-percentiles", "How linked draws change which pairs occur", `
  <div class="concept-range-pair">
    <div><strong>Demand &gt;80</strong><div class="concept-range concept-range-high" aria-hidden="true"></div><div class="concept-scale"><span>40</span><span>80</span><span>100</span></div></div>
    <div><strong>Capacity &lt;60</strong><div class="concept-range concept-range-low" aria-hidden="true"></div><div class="concept-scale"><span>40</span><span>60</span><span>100</span></div></div>
  </div>
  <div class="concept-branches">
    <div><strong>80% · Same percentile</strong><span>The highlighted thirds are at opposite ends.</span><b>Chance of both = 0</b></div>
    <div><strong>20% · Independent percentiles</strong><span>Each highlighted third has a chance of 1/3.</span><b>Chance of both = 1/9</b></div>
  </div>
  <div class="concept-result"><span>Chance under the linked design</span><strong>0.8 × 0 + 0.2 × (1/9) ≈ 2.2%</strong></div>`,
  "Both inputs are uniform from 40 to 100 jobs/hour in this example. If all draws are independent, the chance of both conditions is 1/9.");

export const hypercubeDiagram = figure("hypercube-grid", "Four points, one in each bin on each axis", `
  <div class="concept-bins" aria-hidden="true">
    <span class="concept-bins-y">Z</span>
    <div class="concept-bins-grid">
      <i class="concept-point" style="--x:60%; --y:13%"></i><i class="concept-point" style="--x:10%; --y:40%"></i>
      <i class="concept-point" style="--x:88%; --y:66%"></i><i class="concept-point" style="--x:35%; --y:88%"></i>
    </div>
    <div class="concept-bins-xticks"><span>0</span><span>0.25</span><span>0.5</span><span>0.75</span><span>1</span></div>
    <div class="concept-bins-yticks"><span>1</span><span>0.75</span><span>0.5</span><span>0.25</span><span>0</span></div>
    <span class="concept-bins-x">X</span>
  </div>
  <p class="sr-only">The points are (0.10, 0.60), (0.35, 0.12), (0.60, 0.87) and (0.88, 0.34). Each row and each column contains exactly one point.</p>`,
  "For these uniform inputs, each bin is 0.25 units wide. The shuffled pairing covers each row and each column and leaves 12 of the 16 joint cells empty.");

export const trajectoryDiagram = figure("morris-trajectory-example", "Four evaluations along one Morris trajectory", `
  <table class="concept-table concept-trajectory">
    <thead><tr><th scope="col">Setting</th><th scope="col">Start</th><th scope="col">Move X</th><th scope="col">Move Z</th><th scope="col">Move W</th></tr></thead>
    <tbody>
      <tr><th scope="row">X</th><td>0</td><td class="concept-change">⅔</td><td>⅔</td><td>⅔</td></tr>
      <tr><th scope="row">Z</th><td>0</td><td>0</td><td class="concept-change">⅔</td><td>⅔</td></tr>
      <tr><th scope="row">W</th><td>0</td><td>0</td><td>0</td><td class="concept-change">⅔</td></tr>
      <tr class="concept-total"><th scope="row">Output Y</th><td>0</td><td>2</td><td>8/3</td><td>3</td></tr>
    </tbody>
  </table>
  <div class="concept-result"><span>Effect of the first move</span><strong>(2 − 0) ÷ (2/3) = 3</strong></div>`,
  "The example uses Y = 3X + Z + 0.5W and reports effects in output points per scaled input unit. The experiment randomises the input order and uses positive or negative moves.");

export const conditionalMeansDiagram = figure("switch-conditional-means", "Group the four outcomes by X", `
  <div class="concept-grouping">
    <div class="concept-group"><strong>X off</strong><span>Z off → 0<br>Z on → 0</span><span class="concept-arrow" aria-hidden="true"></span><b>Mean 0</b></div>
    <div class="concept-group"><strong>X on</strong><span>Z off → 0<br>Z on → 1</span><span class="concept-arrow" aria-hidden="true"></span><b>Mean 0.5</b></div>
  </div>
  <dl class="concept-measures">
    <div><dt>Grand mean</dt><dd>0.25</dd></div>
    <div><dt>Variance of the two group means</dt><dd>1/16</dd></div>
    <div><dt>Variance of the four outputs</dt><dd>3/16</dd></div>
  </dl>
  <div class="concept-result"><span>X’s first-order share</span><strong>(1/16) ÷ (3/16) = 1/3</strong></div>`,
  "The switches are independent and each is on half the time. The four pairs have equal probability, as do the two groups.");

export const swapDiagram = figure("sobol-sample-pair", "Follow the inputs through one Sobol sample pair", `
  <table class="concept-table concept-sobol">
    <thead><tr><th scope="col">Setting</th><th scope="col">X</th><th scope="col">Z</th><th scope="col">Y = X × Z</th></tr></thead>
    <tbody>
      <tr><th scope="row">A</th><td class="concept-source-a">0.2</td><td class="concept-source-a">0.4</td><td>0.08</td></tr>
      <tr><th scope="row">B</th><td class="concept-source-b">0.8</td><td class="concept-source-b">0.6</td><td>0.48</td></tr>
      <tr><th scope="row">C<sub>X</sub></th><td class="concept-source-b">0.8 <small>from B</small></td><td class="concept-source-a">0.4 <small>from A</small></td><td>0.32</td></tr>
      <tr><th scope="row">C<sub>Z</sub></th><td class="concept-source-a">0.2 <small>from A</small></td><td class="concept-source-b">0.6 <small>from B</small></td><td>0.12</td></tr>
    </tbody>
  </table>
  <div class="concept-branches">
    <div><strong>A and C<sub>X</sub></strong><span>Only X changes. This output difference is used for total order.</span></div>
    <div><strong>B and C<sub>X</sub></strong><span>Both have X = 0.8. The first-order estimate uses that shared X.</span></div>
  </div>`,
  "A and B are independent draws. These four evaluations illustrate the comparisons. The estimates combine many sample pairs, and swapping preserves the intended input distribution when X and Z are independent.");

export const shapleyDiagram = figure("shapley-learning-orders", "X’s credit depends on which switch you learn first", `
  <div class="concept-credit">
    <div class="concept-credit-lane">
      <strong>Learn X, then Z</strong>
      <div class="concept-chain"><b>0%</b><span>Learn X</span><b>64%</b><span>Learn Z</span><b>100%</b></div>
      <span class="concept-credit-x">X adds 64 percentage points</span>
    </div>
    <div class="concept-credit-lane">
      <strong>Learn Z, then X</strong>
      <div class="concept-chain"><b>0%</b><span>Learn Z</span><b>100%</b><span>Learn X</span><b>100%</b></div>
      <span class="concept-credit-x">X adds 0 percentage points</span>
    </div>
  </div>
  <div class="concept-result"><span>Average X’s two gains</span><strong>(64% + 0%) ÷ 2 = 32%</strong></div>`,
  "The numbers show the share of output variance explained by the values learned so far. The output Y equals Z. Both switches are on half the time and they agree 90% of the time.");

export const replicateDiagram = figure("replicate-groups", "See the variation within settings and across means", `
  <div class="concept-replicates" aria-hidden="true">
    <span>Output (points)</span>
    <div class="concept-dotplot">
      <div class="concept-dotplot-scale"><span>10</span><span>5</span><span>0</span></div>
      <div class="concept-dot-column"><i style="--y:0%"></i><i style="--y:10%"></i><i style="--y:30%"></i><i style="--y:40%"></i><b style="--y:20%"></b></div>
      <div class="concept-dot-column"><i style="--y:30%"></i><i style="--y:40%"></i><i style="--y:60%"></i><i style="--y:70%"></i><b style="--y:50%"></b></div>
      <div class="concept-dot-column"><i style="--y:60%"></i><i style="--y:70%"></i><i style="--y:90%"></i><i style="--y:100%"></i><b style="--y:80%"></b></div>
      <span></span><span>X = 0.2</span><span>X = 0.5</span><span>X = 0.8</span>
    </div>
    <div class="concept-dotplot-key"><span>● Replicate output</span><span>◆ Mean at that input</span></div>
  </div>
  <p class="sr-only">At X 0.2 the four outputs are 0, 1, 3 and 4, with mean 2. At X 0.5 the outputs are 3, 4, 6 and 7, with mean 5. At X 0.8 the outputs are 6, 7, 9 and 10, with mean 8.</p>`,
  "Compare dots within a column to see variation at one setting. Compare the diamonds across columns to see how the mean changes with X. These simplified outcomes illustrate the two kinds of variation.");

export const forecastDiagram = figure("forecast-decision-timing", "When you learn about the day changes what you can choose", `
  <div class="concept-forecast">
    <div>
      <strong>Without a forecast</strong>
      <span class="concept-stage">Choose before you learn how severe the day is</span>
      <div class="concept-policy"><b>Wait every day</b><span>75% mild · $0</span><span>25% severe · $60</span></div>
      <div class="concept-policy"><b>Prevent every day</b><span>$18 on either kind of day</span></div>
      <div class="concept-subtotal"><span>Wait is cheaper</span><strong>0.25 × $60 = $15/day</strong></div>
    </div>
    <div>
      <strong>With a perfect forecast</strong>
      <span class="concept-stage">Learn how severe the day is, then choose</span>
      <div class="concept-policy"><b>75% mild</b><span>Wait · $0</span></div>
      <div class="concept-policy"><b>25% severe</b><span>Prevent · $18</span></div>
      <div class="concept-subtotal"><span>Pay on severe days</span><strong>0.25 × $18 = $4.50/day</strong></div>
    </div>
  </div>
  <div class="concept-result"><span>Value of the perfect forecast</span><strong>$15 − $4.50 = $10.50/day</strong></div>`,
  "Prevention avoids the full $60 loss on a severe day. The saving is before paying for the forecast. A real forecast can be worth less.");

export const tuningDiagram = figure("tuning-data-flow", "Which data can influence the model you choose?", `
  <ol class="concept-tuning">
    <li><strong>Fit candidates</strong><span>Training rows</span><small>Try different learning rates and model sizes.</small></li>
    <li><strong>Choose one</strong><span>Validation rows</span><small>Pick the lowest loss among trials within the time limit.</small></li>
    <li><strong>Evaluate the choice</strong><span>Untouched test rows</span><small>Measure how the chosen configuration performs on new examples.</small></li>
  </ol>`,
  "Validation loss measures prediction error on rows held back from fitting. Keep the test rows out of fitting and selection. When comparing tuning procedures, evaluate them on the same untouched test rows.");

export const shuffleDiagram = figure("payload-shuffle-example", "Only the payload values trade places", `
  <div class="concept-shuffle-top">
    <div class="concept-shuffle-tags"><strong>Payload before</strong><span>Job 1: A</span><span>Job 2: B</span></div>
    <span class="concept-swap-lines" aria-hidden="true"></span>
    <div class="concept-shuffle-tags"><strong>Payload after</strong><span>Job 1: B</span><span>Job 2: A</span></div>
  </div>
  <table class="concept-table">
    <caption class="sr-only">Actual and predicted job latency in milliseconds</caption>
    <colgroup span="2"></colgroup><colgroup span="2"></colgroup>
    <thead>
      <tr><th scope="col" rowspan="2">Job</th><th scope="col" rowspan="2">Actual (ms)</th><th scope="colgroup" colspan="2">Predicted (ms)</th></tr>
      <tr><th scope="col">Before</th><th scope="col">After</th></tr>
    </thead>
    <tbody><tr><th scope="row">1</th><td>100</td><td>105</td><td>155</td></tr><tr><th scope="row">2</th><td>160</td><td>155</td><td>105</td></tr></tbody>
  </table>
  <div class="concept-result"><span>Mean absolute error</span><strong>5 ms → 55 ms</strong><span>Increase of 50 ms</span></div>`,
  "A and B are two payload values. The same predictor uses payload alone in this example. Job identity and measured latency stay fixed while the two predictions swap.");

export const backlogDiagram = figure("staffing-backlog", "The same burst of arrivals with two staffing options", `
  <div class="concept-arrivals"><strong>160 guests × 75% = 120 arrivals</strong><span>First 30 minutes · one volunteer can serve 30 people</span></div>
  <div class="concept-capacity">
    <div><div class="concept-row"><strong>Two volunteers</strong><span>30 min to clear · above limit</span></div>
      <div class="concept-capacity-bar" style="--served:50%"><span>60 served</span><span>60 waiting</span></div></div>
    <div><div class="concept-row"><strong>Three volunteers</strong><span>10 min to clear · at limit</span></div>
      <div class="concept-capacity-bar" style="--served:75%"><span>90 served</span><span>30 waiting</span></div></div>
  </div>`,
  "Divide the backlog by the number the team can serve in 30 minutes, then multiply by 30 minutes. This proxy assumes a fixed service rate and adds no arrivals during clearance. Exactly 10 minutes counts as meeting the wait limit.");
