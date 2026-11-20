# Automated check of the site

Run 2026-11-20 in Chromium (Playwright) by `scripts/site/check.js`. Automated rules only: they find missing structure and low contrast, not whether the pages are easy to use with a screen reader. The charts' own markup is left out here; the [audit](../audit/README.md) checks it.

| Rule | index.html | demo-dhtmlx.html | demo-frappe.html | screen-readers.html | spec.html | audit.html | about.html |
|---|---|---|---|---|---|---|---|
| Language of the page | pass | pass | pass | pass | pass | pass | pass |
| Title | pass | pass | pass | pass | pass | pass | pass |
| One h1 | pass | pass | pass | pass | pass | pass | pass |
| Heading levels do not skip | pass | pass | pass | pass | pass | pass | pass |
| Landmarks: banner, navigation, main, contentinfo | pass | pass | pass | pass | pass | pass | pass |
| Unique ids | pass | pass | pass | pass | pass | pass | pass |
| Links and buttons have names | pass | pass | pass | pass | pass | pass | pass |
| Images have alt | pass | pass | pass | pass | pass | pass | pass |
| Skip link first, visible on focus, moves focus to the content | pass | pass | pass | pass | pass | pass | pass |
| Visible focus on every Tab stop (outside the charts) | pass | pass | pass | pass | pass | pass | pass |
| Text contrast (4.5:1, large text 3:1, outside the charts) | pass | pass | pass | pass | pass | pass | pass |
| No requests to other servers | pass | pass | pass | pass | pass | pass | pass |
| No script errors | pass | pass | pass | pass | pass | pass | pass |

## Details

### index.html

- pass: Language of the page: lang="en"
- pass: Title: Home · gantt-a11y
- pass: One h1: 1 h1
- pass: Heading levels do not skip: in order
- pass: Landmarks: banner, navigation, main, contentinfo: header 1, nav 1, main 1, footer 1
- pass: Unique ids: none repeated
- pass: Links and buttons have names: all named
- pass: Images have alt: 0 without alt
- pass: Skip link first, visible on focus, moves focus to the content: first Tab stop: “Skip to content” (#main), visible; after Enter focus is on #main
- pass: Visible focus on every Tab stop (outside the charts): 17 Tab stops checked
- pass: Text contrast (4.5:1, large text 3:1, outside the charts): 52 text elements, lowest 7.44:1
- pass: No requests to other servers: none
- pass: No script errors: none

### demo-dhtmlx.html

- pass: Language of the page: lang="en"
- pass: Title: Demo: dhtmlx-gantt · gantt-a11y
- pass: One h1: 1 h1
- pass: Heading levels do not skip: in order
- pass: Landmarks: banner, navigation, main, contentinfo: header 1, nav 1, main 1, footer 1
- pass: Unique ids: none repeated
- pass: Links and buttons have names: all named
- pass: Images have alt: 0 without alt
- pass: Skip link first, visible on focus, moves focus to the content: first Tab stop: “Skip to content” (#main), visible; after Enter focus is on #main
- pass: Visible focus on every Tab stop (outside the charts): 10 Tab stops checked
- pass: Text contrast (4.5:1, large text 3:1, outside the charts): 107 text elements, lowest 7.44:1
- pass: No requests to other servers: none
- pass: No script errors: none

### demo-frappe.html

- pass: Language of the page: lang="en"
- pass: Title: Demo: frappe-gantt · gantt-a11y
- pass: One h1: 1 h1
- pass: Heading levels do not skip: in order
- pass: Landmarks: banner, navigation, main, contentinfo: header 1, nav 1, main 1, footer 1
- pass: Unique ids: none repeated
- pass: Links and buttons have names: all named
- pass: Images have alt: 0 without alt
- pass: Skip link first, visible on focus, moves focus to the content: first Tab stop: “Skip to content” (#main), visible; after Enter focus is on #main
- pass: Visible focus on every Tab stop (outside the charts): 10 Tab stops checked
- pass: Text contrast (4.5:1, large text 3:1, outside the charts): 104 text elements, lowest 7.44:1
- pass: No requests to other servers: none
- pass: No script errors: none

### screen-readers.html

- pass: Language of the page: lang="en"
- pass: Title: Try with a screen reader · gantt-a11y
- pass: One h1: 1 h1
- pass: Heading levels do not skip: in order
- pass: Landmarks: banner, navigation, main, contentinfo: header 1, nav 1, main 1, footer 1
- pass: Unique ids: none repeated
- pass: Links and buttons have names: all named
- pass: Images have alt: 0 without alt
- pass: Skip link first, visible on focus, moves focus to the content: first Tab stop: “Skip to content” (#main), visible; after Enter focus is on #main
- pass: Visible focus on every Tab stop (outside the charts): 12 Tab stops checked
- pass: Text contrast (4.5:1, large text 3:1, outside the charts): 73 text elements, lowest 7.44:1
- pass: No requests to other servers: none
- pass: No script errors: none

### spec.html

- pass: Language of the page: lang="en"
- pass: Title: Announcements · gantt-a11y
- pass: One h1: 1 h1
- pass: Heading levels do not skip: in order
- pass: Landmarks: banner, navigation, main, contentinfo: header 1, nav 1, main 1, footer 1
- pass: Unique ids: none repeated
- pass: Links and buttons have names: all named
- pass: Images have alt: 0 without alt
- pass: Skip link first, visible on focus, moves focus to the content: first Tab stop: “Skip to content” (#main), visible; after Enter focus is on #main
- pass: Visible focus on every Tab stop (outside the charts): 9 Tab stops checked
- pass: Text contrast (4.5:1, large text 3:1, outside the charts): 1823 text elements, lowest 7.44:1
- pass: No requests to other servers: none
- pass: No script errors: none

### audit.html

- pass: Language of the page: lang="en"
- pass: Title: Audit · gantt-a11y
- pass: One h1: 1 h1
- pass: Heading levels do not skip: in order
- pass: Landmarks: banner, navigation, main, contentinfo: header 1, nav 1, main 1, footer 1
- pass: Unique ids: none repeated
- pass: Links and buttons have names: all named
- pass: Images have alt: 0 without alt
- pass: Skip link first, visible on focus, moves focus to the content: first Tab stop: “Skip to content” (#main), visible; after Enter focus is on #main
- pass: Visible focus on every Tab stop (outside the charts): 14 Tab stops checked
- pass: Text contrast (4.5:1, large text 3:1, outside the charts): 593 text elements, lowest 7.44:1
- pass: No requests to other servers: none
- pass: No script errors: none

### about.html

- pass: Language of the page: lang="en"
- pass: Title: About this site · gantt-a11y
- pass: One h1: 1 h1
- pass: Heading levels do not skip: in order
- pass: Landmarks: banner, navigation, main, contentinfo: header 1, nav 1, main 1, footer 1
- pass: Unique ids: none repeated
- pass: Links and buttons have names: all named
- pass: Images have alt: 0 without alt
- pass: Skip link first, visible on focus, moves focus to the content: first Tab stop: “Skip to content” (#main), visible; after Enter focus is on #main
- pass: Visible focus on every Tab stop (outside the charts): 10 Tab stops checked
- pass: Text contrast (4.5:1, large text 3:1, outside the charts): 230 text elements, lowest 7.44:1
- pass: No requests to other servers: none
- pass: No script errors: none
