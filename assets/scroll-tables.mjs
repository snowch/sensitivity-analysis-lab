const scrollable = new ResizeObserver(entries => {
  for (const { target } of entries) {
    if (target.clientWidth > 0 && target.scrollWidth > target.clientWidth) {
      target.tabIndex = 0;
      target.setAttribute("role", "region");
      const caption = target.querySelector("caption")?.textContent.trim();
      target.setAttribute("aria-label", caption || "Scrollable table");
    } else {
      target.removeAttribute("tabindex");
      target.removeAttribute("role");
      target.removeAttribute("aria-label");
    }
  }
});

function visitTables(root, visit) {
  if (root instanceof Element && root.matches(".table-wrap")) visit(root);
  root.querySelectorAll?.(".table-wrap").forEach(visit);
}

visitTables(document, table => scrollable.observe(table));
new MutationObserver(records => {
  for (const { addedNodes, removedNodes } of records) {
    for (const root of removedNodes) visitTables(root, table => scrollable.unobserve(table));
    for (const root of addedNodes) visitTables(root, table => scrollable.observe(table));
  }
}).observe(document.body, { childList: true, subtree: true });
