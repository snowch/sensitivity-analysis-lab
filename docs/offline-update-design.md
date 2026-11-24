# Offline access and updates

Copyright © 2026 Christopher Snow.

This course reuses the verified release and two-phase restart protocol described in [CUDA C++ Lab](https://github.com/snowch/cuda-cpp-lab/blob/main/docs/offline-update-design.md). Its numerical experiments use ordinary JavaScript workers, so there is no Python or WASM installation to manage.

## Learner experience

App status is available in every page header. Small version checks happen automatically; they do not download the whole course. Normal online visits request current HTML, whose dependencies are pinned to one immutable release. An open lesson is never replaced automatically.

Choose **Save offline copy** before disconnecting. The saved copy includes all 23 lessons, worked examples, reference pages, diagrams, the local font, numerical models and experiment workers. CSV, notes and report downloads are generated locally and work offline. External reference websites and other labs require a connection.

**Up to date online** describes online freshness. Only a complete byte-count and SHA-256 verification permits **Downloaded and ready to use offline** and its tick. **Update offline copy** stages the next complete release and then offers **Restart to update**. It needs no second download. Cancellation keeps verified files for resumption; interrupted transfers resume when the connection returns. A failed update leaves the previously verified copy usable. **Repair offline copy** recovers missing or damaged files while online.

Removing the offline copy requires confirmation. It removes only this course's downloaded files, not notes, report drafts, recorded capstone runs, preferences or other labs. Browsers can still evict storage; readiness is verified rather than inferred from a completion flag.

## Saved work and restart

The service worker asks every open course window to prepare before switching the selected release. Active experiments, CSV generation, text composition or unavailable storage veto the restart. Each window saves and reads back an IndexedDB snapshot and stores its own snapshot token in session storage. Editing and navigation are briefly locked while preparing. Abort unlocks every window; commit reloads each window only after all acknowledge.

Snapshots preserve form values, predictions, explanations, report and investigation notes, knowledge-check feedback, disclosures and reading position. Generated experiments preserve their six actual run records and next run number; restoration rebuilds tables and canvas plots from those records. Legacy experiments preserve their genuine rendered output and internal comparison maps, so the next run still compares against the previous run. Restoration does not execute an experiment or invent a replacement result. Existing localStorage keys remain intact.

A missing worker is an infrastructure failure. Keep earlier output and show a persistent native recovery dialog with a dimmed backdrop, Reload lesson and Stay on lesson. Reload saves the same verified snapshot first; failed storage blocks it. Ordinary experiment validation remains inline.

## Build and publication

The build clears only its owned output directory; custom output directories must be empty. It fingerprints the output and worker contract, copies assets to `releases/<id>/`, pins HTML assets, and emits exact bytes and SHA-256 for every required file. Font and worker imports resolve relative to their pinned modules/stylesheets. Service-worker installation does not silently download the course.

Before publication, preserve legacy dependency aliases for older open pages and the two prior immutable releases. Verify fetched bytes; abort publication if preservation fails. The publish job consumes the already-tested build artifact, so a publication-only retry does not repeat numerical and browser checks. Tests import the actual retention helpers and exercise the publication entry point, guarding against incorrect adapter import paths.

## Functional verification

`npm test` checks the existing numerical examples, deterministic complete builds, every manifest byte and hash, pinned lesson assets and exact-byte retention including rejection of corruption.

`npm run test:browser` saves the complete course before running anything, closes the browser, stops the HTTP server, reopens offline and runs all 23 genuine experiments. It checks original and edited runs, restored generated and legacy comparisons, unvisited lessons, CSV/report exports, safe removal, four widths in both themes, keyboard focus and modal cancellation. A separate small two-release fixture checks cancellation/resumption, failed-update recovery, two-window busy/storage veto and atomic restart with independent saved work. Fixture records are protocol evidence, not numerical experiment output.

Functional tests and author review do not establish learning effectiveness or physical Android performance.
