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

export const tuningRelationshipDiagram = figure("tuning-sensitivity-relationship", "One set of trials, two purposes", `
  <p class="sr-only">Try combinations of learning rate and model size. Measure validation loss and training time for each trial. Sensitivity analysis asks how much the loss changes and whether the effect depends on model size. Use that information to plan the next trials. Tuning chooses the lowest-loss combination within the time limit from the trials you ran.</p>
  <svg class="concept-tuning-wide" viewBox="0 0 720 392" aria-hidden="true" focusable="false">
    <defs>
      <marker id="tuning-arrow-wide" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1L7 4L1 7" fill="none" stroke="var(--edge)" stroke-width="1.4" stroke-linejoin="round"/>
      </marker>
      <marker id="tuning-return-wide" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1L7 4L1 7" fill="none" stroke="var(--diagram-blue)" stroke-width="1.4" stroke-linejoin="round"/>
      </marker>
    </defs>

    <g transform="translate(0, -35)">
      <rect class="tuning-neutral" x="190" y="47" width="340" height="65" rx="12"/>
      <text class="tuning-heading" x="360" y="73" text-anchor="middle">Try combinations of settings</text>
      <text class="tuning-detail" x="360" y="95" text-anchor="middle">Learning rate and model size</text>

      <path class="tuning-line" d="M360 112V132" marker-end="url(#tuning-arrow-wide)"/>
      <rect class="tuning-neutral" x="190" y="134" width="340" height="65" rx="12"/>
      <text class="tuning-heading" x="360" y="160" text-anchor="middle">Record the results for each trial</text>
      <text class="tuning-detail" x="360" y="182" text-anchor="middle">Validation loss and training time</text>

      <path class="tuning-line" d="M360 199V218H181V241" marker-end="url(#tuning-arrow-wide)"/>
      <path class="tuning-line" d="M360 218H539V241" marker-end="url(#tuning-arrow-wide)"/>

      <rect class="tuning-analysis-surface" x="33" y="243" width="296" height="100" rx="12"/>
      <text class="tuning-heading tuning-analysis-ink" x="53" y="271">Sensitivity analysis</text>
      <text class="tuning-copy" x="53" y="299">How much does the loss change?</text>
      <text class="tuning-copy" x="53" y="322">Does the effect depend on model size?</text>
      <path class="tuning-feedback" d="M181 343V359 M87 386H17V79H189" marker-end="url(#tuning-return-wide)"/>
      <rect class="tuning-analysis-surface" x="87" y="360" width="188" height="49" rx="12"/>
      <text class="tuning-copy tuning-action" x="181" y="390" text-anchor="middle">Plan what to try next</text>

      <rect class="tuning-choice-surface" x="391" y="243" width="296" height="100" rx="12"/>
      <text class="tuning-heading tuning-choice-ink" x="411" y="271">Hyperparameter tuning</text>
      <text class="tuning-copy" x="411" y="299">Which tested combination has the</text>
      <text class="tuning-copy" x="411" y="322">lowest loss within the time limit?</text>
      <path class="tuning-line" d="M539 343V359" marker-end="url(#tuning-arrow-wide)"/>
      <rect class="tuning-choice-surface" x="445" y="360" width="188" height="49" rx="12"/>
      <text class="tuning-copy tuning-action" x="539" y="390" text-anchor="middle">Choose settings to use</text>
    </g>
  </svg>

  <svg class="concept-tuning-narrow" viewBox="4 0 312 514" aria-hidden="true" focusable="false">
    <defs>
      <marker id="tuning-arrow-narrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1L6 3.5L1 6" fill="none" stroke="var(--edge)" stroke-width="1.4" stroke-linejoin="round"/>
      </marker>
      <marker id="tuning-return-narrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="userSpaceOnUse">
        <path d="M1 1L6 3.5L1 6" fill="none" stroke="var(--diagram-blue)" stroke-width="1.4" stroke-linejoin="round"/>
      </marker>
    </defs>

    <g transform="translate(0, -29)">
      <rect class="tuning-neutral" x="24" y="40" width="272" height="61" rx="11"/>
      <text class="tuning-heading" x="160" y="66" text-anchor="middle">Try combinations of settings</text>
      <text class="tuning-detail" x="160" y="86" text-anchor="middle">Learning rate and model size</text>
      <path class="tuning-line" d="M160 101V121" marker-end="url(#tuning-arrow-narrow)"/>

      <rect class="tuning-neutral" x="24" y="123" width="272" height="61" rx="11"/>
      <text class="tuning-heading" x="160" y="149" text-anchor="middle">Record the results for each trial</text>
      <text class="tuning-detail" x="160" y="169" text-anchor="middle">Validation loss and training time</text>
      <path class="tuning-line" d="M160 184V204" marker-end="url(#tuning-arrow-narrow)"/>
      <path class="tuning-line" d="M296 153H311V429H298" marker-end="url(#tuning-arrow-narrow)"/>

      <rect class="tuning-analysis-surface" x="24" y="206" width="272" height="100" rx="11"/>
      <text class="tuning-heading tuning-analysis-ink" x="39" y="233">Sensitivity analysis</text>
      <text class="tuning-copy" x="39" y="258">How much does the loss change?</text>
      <text class="tuning-copy" x="39" y="281">Does the effect depend on model size?</text>
      <path class="tuning-feedback" d="M160 306V319 M48 340H9V70H23" marker-end="url(#tuning-return-narrow)"/>
      <rect class="tuning-analysis-surface" x="48" y="320" width="224" height="42" rx="10"/>
      <text class="tuning-copy tuning-action" x="160" y="346" text-anchor="middle">Plan what to try next</text>

      <rect class="tuning-choice-surface" x="24" y="379" width="272" height="100" rx="11"/>
      <text class="tuning-heading tuning-choice-ink" x="39" y="407">Hyperparameter tuning</text>
      <text class="tuning-copy" x="39" y="432">Which tested combination has the</text>
      <text class="tuning-copy" x="39" y="455">lowest loss within the time limit?</text>
      <path class="tuning-line" d="M160 479V493" marker-end="url(#tuning-arrow-narrow)"/>
      <rect class="tuning-choice-surface" x="48" y="495" width="224" height="41" rx="10"/>
      <text class="tuning-copy tuning-action" x="160" y="521" text-anchor="middle">Choose settings to use</text>
    </g>
  </svg>`,
  "Compare losses to understand what changes when you vary a setting. Apply the time limit when choosing a configuration.");

export const tuningDiagram = figure("tuning-data-flow", "Which data can influence the model you choose?", `
  <ol class="concept-steps">
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

export const benchmarkSizingWorkflow = figure("benchmark-sizing-workflow", "How the pilot shapes the benchmark and the sizing decision", `
  <ol class="concept-steps">
    <li><strong>Run a pilot</strong><span>Screen plausible factors</span><small>Repeat a baseline and test combinations. Check which changes move capacity beyond the variation across repeats.</small></li>
    <li><strong>Focus the benchmark</strong><span>Measure capacity across the important inputs</span><small>Vary interacting inputs together. Add measurements near the point where capacity flattens or crosses the target.</small></li>
    <li><strong>Size and confirm</strong><span>Use the measured capacity curve</span><small>Pick a tested configuration that handles peak demand with reserve capacity. Confirm it in a separate run.</small></li>
  </ol>`,
  "In the Kafka example, message size describes the workload, partition count is a choice, and broker count is fixed for this benchmark.");

export const kafkaSizingDiagram = figure("kafka-sizing-curves", "Which tested partition count meets the target?", `
  <svg class="concept-sizing-plot" viewBox="0 0 340 232" role="img" aria-labelledby="kafka-plot-title" aria-describedby="kafka-plot-description">
    <title id="kafka-plot-title">Illustrative Kafka throughput by partition count and message size</title>
    <desc id="kafka-plot-description">At 6, 12 and 24 partitions, 1 KiB messages reach 24, 42 and 46 MiB per second. Messages of 8 KiB reach 40, 71 and 74 MiB per second. With a 60 MiB per second target, 12 is the smallest tested partition count that qualifies for 8 KiB messages. None of the tested counts qualify for 1 KiB.</desc>
    <text class="concept-sizing-axis-title" x="11" y="16">Sustained throughput (MiB/s)</text>
    <path class="concept-sizing-grid" d="M46 24H271 M46 64H271 M46 104H271 M46 144H271 M46 184H271 M52 24V184 M124 24V184 M268 24V184"/>
    <path class="concept-sizing-axes" d="M46 24V184H271"/>
    <g class="concept-sizing-ticks" text-anchor="end">
      <text x="38" y="28">80</text><text x="38" y="68">60</text><text x="38" y="108">40</text><text x="38" y="148">20</text><text x="38" y="188">0</text>
    </g>
    <g class="concept-sizing-ticks" text-anchor="middle">
      <text x="52" y="204">6</text><text x="124" y="204">12</text><text x="268" y="204">24</text>
    </g>
    <text class="concept-sizing-axis-title" x="157" y="225" text-anchor="middle">Partition count</text>
    <path class="concept-sizing-threshold" d="M46 64H271"/>
    <text class="concept-sizing-ticks" x="277" y="68">Target</text>
    <g class="concept-sizing-small">
      <path d="M52 136 124 100 268 92"/>
      <rect x="49" y="133" width="6" height="6"/><rect x="121" y="97" width="6" height="6"/><rect x="265" y="89" width="6" height="6"/>
      <text x="277" y="97">1 KiB</text>
    </g>
    <g class="concept-sizing-large">
      <path d="M52 104 124 42 268 36"/>
      <circle cx="52" cy="104" r="4"/><circle cx="124" cy="42" r="4.5"/><circle cx="268" cy="36" r="4"/>
      <text x="118" y="34">71</text><text x="277" y="41">8 KiB</text>
    </g>
  </svg>`,
  "Illustrative values for a fixed three-broker cluster. Each point represents sustained throughput with p99 produce latency at or below 20 ms and no growing consumer backlog. At that latency limit, at least 99% of produce requests complete within 20 ms.");
