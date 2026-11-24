# Offline interaction review

Copyright © 2026 Christopher Snow.

The UX skill from the author's Causal Inference Lab was applied before implementation and after browser checks. The learner's next action is Save offline copy in App status; online freshness and a verified downloaded copy are distinct states. The one-time save is explicit. Details are optional, while readiness, progress, cancellation, update and restart remain visible. The dialog has a dimmed backdrop, keyboard focus handling and a persistent error message.

No lesson prerequisites or numerical models changed. The journey diagram now labels 18 minutes as an illustrative single trip and states that its five values were not sampled or measured, are assumed equally likely and average 22 minutes. Its 20% late-arrival calculation still uses the visible 25-minute limit, counting a trip exactly at the limit as on time.

Saved learner work retains its original keys. A restart restores recorded evidence without rerunning it. Generated experiments restore actual run records and plots; legacy comparisons restore their underlying maps as well as visible output. External reference links are identified as needing internet access.

Verification commands and failure cases are described in offline-update-design.md. Browser journeys cover four widths, both themes, visible instructions, native modal cancellation, genuine offline experiments and interruption/restart paths. Test-harness failures are retained in the execution logs and are not presented as product failures or passing checks. Functional verification is separate from evidence of learning effectiveness.

Publication review: a real public asset audit identified a required empty `.nojekyll` marker omitted by Actions. The fix excludes that deployment-only marker, preserves hidden upload files and verifies the downloaded publication artifact. Regression tests cover a missing or corrupted hidden dependency and retention of the earlier marker-affected release. This addresses the build-to-deployment gap; it does not change lesson models or prerequisites.
