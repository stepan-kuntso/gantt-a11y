// A minimal static file server for the local demos (node:http only).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const TYPES = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".mjs": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".md": "text/markdown; charset=utf-8",
	".svg": "image/svg+xml",
	".png": "image/png",
	".woff": "font/woff",
	".woff2": "font/woff2"
};

/**
 * Serves `root`, by default on 127.0.0.1 and a free port.
 * @param {string} root
 * @param {{ port?: number, host?: string, noStore?: boolean }} [options]
 *        noStore: tell the browser not to keep any file (Cache-Control: no-store),
 *        so that a reload always runs the current code
 * @returns {Promise<{ url: string, close: () => Promise<void> }>}
 */
export function serve(root, { port = 0, host = "127.0.0.1", noStore = false } = {}) {
	const base = path.resolve(root);
	const server = http.createServer((request, response) => {
		const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
		let file = path.join(base, pathname);
		if (!file.startsWith(base)) {
			response.writeHead(403).end();
			return;
		}
		if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
			file = path.join(file, "index.html");
		}
		fs.readFile(file, (error, data) => {
			if (error) {
				response.writeHead(404).end("Not found");
				return;
			}
			const headers = { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" };
			if (noStore) {
				headers["Cache-Control"] = "no-store";
			}
			response.writeHead(200, headers);
			response.end(data);
		});
	});
	return new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(port, host, () => {
			resolve({
				url: `http://${host.includes(":") ? "[" + host + "]" : host}:${server.address().port}`,
				close: () => new Promise((done) => server.close(() => done()))
			});
		});
	});
}
