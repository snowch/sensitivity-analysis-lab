export const reportTemplate = `Question and decision rule
- What are you deciding, what will you measure, and what result would justify acting?

Model and assumptions
- Model and scope:
- Input ranges, units, evidence, and dependence:
- What varies in the world and what is uncertain about our knowledge:

Method and checks
- Why this method fits the question:
- Design, sample size, seed and compared conditions:
- Numerical repeat, alternative assumptions, and model credibility check:

Results and recommendation
- Evidence, including one number with units or a probability:
- Which assumption changed the decision or mattered most:
- What I would do, hold steady in a pilot, and what would overturn the decision:
`;

export const reportGuide = `<section class="reading" aria-labelledby="rubric"><h2 id="rubric">Assess the report</h2>
<p>Before downloading your report, check that someone else could repeat your analysis and see how the results support your choice.</p>
<div class="table-wrap"><table><thead><tr><th scope="col">Criterion</th><th scope="col">Meets the standard when…</th></tr></thead><tbody>
<tr><th scope="row">Question</th><td>You identify an action, a decision metric with units or a probability, and a threshold set before comparing options.</td></tr>
<tr><th scope="row">Assumptions</th><td>You explain each range, the burst model and whether independence is plausible. You distinguish teaching assumptions from measured values.</td></tr>
<tr><th scope="row">Methods</th><td>You use one result to check your staffing rule and another to test whether the recommendation or its explanation holds when you change an assumption, output or method. You explain any difference using the quantity each analysis measures. You separate variation from the predicted effect of an extra shift.</td></tr>
<tr><th scope="row">Checks</th><td>You record the seeds and number of runs, test a different range and arrival model, and name a measurement that could show your assumptions are wrong.</td></tr>
<tr><th scope="row">Decision</th><td>You compare the expected improvement with your rule and the shift cost. You state when the choice changes and propose a small test under comparable conditions.</td></tr>
</tbody></table></div>
<details class="answer"><summary>Read a complete worked report</summary>
<h3>Question and decision rule</h3><p>I would pay $25 for a third volunteer if the current team exceeds a 10-minute wait in more than 10% of modelled events and the extra volunteer brings that probability down to 10% or less. Both the limit and cost are illustrative.</p>
<h3>Setup and evidence</h3><p>I modelled 60–160 guests, service of 20–40 guests per volunteer per half hour, and a peak share of 30–80%, independently and uniformly. These are plausible exercise bounds, with no observations to establish shape or independence. Larger events could have more concentrated arrivals and manual registration could slow service.</p>
<h3>Analysis and checks</h3><p>With 1,024 runs and seed 42, the full-burst model gives 23.2% of events above 10 minutes with two volunteers and 3.0% with three. The spread assumption gives 12.9% and 1.0%, respectively. I restored the original bounds and full-burst model, selected the late-event indicator and compared Sobol rankings at 1,024 and 4,096 pairs under seed 42. I repeated the larger run at seed 19. Guest count led by total order in all three runs, with burst share close behind in the last run. Those indices describe variation in whether the wait exceeds 10 minutes. The rank screen on waits describes ordering across all wait times.</p>
<h3>Recommendation and limits</h3><p>I would plan for three volunteers provisionally. Lowering minimum service to 12 people per volunteer per half hour raises the simulated risk with three volunteers to 13.4%, above the original rule. I would time check-ins during a pilot with comparable arrivals and record queue length and customer waits. If pilot service is that slow or measured waits exceed the model estimates, I would compare faster check-in with adding a third volunteer under similar arrivals. I would look for the lower-cost option that brings the chance of waiting over 10 minutes to 10% or less.</p>
</details></section>`;
