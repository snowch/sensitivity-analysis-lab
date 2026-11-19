const scrollRegion = ".table-wrap, [data-scroll-region]";

const scrollable = new ResizeObserver(entries => {
  for (const { target } of entries) {
    const heading = target.dataset.scrollRegion;
    const labelAttribute = heading ? "aria-labelledby" : "aria-label";
    const overflow = target.scrollWidth - target.clientWidth;
    if (target.clientWidth > 0 && overflow > 0) {
      if (target.hasAttribute("data-scroll-center") && !target.hasAttribute("tabindex") && target.scrollLeft === 0) {
        target.scrollLeft = overflow / 2;
      }
      target.tabIndex = 0;
      target.setAttribute("role", "region");
      const caption = target.querySelector("caption")?.textContent.trim();
      target.setAttribute(labelAttribute, heading || caption || "Scrollable table");
    } else {
      target.removeAttribute("tabindex");
      target.removeAttribute("role");
      target.removeAttribute(labelAttribute);
    }
  }
});

function visitScrollRegions(root, visit) {
  if (root instanceof Element && root.matches(scrollRegion)) visit(root);
  root.querySelectorAll?.(scrollRegion).forEach(visit);
}

visitScrollRegions(document, region => scrollable.observe(region));
new MutationObserver(records => {
  for (const { addedNodes, removedNodes } of records) {
    for (const root of removedNodes) visitScrollRegions(root, region => scrollable.unobserve(region));
    for (const root of addedNodes) visitScrollRegions(root, region => scrollable.observe(region));
  }
}).observe(document.body, { childList: true, subtree: true });
