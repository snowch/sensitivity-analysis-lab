const canvas = document.querySelector(".concept-curve");

if (canvas) {
  const draw = () => {
    const context = canvas.getContext("2d");
    if (!context) return;
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.scale(ratio, ratio);

    const styles = getComputedStyle(canvas);
    const color = name => styles.getPropertyValue(name).trim();
    const left = 35;
    const top = 21;
    const right = width - 13;
    const bottom = height - 42;
    const x = value => left + (right - left) * (value - 1.65) / 1.5;
    const y = value => bottom - (bottom - top) * (value - 2) / 8;

    context.font = "12px system-ui, sans-serif";
    context.fillStyle = color("--muted");
    context.strokeStyle = color("--line");
    for (const value of [2, 4, 6, 8, 10]) {
      context.beginPath();
      context.moveTo(left, y(value));
      context.lineTo(right, y(value));
      context.stroke();
      context.textAlign = "right";
      context.fillText(value, left - 8, y(value) + 4);
    }
    context.strokeStyle = color("--edge");
    context.beginPath();
    context.moveTo(left, top);
    context.lineTo(left, bottom);
    context.lineTo(right, bottom);
    context.stroke();
    context.textAlign = "center";
    for (const value of [2, 2.5, 3]) context.fillText(value, x(value), bottom + 17);
    context.fillText("Input (units)", (left + right) / 2, height - 5);
    context.textAlign = "left";
    context.fillText("Output (points)", left, 12);

    function drawLine(points, stroke, lineWidth = 2, dash = []) {
      context.strokeStyle = stroke;
      context.lineWidth = lineWidth;
      context.setLineDash(dash);
      context.beginPath();
      points.forEach(([px, py], index) => {
        if (index === 0) context.moveTo(x(px), y(py));
        else context.lineTo(x(px), y(py));
      });
      context.stroke();
    }
    function marker(px, py, fill, radius) {
      context.fillStyle = fill;
      context.beginPath();
      context.arc(x(px), y(py), radius, 0, 2 * Math.PI);
      context.fill();
    }

    const square = Array.from({ length: 61 }, (_, index) => {
      const input = 1.65 + index * 0.025;
      return [input, input ** 2];
    });
    drawLine(square, color("--ink"), 1.5);
    drawLine([[1.65, 2.6], [3.15, 8.6]], color("--diagram-teal"), 2, [5, 4]);
    drawLine([[2, 4], [3, 9]], color("--diagram-blue"));
    drawLine([[2, 4], [2.1, 4.41]], color("--diagram-rust"), 3);
    marker(3, 9, color("--diagram-blue"), 4);
    marker(2.1, 4.41, color("--diagram-rust"), 3);
    marker(2, 4, color("--ink"), 3.5);
  };

  new ResizeObserver(draw).observe(canvas);
  new MutationObserver(draw).observe(document.documentElement, { attributeFilter: ["data-theme"] });
}
