import { fetchWeather } from "./openweather-core.mjs";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json; charset=utf-8",
      ...extra,
    },
  });
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers: cors });
    if (request.method !== "GET")
      return json({ error: "Método não permitido." }, 405);
    if (url.pathname !== "/api/weather")
      return json({ error: "Rota não encontrada." }, 404);
    const cacheKey = new Request(new URL("/api/weather", url.origin));
    const cached = await caches.default.match(cacheKey);
    if (cached) return cached;
    try {
      const response = json(await fetchWeather(env.OPENWEATHER_API_KEY), 200, {
        "Cache-Control": "public, max-age=300",
      });
      ctx.waitUntil(caches.default.put(cacheKey, response.clone()));
      return response;
    } catch (error) {
      return json({ error: error.message }, 502, {
        "Cache-Control": "no-store",
      });
    }
  },
};
