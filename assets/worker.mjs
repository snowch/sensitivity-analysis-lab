import { fitLogs, makeLogs, permutation, toCsv } from "./logs.mjs";
import { screen, sobol } from "./sensitivity.mjs";

let fitted;
self.onmessage = ({ data: { id, task, options } }) => {
  try {
    let result;
    switch (task) {
      case "screen":
        result = screen(options);
        break;
      case "assumptions":
        result = { rank: screen(options), indices: sobol(options) };
        break;
      case "logs":
        if (!fitted) fitted = fitLogs();
        result = permutation(fitted, options);
        break;
      case "csv":
        result = toCsv(makeLogs());
        break;
      default:
        throw new Error("Unknown experiment.");
    }
    self.postMessage({ id, result });
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
};
