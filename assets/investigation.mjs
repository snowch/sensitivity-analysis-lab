const form = document.querySelector("#investigation");
const results = document.querySelector("#investigation-output");
const resultSection = results.closest(".investigation-results");
const history = document.querySelector("#run-history");
const status = document.querySelector("#investigation-status");
const resultTools = document.querySelector("#result-tools");
const exportButton = document.querySelector("#export-results");
const submit = form.querySelector("button[type=submit]");
const reset = form.querySelector("button[type=reset]");
const lesson = form.getAttribute("data-lesson");
const runSaveStatus = document.querySelector("#run-save-status");
let worker;
let activeOptions;
let runs = [];
let nextRun = 1;
const runKey = lesson === "capstone" ? "sensitivity-analysis-lab:capstone:runs-v1" : null;
const plots = new ResizeObserver(entries => {
  for (const { target } of entries) target.drawPlot();
});

const format = new Intl.NumberFormat("en", { maximumFractionDigits: 4 });
const display = value => {
  if (typeof value !== "number") return value ?? "—";
  if (value !== 0 && Math.abs(value) < .0001) return value.toExponential(2);
  return format.format(Object.is(value, -0) ? 0 : value);
};
const node = (tag, value, className) => {
  const element = document.createElement(tag);
  if (value !== undefined) element.textContent = display(value);
  if (className) element.className = className;
  return element;
};

function createTable({ caption, columns, rows }) {
  const wrap = node("div", undefined, "table-wrap");
  const table = node("table");
  table.append(node("caption", caption));
  const thead = node("thead");
  const head = node("tr");
  for (const label of columns) {
    const cell = node("th", label);
    cell.scope = "col";
    head.append(cell);
  }
  thead.append(head);
  table.append(thead);
  const body = node("tbody");
  for (const values of rows) {
    const row = node("tr");
    values.forEach((value, index) => {
      const cell = node(index === 0 ? "th" : "td", display(value));
      if (index === 0) cell.scope = "row";
      row.append(cell);
    });
    body.append(row);
  }
  table.append(body);
  wrap.append(table);
  return wrap;
}

function heatmapTable({ x, y, xs, zs, values }) {
  return {
    caption: `Heatmap · ${y} by row, ${x} by column. Cells are delay in minutes.`,
    columns: [y, ...xs],
    rows: zs.map((z,i) => [z, ...values[i]]),
  };
}

function heatmap(spec) {
  const result = createTable(heatmapTable(spec));
  result.classList.add("course-heatmap");
  const flat = spec.values.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);
  [...result.querySelectorAll("td")].forEach((cell, i) => {
    const raw = flat[i];
    cell.style.setProperty("--heat", `${10 + 90 * (raw - min) / (max - min || 1)}%`);
  });
  return result;
}

function paddedDomain(values, fixed) {
  if (fixed) return fixed;
  const low = Math.min(...values);
  const high = Math.max(...values);
  const pad = (high - low) * .045 || .5;
  return [low - pad, high + pad];
}

function createPlot(spec) {
  const figure = node("figure", undefined, "course-plot");
  const caption = node("figcaption", `${spec.y} by ${spec.x}`);
  const canvas = node("canvas");
  canvas.setAttribute("aria-hidden", "true");
  figure.append(caption, canvas);
  const legend = node("ul", undefined, "course-legend");
  spec.series.forEach(({ label, dots }, index) => {
    const symbol = (dots ? ["●","■","▲","●"] : ["━","┄","⋯","━"])[index % 4];
    const item = node("li", `${symbol} ${label}`);
    item.dataset.series = index % 4;
    legend.append(item);
  });
  figure.append(legend);
  const details = node("details");
  details.append(node("summary", "Plot values as a table"));
  details.addEventListener("toggle", () => {
    if (details.open && details.childElementCount === 1) {
      details.append(createTable({
        caption: "Plotted values",
        columns: ["Series", spec.x, spec.y],
        rows: spec.series.flatMap(series => series.points.filter(([, y])=>y !== null).map(([x,y])=>[series.label,x,y])),
      }));
    }
  });
  figure.append(details);
  canvas.drawPlot = () => {
    const width = Math.round(canvas.clientWidth);
    if (width < 100) return;
    const height = 206;
    const dpi = devicePixelRatio || 1;
    canvas.width = width * dpi;
    canvas.height = height * dpi;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpi,dpi);
    const theme = getComputedStyle(figure);
    const flat = spec.series.flatMap(series=>series.points.filter(([,y])=>Number.isFinite(y)));
    if (!flat.length) return;
    const [minX,maxX] = paddedDomain(flat.map(([x])=>x),spec.xDomain);
    const [minY,maxY] = paddedDomain(flat.map(([,y])=>y),spec.yDomain);
    const left = spec.yTicks ? 102 : 49, right = width - 15, top = 10, bottom = height - 28;
    const xAt = x => left + (right-left)*(x-minX)/(maxX-minX);
    const yAt = y => bottom - (bottom-top)*(y-minY)/(maxY-minY);
    const ticks = (low,high) => {
      const target = (high-low)/4;
      const unit = 10**Math.floor(Math.log10(target));
      const step = [1,2,2.5,5,10].find(choice=>choice>=target/unit)*unit;
      const first = Math.ceil(low/step-1e-9);
      const last = Math.floor(high/step+1e-9);
      return Array.from({length:last-first+1},(_,i)=>{
        const value=(first+i)*step;
        return [value,Number(value.toPrecision(3)).toString()];
      });
    };
    ctx.lineWidth = 1;
    ctx.font = "11px system-ui";
    ctx.strokeStyle = theme.getPropertyValue("--line");
    ctx.fillStyle = theme.getPropertyValue("--muted");
    for (const [value,label] of spec.xTicks ?? ticks(minX,maxX)) {
      const x = xAt(value);
      ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,bottom);ctx.stroke();
      ctx.textAlign="center";ctx.fillText(label,x,bottom+16);
    }
    for (const [value,label] of spec.yTicks ?? ticks(minY,maxY)) {
      const y = yAt(value);
      ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(right,y);ctx.stroke();
      ctx.textAlign="right";ctx.fillText(label,left-5,y+4,left-7);
    }
    spec.series.forEach(({points,dots,width: stroke = 2},i) => {
      const color = theme.getPropertyValue(`--series-${i%4}`);
      ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=stroke;
      ctx.setLineDash(i%4===1 ? [5,3] : i%4===2 ? [2,3] : []);
      let started=false;
      ctx.beginPath();
      for (const [x,y] of points) {
        if (y===null) {started=false;continue;}
        if(dots) {
          const dx=xAt(x), dy=yAt(y);
          if(i%4===1) ctx.rect(dx-2.5,dy-2.5,5,5);
          else if(i%4===2) {
            ctx.moveTo(dx,dy-3);ctx.lineTo(dx+3,dy+2);ctx.lineTo(dx-3,dy+2);ctx.closePath();
          } else {
            ctx.moveTo(dx+2.6,dy);ctx.arc(dx,dy,2.6,0,Math.PI*2);
          }
        } else if (started) ctx.lineTo(xAt(x),yAt(y));
        else {ctx.moveTo(xAt(x),yAt(y));started=true;}
      }
      if(dots) {ctx.globalAlpha=.7;ctx.fill();ctx.globalAlpha=1;}
      else ctx.stroke();
    });
  };
  plots.observe(canvas);
  return figure;
}

function tornadoChart({base,rows}) {
  const values = rows.flatMap(([,low,high])=>[low,high]);
  const span = rows.length+1;
  return {
    x: "Delay (minutes)", y: "Input varied",
    yDomain: [0,span], yTicks: rows.map(([label],i)=>[rows.length-i,label]),
    series: [
      {label:"Low-to-high endpoint span",width:8,points:rows.flatMap(([,low,high],i)=>[[low,rows.length-i],[high,rows.length-i],[0,null]])},
      {label:"Reference delay",points:[[base,.5],[base,span-.5]]},
    ],
    xDomain: paddedDomain([...values,base]),
  };
}

function renderPlots(target, {charts = [], heatmap: map, tornado}) {
  if (tornado) target.append(createPlot(tornadoChart(tornado)));
  if (map) target.append(heatmap(map));
  for (const chart of charts) target.append(createPlot(chart));
}

function render(result) {
  const {headline,text,tables} = result;
  for (const old of results.querySelectorAll("canvas")) plots.unobserve(old);
  results.replaceChildren(node("h4",headline));
  if (text) results.append(node("p",text,"chart-note"));
  for (const table of tables) results.append(createTable(table));
  renderPlots(results, result);
}

const conditionalFields = [...form.querySelectorAll("[data-show-when]")].map(label => {
  const [name, value] = label.dataset.showWhen.split("=");
  return { label, name, value, control: label.control };
});
const showField = ({ name, value }, getValue) => String(getValue(name)) === value;

function updateFields() {
  for (const field of conditionalFields) {
    const visible = showField(field, name => form.elements.namedItem(name).value);
    field.label.hidden = !visible;
    field.control.disabled = !visible;
  }
}

function describe(options) {
  return Array.from(form.elements).filter(control => {
    if (!control.name) return false;
    const condition = conditionalFields.find(field => field.control === control);
    return !condition || showField(condition, name => options[name]);
  }).map(control => {
    const value = options[control.name];
    const show = control.tagName === "SELECT" ? [...control.options].find(option=>option.value===String(value))?.text : value;
    return [control.labels[0].querySelector("span").textContent.trim(), show ?? value];
  });
}

function settingsDetails(options) {
  const details = node("details", undefined, "run-settings");
  details.append(node("summary", "Settings used"));
  const list = node("dl");
  for (const [label, value] of describe(options)) {
    list.append(node("dt", label), node("dd", value));
  }
  details.append(list);
  return details;
}

function renderHistory() {
  for (const canvas of history.querySelectorAll("canvas")) plots.unobserve(canvas);
  history.replaceChildren();
  if (runs.length < 2) return;
  history.append(node("h4", "Earlier runs"));
  history.append(node("p", "Open a run to compare its tables with the latest result."));
  for (const {id, options, result} of runs.slice(1)) {
    const details = node("details");
    const current = new Map(describe(runs[0].options));
    const compared = describe(options).find(([label, value]) => value !== current.get(label));
    details.append(node("summary", compared ? `Run ${id} · ${compared[0]} = ${compared[1]}` : `Run ${id}`));
    details.append(settingsDetails(options));
    for (const table of result.tables) details.append(createTable(table));
    if (result.charts?.length || result.heatmap || result.tornado) {
      const visuals = node("details");
      visuals.append(node("summary", "Plots from this run"));
      visuals.addEventListener("toggle", () => {
        if (visuals.open && visuals.childElementCount === 1) renderPlots(visuals, result);
      });
      details.append(visuals);
    }
    history.append(details);
  }
}

function showLatest() {
  const {id, options, result} = runs[0];
  resultSection.hidden = false;
  render(result);
  renderHistory();
  results.prepend(node("p", `Run ${id}`, "run-label"));
  results.append(settingsDetails(options));
  resultTools.hidden = false;
}

function ready(busy) {
  if (busy) submit.setAttribute("aria-disabled","true");
  else submit.removeAttribute("aria-disabled");
  reset.disabled = busy;
  for (const control of form.elements) {
    if (control.name) control.disabled = busy || control.closest("label").hidden;
  }
  results.setAttribute("aria-busy",String(busy));
}
function failure(message) {
  activeOptions = null;
  status.dataset.state = "error";
  status.textContent = runs.length ? `${message} Run ${runs[0].id} is still shown below.` : message;
  ready(false);
}
function startWorker() {
  worker = new Worker(new URL("./course-worker.mjs?v=3",import.meta.url),{type:"module"});
  worker.addEventListener("error",()=>{
    worker.terminate();
    worker=null;
    if (activeOptions) failure("The experiment could not run. Try again or reload this page.");
  });
  worker.addEventListener("message",({data:{id,result,error}})=>{
    if (error) {failure(error);return;}
    const entry = {id, options:activeOptions, result};
    activeOptions=null;
    nextRun=id+1;
    runs = [entry,...runs].slice(0,6);
    showLatest();
    if (runSaveStatus) {
      try {
        localStorage.setItem(runKey,JSON.stringify(runs));
        delete runSaveStatus.dataset.state;
        runSaveStatus.textContent = "Runs saved in this browser.";
      } catch {
        runSaveStatus.dataset.state = "error";
        runSaveStatus.textContent = `Run ${id} is available in this tab. Browser storage could not save it. Download your report or results CSV before leaving.`;
      }
    }
    status.textContent=`Run ${id} ready.`;
    ready(false);
  });
}

form.addEventListener("submit",event=>{
  event.preventDefault();
  if(activeOptions) return;
  const options=Object.fromEntries(Array.from(form.elements).filter(control=>control.name).map(control=>
    [control.name,control.type==="number" || control.dataset.number !== undefined ? Number(control.value) : control.value]));
  activeOptions=options;
  delete status.dataset.state;
  status.textContent="Running the experiment…";
  ready(true);
  try {
    if(!worker) startWorker();
    worker.postMessage({id:nextRun,lesson,options});
  } catch (error) {
    failure(error.message);
  }
});
form.addEventListener("input",()=>{
  updateFields();
  if(activeOptions) return;
  delete status.dataset.state;
  status.textContent=runs.length ? `Results below are from Run ${runs[0].id}. Select Run experiment to use the current settings.` : "";
});
form.addEventListener("reset",()=>{
  queueMicrotask(updateFields);
  delete status.dataset.state;
  status.textContent="Starting settings restored. Select Run experiment to use them.";
});
updateFields();
window.addEventListener("pageshow", updateFields);
submit.disabled=false;
reset.disabled=false;
if (runKey) {
  try {
    const saved=JSON.parse(localStorage.getItem(runKey) ?? "[]");
    if (Array.isArray(saved) && saved.length) {
      runs=saved.slice(0,6);
      nextRun=runs[0].id+1;
      showLatest();
      runSaveStatus.textContent = `Saved runs loaded. Run ${runs[0].id} used the settings listed below its results.`;
    }
  } catch {
    runs=[];
    nextRun=1;
    runSaveStatus.dataset.state = "error";
    runSaveStatus.textContent = "Saved runs could not be loaded in this browser. You can still run the experiment and download new results.";
  }
}

function download(filename,contents,type) {
  const url=URL.createObjectURL(new Blob([contents],{type}));
  const link=node("a");
  link.href=url;link.download=filename;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function escapeCsv(value) {
  return `"${String(value??"").replaceAll('"','""')}"`;
}
exportButton.addEventListener("click",()=>{
  const rows=[["Run","Table","Row","Field","Value"]];
  for(const {id,options,result} of [...runs].reverse()) {
    for(const [label,value] of describe(options)) rows.push([id,"Settings",0,label,value]);
    const tables = result.heatmap ? [...result.tables, heatmapTable(result.heatmap)] : result.tables;
    for(const {caption,columns,rows:cells} of tables) cells.forEach((row,i)=>
      row.forEach((value,j)=>rows.push([id,caption,i+1,columns[j],value])));
    for(const {x,y,series} of result.charts ?? []) for(const line of series) line.points.forEach(([vx,vy],i)=>{
      if(vy===null)return;
      rows.push([id,`Plot: ${line.label}`,i+1,x,vx],[id,`Plot: ${line.label}`,i+1,y,vy]);
    });
  }
  download(`${lesson}-results.csv`,rows.map(row=>row.map(escapeCsv).join(",")).join("\n")+"\n","text/csv");
});

for(const editable of document.querySelectorAll("[data-save]")){
  const key=`sensitivity-analysis-lab:${lesson}:${editable.dataset.save}`;
  const noteStatus = editable.parentElement.querySelector(".draft-status");
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) editable.value = saved;
    if (saved?.trim() && editable.closest("details")) editable.closest("details").open = true;
  } catch {
    noteStatus.dataset.state = "error";
    noteStatus.textContent = "Saved text could not be loaded. You can still write in this tab.";
  }
  editable.addEventListener("input",()=>{
    try {
      localStorage.setItem(key,editable.value);
      delete noteStatus.dataset.state;
      noteStatus.textContent = "Saved in this browser.";
    } catch {
      noteStatus.dataset.state = "error";
      noteStatus.textContent = editable.id === "report"
        ? "This draft is available in this tab. Browser storage could not save it. Download your report before leaving."
        : "This text is available in this tab. Browser storage could not save it. Copy it before leaving.";
    }
  });
}
document.querySelector("#download-report")?.addEventListener("click",()=>{
  const draft=document.querySelector("#report").value;
  const lines=runs.map(({id,options,result})=>[
    `## Run ${id}`, ...describe(options).map(([name,value])=>`- ${name}: ${value}`), "",
    ...result.tables.flatMap(({caption,columns,rows})=>[`### ${caption}`,columns.join(" | "),columns.map(()=>"---").join(" | "),...rows.map(row=>row.map(display).join(" | ")),""]),
  ].join("\n"));
  download("sensitivity-analysis-report.md",`# Sensitivity analysis report\n\n${draft}\n\n${lines.join("\n")}\n`,"text/markdown");
});
new MutationObserver(()=> {
  for (const canvas of document.querySelectorAll(".course-plot canvas")) canvas.drawPlot();
}).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
