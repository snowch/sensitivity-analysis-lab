import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { units, route, references } from "../course/manifest.mjs";
import { foundations } from "../course/foundations.mjs";
import { methods } from "../course/methods.mjs";
import { application } from "../course/application.mjs";
import { extensions } from "../course/extensions.mjs";
import { sources, sourceGroups, sourceLink } from "../course/references.mjs";
import { reportGuide, reportTemplate } from "../course/report.mjs";
import { methodMap } from "../course/method-map.mjs";
import { shuffleDiagram } from "../course/concept-diagrams.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(root, process.argv[2] ?? "_site");
if (target === root || root.startsWith(target + "/")) throw new Error("Use a separate build directory.");
const content = { ...foundations, ...methods, ...application, ...extensions };
const html = value => String(value).replace(/[&<>"']/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#39;" })[character]);
const home = await readFile(join(root,"index.html"),"utf8");
const pageStart = home.slice(0,home.indexOf('<main id="main"')).trimEnd();
const footer = home.slice(home.indexOf('<footer class="shell"'));
const pageName = id => id + ".html";
const conceptStyles = '  <link rel="stylesheet" href="assets/concept-diagrams.css?v=2">';

function sidebar(current) {
  function entry([id,title]) {
    return `<li><a href="${pageName(id)}"${id===current ? ' aria-current="page"' : ""}>${html(title)}</a></li>`;
  }
  return `<aside class="course-sidebar">
    <nav aria-label="Lessons"><a class="contents-link" href="./#course">Course contents</a>
      ${units.map(([title,links])=>{
        const start = route.indexOf(links[0])+1;
        return `<details class="sidebar-unit"${links.some(([id])=>id===current) ? " open" : ""}>
          <summary>${html(title)}</summary>
          <ol class="sidebar-links" start="${start}">${links.map(entry).join("\n")}</ol>
        </details>`;
      }).join("\n")}
      <a class="contents-link sidebar-resources" href="./#course-references">References and notes</a>
    </nav>
  </aside>`;
}

function stepNav(id) {
  const index=route.findIndex(row=>row[0]===id);
  const previous=route[index-1];
  const following=route[index+1];
  return `<nav class="lesson-actions" aria-label="Course sequence">
    <a href="${previous ? pageName(previous[0]) : "./#course"}">${previous ? "Previous · "+html(previous[1]) : "Course outline"}</a>
    <a class="button dark" href="${following ? pageName(following[0]) : "apply.html"}">${following ? "Next · "+html(following[1]) : "Apply it to your own question"}</a>
  </nav>`;
}

function frame(id,title,body,interactive=false) {
  const assets = [];
  if (body.includes('class="concept-figure"')) assets.push(conceptStyles);
  if (id === "curves") assets.push('  <script type="module" src="assets/concept-curve.mjs?v=1"></script>');
  if (interactive) assets.push('  <script type="module" src="assets/investigation.mjs?v=6"></script>');
  const head=pageStart
    .replace(/<title>.*?<\/title>/,`<title>${html(title)} · Sensitivity Analysis Lab</title>`)
    .replace("</head>", [...assets, "</head>"].join("\n"));
  return `${head}
  <div class="course-layout">
    ${sidebar(id)}
    <main id="main" tabindex="-1">
    ${body}
    </main>
  </div>
  ${footer}`;
}

function controls(fields) {
  return fields.map(({id,label,value,options,min,max,step,numeric,when})=>{
    const control=options
      ? `<select id="${id}" name="${id}"${numeric ? " data-number" : ""}>${options.map(option=>{
          const [key,text]=Array.isArray(option) ? option : [option,option];
          return `<option value="${html(key)}"${value===key ? " selected" : ""}>${html(text)}</option>`;
        }).join("")}</select>`
      : `<input id="${id}" name="${id}" type="number" required min="${min}" max="${max}" step="${step}" value="${value}">`;
    const condition = when ? ` data-show-when="${html(when.join("="))}"` : "";
    return `<label for="${id}"${condition}><span>${html(label)}</span>${control}</label>`;
  }).join("\n");
}

function renderLesson([id,title],lesson) {
  const index=route.findIndex(row=>row[0]===id)+1;
  const fields=lesson.report
    ? [["Input assumptions",0,8],["Staffing and outcome",8,12],["Sensitivity setup",12]]
      .map(([title,from,to])=>`<fieldset class="investigation-group"><legend>${title}</legend><div class="investigation-fields">${controls(lesson.fields.slice(from,to))}</div></fieldset>`).join("")
    : `<div class="investigation-fields">${controls(lesson.fields)}</div>`;
  const answer=lesson.report
    ? reportGuide
    : `<details class="answer"><summary>Reveal the worked explanation</summary><p>${lesson.answer}</p></details>`;
  return frame(id,title,`<article class="lesson shell">
    <header class="lesson-header"><p class="kicker">Lesson ${index} of ${route.length}</p><h1>${html(title)}</h1><p>${lesson.goal}</p></header>
    <div class="lesson-section">
      <div class="reading">${lesson.concept}</div>
      <section class="reading worked-example" aria-labelledby="worked-title">
        <h2 id="worked-title">Worked example</h2>
        ${lesson.example}
      </section>
    </div>
    <section class="lesson-section lesson-experiment" aria-labelledby="experiment-title">
      <h2 id="experiment-title">${html(lesson.experimentTitle)}</h2>
      <p id="prediction-prompt" class="experiment-question">${lesson.predict}</p>
      <p class="investigation-setup">${lesson.setup}</p>
      ${lesson.report ? `<p class="investigation-plan">${lesson.plan}</p>
      <div class="learner-draft"><label for="report">Report draft</label><textarea id="report" data-save="report" rows="6">${html(reportTemplate)}</textarea>
        <p>Browser storage keeps your draft and up to six completed runs on this device when available.</p>
        <p class="draft-status status" role="status"></p></div>` : ""}
      <details class="learner-draft"><summary>Write down your prediction</summary>
        <label for="prediction">Your prediction</label>
        <textarea id="prediction" data-save="prediction" aria-describedby="prediction-prompt" rows="2"></textarea>
        <p class="draft-status status" role="status"></p>
      </details>
      <noscript><p class="notice">Enable JavaScript to run the investigation. The worked example and explanation are available below.</p></noscript>
      <div class="lesson-workspace">
        <form id="investigation" data-lesson="${id}" aria-labelledby="settings-title">
          <h3 id="settings-title">Settings</h3>
          ${lesson.report ? "" : '<p class="investigation-start">Select <strong>Run experiment</strong> with the starting settings.</p>'}
          ${fields}
          <div class="investigation-actions">
            <button class="button dark" type="submit" disabled>Run experiment</button>
            <button class="reset-settings" type="reset" disabled>Reset settings</button>
          </div>
          <p id="investigation-status" role="status" class="status"></p>
          ${lesson.report ? '<p id="run-save-status" class="status" role="status"></p>' : ""}
        </form>
        <section class="investigation-results" aria-labelledby="results-title" hidden>
          <h3 id="results-title">Results</h3>
          <p class="investigation-read">${lesson.read}</p>
          <div id="investigation-output"></div>
          <div id="run-history"></div>
          <div id="result-tools" hidden>
            <button class="resource-link" id="export-results" type="button" aria-labelledby="export-label" aria-describedby="export-description">
              <span><span id="export-label">Download results CSV</span><small id="export-description">Settings, tables and chart values from up to six runs</small></span>
              <span class="resource-arrow" aria-hidden="true"></span>
            </button>
          </div>
        </section>
      </div>
      <section class="instructions investigation-next">
        <h3>Change the settings</h3>
        <ol>${lesson.steps.map(step=>`<li>${step}</li>`).join("")}</ol>
      </section>
    </section>
    <section class="lesson-section" aria-labelledby="explanation-title">
      <div class="reading">
        <h2 id="explanation-title">Explain your result</h2>
        <p id="explanation-prompt">${lesson.task}</p>
        ${lesson.report ? "" : `<details class="learner-draft"><summary>Write down your explanation</summary>
          <label for="explanation">Your explanation</label>
          <textarea id="explanation" data-save="explanation" aria-describedby="explanation-prompt" rows="3"></textarea>
          <p class="draft-status status" role="status"></p>
        </details>`}
        ${answer}
        ${lesson.report ? `<p>The report download includes your draft and the tables from your six most recent runs.</p>
          <button type="button" id="download-report" class="button outline-button">Download report</button>` : ""}
      </div>
    </section>
    ${lesson.followup ?? ""}
    ${lesson.refs ? `<nav class="lesson-resources" aria-labelledby="lesson-references-title">
      <h2 id="lesson-references-title">References</h2>
      <ul>${lesson.refs.map(key=>{
        const [label,url]=sources[key];
        return `<li><a class="resource-link" href="${html(url)}"><span>${html(label)}</span><span class="resource-arrow" aria-hidden="true"></span></a></li>`;
      }).join("\n")}</ul>
    </nav>` : ""}
    ${stepNav(id)}
  </article>`,true);
}

await mkdir(target,{recursive:true});
await cp(join(root,"assets"),join(target,"assets"),{recursive:true});
const existing = (await readdir(root)).filter(name=>name.endsWith(".html"));
for (const file of existing) {
  if (file==="index.html") continue;
  const id=file.slice(0,-5);
  let page=(await readFile(join(root,file),"utf8")).replace(/lab\.css\?v=\d+/,"lab.css?v=9").replace("lab.mjs?v=2","lab.mjs?v=4");
  page=page.replace("</head>", '  <script type="module" src="assets/scroll-tables.mjs?v=2"></script>\n</head>');
  if (id === "logs") {
    page = page.replace("<!-- payload-shuffle-diagram -->", shuffleDiagram);
    page = page.replace("</head>", `${conceptStyles}\n</head>`);
  }
  page=page.replace(/<aside class="course-sidebar">[\s\S]*?<\/aside>/,sidebar(id));
  const index=route.findIndex(row=>row[0]===id);
  if(index>=0) {
    page = page.replace(/Lesson \d+ of \d+/, `Lesson ${index+1} of ${route.length}`);
    page = page.replace(/<nav class="lesson-actions"[\s\S]*?<\/nav>/,stepNav(id));
  }
  await writeFile(join(target,file),page);
}
for (const item of route) {
  const [id]=item;
  if (content[id]) await writeFile(join(target,pageName(id)),renderLesson(item,content[id]));
  else if (!existing.includes(pageName(id))) throw new Error(`Missing course page: ${id}`);
}
const outline=units.map(([title,links])=>`<section class="unit"><h3>${html(title)}</h3><ol start="${route.indexOf(links[0])+1}">
  ${links.map(([id,name,desc])=>`<li><a href="${pageName(id)}">${html(name)}</a><span>${html(desc)}</span></li>`).join("\n")}
</ol></section>`).join("\n");
const links=references.map(([id,title])=>`<li><a href="${pageName(id)}">${html(title)}</a></li>`).join("\n");
await writeFile(join(target,"index.html"),home.replace("<!-- course-units -->",outline).replace("<!-- course-references -->",links));
await writeFile(join(target,"method-map.html"), frame("method-map", "How the methods fit together", methodMap)
  .replace("</head>", '  <link rel="stylesheet" href="assets/method-map.css?v=2">\n</head>'));
await writeFile(join(target,"references.html"),frame("references","Bibliography",`<article class="lesson shell">
  <header class="lesson-header"><h1>Bibliography</h1><p>Use the descriptions to find a paper or guide for the method you want to check. Lesson pages also link to their sources.</p></header>
  ${sourceGroups.map(([title, keys]) => `<section class="reading"><h2>${html(title)}</h2><dl class="terms">${keys.map(key=>`<dt>${sourceLink(key)}</dt><dd>${html(sources[key][2])}</dd>`).join("\n")}</dl></section>`).join("\n")}
  <nav class="lesson-actions"><a href="./#course">Course outline</a></nav>
</article>`));
console.log(`Built ${route.length} lessons in ${target}`);
