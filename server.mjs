import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchWeather } from "./api/openweather-core.mjs";
const root = path.dirname(fileURLToPath(import.meta.url)),
  port = Number(process.env.PORT || 4180);
function key() {
  if (process.env.OPENWEATHER_API_KEY) return process.env.OPENWEATHER_API_KEY;
  const config = process.env.ECOGUARD_CONFIG;
  if (!config)
    throw new Error(
      "Defina OPENWEATHER_API_KEY ou ECOGUARD_CONFIG no servidor.",
    );
  let source;
  try {
    source = fs.readFileSync(config, "utf8");
  } catch {
    throw new Error("Não foi possível ler a configuração privada do EcoGuard.");
  }
  const match = source.match(
    /^\s*#\s*define\s+OPENWEATHER_API_KEY\s+"([^"]+)"/m,
  );
  if (!match)
    throw new Error(
      "A chave OpenWeather não foi encontrada na configuração privada.",
    );
  return match[1];
}
let cached = null,
  pending = null;
async function data() {
  if (cached && Date.now() - cached.at < 300000) return cached.body;
  if (pending) return pending;
  pending = fetchWeather(key())
    .then((body) => {
      cached = { body, at: Date.now() };
      return body;
    })
    .finally(() => (pending = null));
  return pending;
}
const server = http.createServer(async (request, response) => {
  const headers = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json; charset=utf-8",
    },
    route = new URL(request.url, "http://127.0.0.1").pathname;
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      ...headers,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    });
    response.end();
    return;
  }
  if (request.method !== "GET") {
    response.writeHead(405, headers);
    response.end(JSON.stringify({ error: "Método não permitido." }));
    return;
  }
  if (route === "/api/weather") {
    try {
      const body = await data();
      response.writeHead(200, { ...headers, "Cache-Control": "no-store" });
      response.end(JSON.stringify(body));
    } catch (error) {
      response.writeHead(502, headers);
      response.end(JSON.stringify({ error: error.message }));
    }
    return;
  }
  if (route === "/" || route === "/index.html") {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(fs.readFileSync(path.join(root, "index.html")));
    return;
  }
  response.writeHead(404, headers);
  response.end(JSON.stringify({ error: "Rota não encontrada." }));
});
server.listen(port, "127.0.0.1", () =>
  console.log("EcoGuard OpenWeather: http://127.0.0.1:" + port),
);
server.on("error", (error) => {
  console.error(
    error.code === "EADDRINUSE"
      ? "A porta configurada já está em uso."
      : "Não foi possível iniciar o servidor.",
  );
  process.exitCode = 1;
});
