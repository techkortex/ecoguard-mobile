# EcoGuard Mobile

Interface de clima e previsão para consulta dos apresentadores do EcoGuard.

**Site:** https://techkortex.github.io/ecoguard-mobile/

O visual preserva a identidade do totem: logo original, Liquid Glass, textura, nuvens, chuva e ícones animados, em uma página de rolagem livre para celular.

## Dados OpenWeather

O GitHub Actions consulta Current Weather e Forecast de três em três horas usando o secret privado `OPENWEATHER_API_KEY`. Publica somente o resultado meteorológico em `weather.json`, junto com o HTML no GitHub Pages. A chave não aparece no código ou nos arquivos do site.

A atualização é agendada aproximadamente a cada dez minutos. O GitHub pode atrasar execuções; o horário indicado na página identifica os dados exibidos. O workflow também pode ser executado manualmente em **Actions → Atualizar clima e publicar EcoGuard → Run workflow**.

Ponto consultado: Parque Imperial, Barueri (`-23.4834, -46.8082`). A previsão contém quatro períodos de três horas, com probabilidade e volume. São dados meteorológicos, sem medição física do ESP32 ou cálculo de risco local de enchente.

## Código

- `index.html`: interface com CSS, JavaScript e logo incorporados.
- `scripts/update-weather.mjs`: gera o JSON público a partir da OpenWeather.
- `.github/workflows/update-weather.yml`: agenda as consultas e publica o GitHub Pages.
- `api/openweather-core.mjs`: consulta e normaliza a OpenWeather sem expor a chave.
- `server.mjs` e `iniciar-local.ps1`: alternativa de execução local no PC do projeto.
- `api/worker.mjs`: alternativa de proxy Cloudflare, não usada na publicação do GitHub Pages.

Os dados continuam visíveis com seu horário em caso de falha na atualização. Workflows agendados em repositórios públicos podem ser desativados pelo GitHub após 60 dias sem atividade; podem ser reativados em Actions.

Fontes: [OpenWeather Current](https://openweathermap.org/current), [OpenWeather Forecast](https://openweathermap.org/forecast5) e [GitHub Actions schedule](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).
