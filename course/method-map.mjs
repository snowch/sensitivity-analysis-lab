export const methodMap = `<article class="lesson shell method-map-page">
  <header class="lesson-header">
    <h1>How the methods fit together</h1>
    <p>You need to get to class by 9 am. Use one journey to see how five methods help you choose a route and departure time.</p>
  </header>

  <figure class="method-map" aria-labelledby="model-map-title">
    <figcaption class="map-caption">
      <h2 id="model-map-title">From a model to a decision</h2>
      <p class="map-scroll-hint">Scroll sideways to see the full diagram.</p>
    </figcaption>

    <div class="map-viewport" data-scroll-region="model-map-title" data-scroll-center>
      <div class="map-track">
        <div id="journey-model" class="map-node map-model">
          <h3>Journey-time model</h3>
          <p>Use the route, departure time and traffic assumptions to estimate how long the trip takes.</p>
        </div>

        <div class="map-fan" aria-hidden="true"></div>
        <ul class="map-branches" aria-label="Three ways to analyse the journey-time model">
          <li>
            <div class="map-node map-scenario">
              <h3><a href="ranges.html">Scenario analysis</a></h3>
              <p>How do journeys compare under weekday traffic and weekend traffic?</p>
            </div>
          </li>
          <li>
            <div class="map-node map-uncertainty">
              <h3><a href="questions.html#experiment-title">Uncertainty analysis</a></h3>
              <p>How long might the trip take? How often might I arrive late?</p>
            </div>
          </li>
          <li>
            <div class="map-node map-sensitivity">
              <h3><a href="local.html">Sensitivity analysis</a></h3>
              <p>Which assumptions most change the estimated chance of being late?</p>
            </div>
          </li>
        </ul>
        <div class="map-join" aria-hidden="true"></div>
        <p class="map-bridge">These results can inform the choice</p>

        <div class="map-node map-decision">
          <h3><a href="tuning.html">Optimisation</a></h3>
          <p>Which route and departure time cost least while keeping the chance of arriving late below 10%?</p>
        </div>
      </div>
    </div>
  </figure>

  <figure class="method-map" aria-labelledby="records-map-title">
    <figcaption class="map-caption">
      <h2 id="records-map-title">From records to an explanation</h2>
      <p class="map-scroll-hint">Scroll sideways to see the full diagram.</p>
    </figcaption>
    <div class="map-viewport" data-scroll-region="records-map-title">
      <div class="map-track">
        <ol class="map-observed" aria-label="How predictive attribution uses past trips">
          <li class="map-node">
            <h3>Past trip records</h3>
            <p>Record journey times, traffic and distance.</p>
          </li>
          <li class="map-node">
            <h3>Travel-time predictor</h3>
            <p>Fit a model on some trips and check its predictions on trips it has never seen.</p>
          </li>
          <li class="map-node">
            <h3><a href="logs.html">Predictive attribution</a></h3>
            <p>Does this predictor rely more on traffic or distance to predict journey time?</p>
          </li>
        </ol>
      </div>
    </div>
    <p class="map-model-link">A fitted predictor can also provide estimates for the <a href="#journey-model">journey-time model above</a>.</p>
  </figure>

  <div class="reading map-note">
    <p>You can compare scenarios without assigning them probabilities. To ask how likely late arrival is, you need assumptions about how often the relevant conditions occur.</p>
  </div>
  <nav class="lesson-actions" aria-label="Continue learning">
    <a href="./#course">Course outline</a>
    <a class="button dark" href="questions.html">Back to Lesson 1</a>
  </nav>
</article>`;
