import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { fetchWeather } from "../api/openweather-core.mjs";

export async function updateWeather({
  apiKey = process.env.OPENWEATHER_API_KEY,
  load = fetchWeather,
  destination = new URL("../deploy/weather.json", import.meta.url),
} = {}) {
  const weather = await load(apiKey);
  const serialized = JSON.stringify(weather, null, 2) + "\n";
  if (typeof apiKey === "string" && apiKey && serialized.includes(apiKey))
    throw new Error(
      "A resposta contém informação privada e não pode ser publicada.",
    );
  const target =
    destination instanceof URL
      ? fileURLToPath(destination)
      : resolve(destination);
  await mkdir(dirname(target), { recursive: true });
  const temporary = target + ".tmp";
  await writeFile(temporary, serialized, { encoding: "utf8", mode: 0o644 });
  await rename(temporary, target);
  return weather;
}

if (
  process.argv[1] &&
  pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  try {
    const weather = await updateWeather();
    console.log(
      "Dados OpenWeather atualizados: " +
        weather.forecast.periods.length +
        " períodos de 3 horas.",
    );
  } catch {
    console.error(
      "Não foi possível atualizar o clima. Verifique o secret OPENWEATHER_API_KEY e a disponibilidade da OpenWeather.",
    );
    process.exitCode = 1;
  }
}
