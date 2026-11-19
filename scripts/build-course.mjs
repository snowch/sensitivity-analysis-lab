import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { units, route, references } from "../course/manifest.mjs";
import { foundations } from "../course/foundations.mjs";
import { methods } from "../course/methods.mjs";
import { application } from "../course/application.mjs";
import { extensions } from "../course/extensions.mjs";
import { sources, sourceLink } from "../course/references.mjs";
import { reportGuide, reportTemplate } from "../course/report.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = resolve(root, process.argv[2] ?? "_site");
if (target === root || root.startsWith(target + "/")) throw new Error("Use a separate build directory.");
const content = { ...foundations, ...methods, ...application, ...extensions };
const html = value => String(value).replace(/[&<>"']/g, character => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#39;" })[character]);
const home = await readFile(join(root,"index.html"),"utf8");
const pageStart = home.slice(0,home.indexOf('<main id="main"')).trimEnd();
const footer = home.slice(home.indexOf('<footer class="shell"'));
const pageName = id => id + ".html";

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
      <p>References and notes</p>
      <ul class="sidebar-links">${references.map(entry).join("\n")}<li><a href="pipeline-notes.html">Pipeline notes</a></li></ul>
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
  const head=pageStart
    .replace(/<title>.*?<\/title>/,`<title>${html(title)} · Sensitivity Analysis Lab</title>`)
    .replace("</head>",interactive ? '  <script type="module" src="assets/investigation.mjs"></script>\n</head>' : "</head>");
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
  return fields.map(({id,label,value,options,min,max,step,numeric})=>{
    const control=options
      ? `<select id="${id}" name="${id}"${numeric ? " data-number" : ""}>${options.map(option=>{
          const [key,text]=Array.isArray(option) ? option : [option,option];
          return `<option value="${html(key)}"${value===key ? " selected" : ""}>${html(text)}</option>`;
        }).join("")}</select>`
      : `<input id="${id}" name="${id}" type="number" required min="${min}" max="${max}" step="${step}" value="${value}">`;
    return `<label for="${id}"><span>${html(label)}</span>${control}</label>`;
  }).join("\n");
}

function renderLesson([id,title],lesson) {
  const index=route.findIndex(row=>row[0]===id)+1;
  const draft = lesson.report ? `<p>Browser storage saves this draft and the six most recent runs on this device. Download the report for a portable copy.</p>
          <button type="button" id="download-report" class="button outline-button">Download report</button>` : "";
  const fields=lesson.report
    ? [["Input assumptions",0,8],["Staffing and outcome",8,12],["Sensitivity setup",12]]
      .map(([title,from,to])=>`<fieldset class="investigation-group"><legend>${title}</legend><div class="investigation-fields">${controls(lesson.fields.slice(from,to))}</div></fieldset>`).join("")
    : `<div class="investigation-fields">${controls(lesson.fields)}</div>`;
  const answer=lesson.report
    ? reportGuide
    : `<details class="answer"><summary>Check your explanation</summary><p>${lesson.answer}</p></details>`;
  return frame(id,title,`<article class="lesson shell">
    <header class="lesson-header"><p class="kicker">Lesson ${index} of ${route.length}</p><h1>${html(title)}</h1><p>${lesson.goal}</p></header>
    <div class="reading">${lesson.concept}</div>
    <section class="reading"><h2>Worked example</h2>${lesson.example}</section>
    ${lesson.report ? `<div class="learner-draft"><label for="report">Report draft</label><textarea id="report" data-save="report" rows="12">${html(reportTemplate)}</textarea>${draft}<p id="save-note-status" role="status"></p></div>` : ""}
    <section class="lesson-experiment">
      <h2>Run the investigation</h2><p class="investigation-setup">${lesson.setup}</p>
      <div class="instructions"><ol>${lesson.steps.map(step=>`<li>${step}</li>`).join("")}</ol></div>
      <div class="learner-draft"><label for="prediction">Predict before running</label><p id="prediction-prompt">${lesson.predict}</p>
        <textarea id="prediction" data-save="prediction" aria-describedby="prediction-prompt" rows="2"></textarea>
      </div>
      <noscript><p class="notice">Enable JavaScript to run the investigation. The worked example and explanation are available below.</p></noscript>
      <form id="investigation" data-lesson="${id}">
        ${fields}
        <div class="investigation-actions">
          <button class="button dark" type="submit" disabled>Run experiment</button>
          <button class="button outline-button" type="reset" disabled>Reset settings</button>
          <button class="button outline-button" id="export-results" type="button" disabled>Download results CSV</button>
        </div>
        <p id="investigation-status" role="status" class="status"></p>
      </form>
      <section class="investigation-results"><h2>Results</h2><div id="investigation-output"><p class="empty">Choose Run experiment to see the results.</p></div><div id="run-history"></div></section>
    </section>
    <section class="reading"><h2>Explain your result</h2><p id="explanation-prompt">${lesson.task}</p>
      ${lesson.report ? "" : `<div class="learner-draft"><label for="explanation">Your explanation</label><textarea id="explanation" data-save="explanation" aria-describedby="explanation-prompt" rows="3"></textarea>
      <p id="save-note-status" role="status">Browser storage saves your text drafts on this device.</p></div>`}
      ${answer}
    </section>
    ${lesson.refs ? `<section class="reading"><h2>Sources</h2><ul>${lesson.refs.map(key=>`<li>${sourceLink(key)}</li>`).join("")}</ul></section>` : ""}
    ${stepNav(id)}
  </article>`,true);
}

await mkdir(target,{recursive:true});
await cp(join(root,"assets"),join(target,"assets"),{recursive:true});
const existing = (await readdir(root)).filter(name=>name.endsWith(".html"));
for (const file of existing) {
  if (file==="index.html") continue;
  const id=file.slice(0,-5);
  let page=(await readFile(join(root,file),"utf8")).replace("lab.css?v=2","lab.css?v=3");
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
await writeFile(join(target,"references.html"),frame("references","Bibliography",`<article class="lesson shell">
  <header class="lesson-header"><h1>Bibliography</h1><p>Original papers and technical references for the methods used in the course.</p></header>
  <div class="reading"><dl class="terms">${Object.keys(sources).map(key=>`<dt>${sourceLink(key)}</dt><dd>${html(sources[key][2])}</dd>`).join("\n")}</dl></div>
  <nav class="lesson-actions"><a href="./#course">Course outline</a></nav>
</article>`));
console.log(`Built ${route.length} lessons in ${target}`);
