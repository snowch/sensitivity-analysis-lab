import { experiments } from "./course-experiments.mjs";

self.onmessage = ({ data: { id, lesson, options } }) => {
  try {
    if (!Object.hasOwn(experiments,lesson)) throw new Error("This investigation is unavailable. Reload the page and try again.");
    const result = experiments[lesson](options);
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
};
