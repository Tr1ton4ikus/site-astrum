// Локальный запуск вики с редактором одной командой:  node wiki/dev.mjs
// Поднимает: сайт на http://localhost:8080, локальный сервер редактора (decap-server) и пересборку списка статей.
// Запускать из корня сайта (папки, где лежит wiki/).
import { spawn } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const here = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.env.PORT) || 8080;
const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".md": "text/markdown; charset=utf-8",
    ".yml": "text/yaml; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".svg": "image/svg+xml",
};

createServer(async (req, res) => {
    let p = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^([/\\])+/, "");
    if (p.includes("..")) {
        res.writeHead(403).end();
        return;
    }
    let file = join(root, p);
    try {
        if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    } catch {}
    try {
        const data = await readFile(file);
        res.writeHead(200, {
            "content-type": types[extname(file)] || "application/octet-stream",
            "cache-control": "no-store",
        }).end(data);
    } catch {
        res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Не найдено");
    }
}).listen(PORT, () => {
    console.log(`\n  Сайт:      http://localhost:${PORT}/wiki/`);
    console.log(`  Редактор:  http://localhost:${PORT}/wiki/admin/\n`);
});

spawn(process.execPath, [join(here, "build.mjs"), "--watch"], { stdio: "inherit" });
spawn("npx", ["--yes", "decap-server"], { stdio: "inherit", shell: process.platform === "win32" });
