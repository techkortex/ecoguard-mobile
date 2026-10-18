export const POINT={latitude:-23.4834,longitude:-46.8082};
const finite=value=>typeof value==='number'&&Number.isFinite(value);
const metric=value=>finite(value)?value:null;
function rain(container,field){
  if(container===undefined)return 0;
  if(!container||typeof container!=='object'||Array.isArray(container))return null;
  const value=container[field];return finite(value)&&value>=0?value:null;
}
export function adapt(weather,forecast,now=Date.now()){
  if(!finite(weather?.main?.temp)||!finite(weather?.dt)||!Array.isArray(forecast?.list))throw new Error('A OpenWeather retornou dados incompletos.');
  const item=weather.weather?.[0]||{};
  const periods=forecast.list.slice(0,4).map(p=>({at:finite(p.dt)?p.dt*1000:null,temperatureC:metric(p.main?.temp),pop:finite(p.pop)&&p.pop>=0&&p.pop<=1?p.pop*100:null,rainMm:rain(p.rain,'3h'),conditionId:metric(p.weather?.[0]?.id),description:p.weather?.[0]?.description||'Previsão'}));
  return {current:{locationLabel:'Parque Imperial, Barueri',observedAt:weather.dt*1000,temperatureC:weather.main.temp,feelsLikeC:metric(weather.main.feels_like),humidity:metric(weather.main.humidity),conditionId:metric(item.id),description:typeof item.description==='string'?item.description:'Condição indisponível',icon:typeof item.icon==='string'?item.icon:'',windKmh:finite(weather.wind?.speed)?weather.wind.speed*3.6:null,gustKmh:finite(weather.wind?.gust)?weather.wind.gust*3.6:null,rain1hMm:rain(weather.rain,'1h')},forecast:{periods},source:'OpenWeather',receivedAt:now};
}
export async function fetchWeather(apiKey,fetcher=fetch){
  if(typeof apiKey!=='string'||apiKey.trim().length<16)throw new Error('Configure a chave OpenWeather no servidor.');
  async function request(endpoint){
    const url=new URL('https://api.openweathermap.org/data/2.5/'+endpoint);
    url.search=new URLSearchParams({lat:String(POINT.latitude),lon:String(POINT.longitude),appid:apiKey.trim(),units:'metric',lang:'pt_br',...(endpoint==='forecast'?{cnt:'4'}:{})});
    let response;try{response=await fetcher(url,{signal:AbortSignal.timeout(12000)})}catch{throw new Error('Não foi possível conectar à OpenWeather.')}
    if(!response.ok)throw new Error(response.status===401?'A OpenWeather recusou a chave configurada no servidor.':response.status===429?'Limite de consultas da OpenWeather atingido. Aguarde alguns minutos.':'A OpenWeather está indisponível no momento.');
    try{return await response.json()}catch{throw new Error('A OpenWeather retornou uma resposta inválida.')}
  }
  const [weather,forecast]=await Promise.all([request('weather'),request('forecast')]);return adapt(weather,forecast);
}
