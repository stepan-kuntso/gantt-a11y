// A small Markdown to HTML converter for the documents of this repository
// (headings, paragraphs, lists, tables, block quotes, code, emphasis, links).
// It is not a general Markdown implementation.

const escape = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function slug(text) {
	return String(text).toLowerCase().replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, "").replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s+/g, "-");
}

/**
 * @param {string} text
 * @param {(href: string) => string|null} linkFor  maps a Markdown link target to a site URL, or null to drop the link
 */
function inline(text, linkFor) {
	const codes = [];
	let out = String(text).replace(/`([^`]+)`/g, (m, code) => {
		codes.push("<code>" + escape(code) + "</code>");
		return "\u0000" + (codes.length - 1) + "\u0000";
	});
	out = escape(out);
	// keep <kbd> written in the source
	out = out.replace(/&lt;(\/?)kbd&gt;/g, "<$1kbd>");
	out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, href) => {
		const target = linkFor(href.replace(/&amp;/g, "&"));
		return target ? `<a href="${escape(target)}">${label}</a>` : label;
	});
	out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
	out = out.replace(/(^|[\s(])_([^_]+)_(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>");
	out = out.replace(/(^|[\s(])\*([^*\s][^*]*)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>");
	return out.replace(/\u0000(\d+)\u0000/g, (m, i) => codes[Number(i)]);
}

/**
 * @param {string} source  Markdown
 * @param {object} [options]
 * @param {number} [options.shift=0]  added to every heading level
 * @param {(href: string) => string|null} [options.linkFor]
 * @param {string} [options.idPrefix=""]
 * @returns {string} HTML
 */
export function markdownToHtml(source, { shift = 0, linkFor = () => null, idPrefix = "" } = {}) {
	const lines = source.replace(/\r/g, "").split("\n");
	const html = [];
	let i = 0;
	const isTableRow = (line) => /^\s*\|.*\|\s*$/.test(line);
	const isBlockStart = (line) => /^(#{1,6} |```|>|\s*[-*] |\s*\d+\. |---\s*$)/.test(line) || isTableRow(line);

	while (i < lines.length) {
		const line = lines[i];
		if (!line.trim()) {
			i++;
			continue;
		}
		let m;
		if ((m = line.match(/^(#{1,6}) (.*)$/))) {
			const level = Math.min(6, m[1].length + shift);
			const text = m[2].trim();
			html.push(`<h${level} id="${idPrefix}${slug(text)}">${inline(text, linkFor)}</h${level}>`);
			i++;
		} else if (line.startsWith("```")) {
			const code = [];
			i++;
			while (i < lines.length && !lines[i].startsWith("```")) {
				code.push(lines[i]);
				i++;
			}
			i++;
			html.push(`<pre><code>${escape(code.join("\n"))}</code></pre>`);
		} else if (/^---\s*$/.test(line)) {
			html.push("<hr>");
			i++;
		} else if (line.startsWith(">")) {
			const quote = [];
			while (i < lines.length && lines[i].startsWith(">")) {
				quote.push(lines[i].replace(/^>\s?/, ""));
				i++;
			}
			html.push(`<blockquote>${markdownToHtml(quote.join("\n"), { shift, linkFor, idPrefix })}</blockquote>`);
		} else if (isTableRow(line)) {
			const rows = [];
			while (i < lines.length && isTableRow(lines[i])) {
				rows.push(lines[i]);
				i++;
			}
			const cells = (row) => row.trim().replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, "|").trim());
			const head = cells(rows[0]);
			const body = rows.slice(/^\s*\|[\s:|-]+\|\s*$/.test(rows[1] || "") ? 2 : 1).map(cells);
			html.push("<div class=\"table-wrap\"><table>");
			html.push("<thead><tr>" + head.map((c) => `<th scope="col">${inline(c, linkFor)}</th>`).join("") + "</tr></thead>");
			html.push("<tbody>" + body.map((r) => "<tr>" + r.map((c) => `<td>${inline(c, linkFor)}</td>`).join("") + "</tr>").join("") + "</tbody>");
			html.push("</table></div>");
		} else if (/^\s*([-*]|\d+\.) /.test(line)) {
			const ordered = /^\s*\d+\. /.test(line);
			const items = [];
			while (i < lines.length && lines[i].trim() && (/^\s*([-*]|\d+\.) /.test(lines[i]) || /^\s{2,}\S/.test(lines[i]))) {
				const current = lines[i];
				const indent = current.match(/^\s*/)[0].length;
				const text = current.replace(/^\s*([-*]|\d+\.) /, "");
				if (indent >= 2 && items.length && /^\s*([-*]|\d+\.) /.test(current)) {
					items[items.length - 1].children.push(text);
				} else if (/^\s*([-*]|\d+\.) /.test(current)) {
					items.push({ text, children: [] });
				} else {
					items[items.length - 1].text += " " + current.trim();
				}
				i++;
			}
			const tag = ordered ? "ol" : "ul";
			html.push(`<${tag}>` + items.map((item) => "<li>" + inline(item.text, linkFor)
				+ (item.children.length ? "<ul>" + item.children.map((c) => "<li>" + inline(c, linkFor) + "</li>").join("") + "</ul>" : "")
				+ "</li>").join("") + `</${tag}>`);
		} else {
			const paragraph = [];
			while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
				paragraph.push(lines[i].trim());
				i++;
			}
			if (!paragraph.length) {
				paragraph.push(line.trim());
				i++;
			}
			html.push(`<p>${inline(paragraph.join(" "), linkFor)}</p>`);
		}
	}
	return html.join("\n");
}
