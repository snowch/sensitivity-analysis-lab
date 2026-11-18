// Invented engineering ranges. The sampler treats these inputs as independent.
export const inputs = [
  { id: "cache_hit", label: "Cache hit rate", unit: "%", range: [65, 95], stage: "Fetch" },
  { id: "payload", label: "Payload size", unit: "MB", range: [2, 12], stage: "Process" },
  { id: "arrival", label: "Arrival rate", unit: "jobs/s", range: [450, 850], stage: "Queue" },
  { id: "capacity", label: "Worker capacity", unit: "jobs/s", range: [700, 1100], stage: "Queue" },
  { id: "network", label: "Network RTT", unit: "ms", range: [8, 12], wide: [2, 65], stage: "Fetch" },
  { id: "decode", label: "Decode cost", unit: "ms", range: [4, 8], stage: "Process" },
  { id: "batch", label: "Batch wait", unit: "ms", range: [1, 5], stage: "Queue" },
  { id: "retry", label: "Retry rate", unit: "%", range: [0, 4], stage: "Fetch" },
  { id: "sink", label: "Sink write", unit: "ms", range: [5, 9], stage: "Write" },
  { id: "tls", label: "TLS overhead", unit: "ms", range: [1, 3], stage: "Fetch" },
  { id: "compress", label: "Compression cost", unit: "ms", range: [2, 5], stage: "Process" },
  { id: "flush", label: "Flush wait", unit: "ms", range: [1, 4], stage: "Write" },
  { id: "telemetry", label: "Tracing overhead", unit: "ms", range: [0, 2], stage: "Write" },
];

export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    // Mulberry32, a deterministic generator for these reproducible exercises.
    state = (state + 0x6D2B79F5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function sampleInput(random, wideNetwork = false) {
  return inputs.map(({ range, wide }) => {
    const [low, high] = (wideNetwork && wide) || range;
    return low + random() * (high - low);
  });
}

export function overloaded(arrival, capacity) {
  return arrival >= 750 && capacity <= 800;
}

export function latency(row, queue = false) {
  const [hit, payload, arrival, capacity, network, decode, batch,
    retry, sink, tls, compression, flush, tracing] = row;
  const fetch = network + 1.5 * (100 - hit) + 0.8 * retry + tls;
  const process = 2.8 * payload + decode + compression;
  const wait = batch + (queue && overloaded(arrival, capacity) ? 155 : 0);
  return 12 + fetch + process + wait + sink + flush + tracing;
}
