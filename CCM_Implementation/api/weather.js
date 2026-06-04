const DEFAULT_UNITS = 'metric';
const DEFAULT_LANG = 'kr';

export default async function handler(req, res) {
  const { lat, lon } = req.query;
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'OPENWEATHER_API_KEY 환경변수가 설정되지 않았습니다.'
    });
  }

  if (!lat || !lon) {
    return res.status(400).json({
      error: 'lat, lon 쿼리 파라미터가 필요합니다.'
    });
  }

  const params = new URLSearchParams({
    lat,
    lon,
    appid: apiKey,
    units: DEFAULT_UNITS,
    lang: DEFAULT_LANG
  });

  try {
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?${params.toString()}`
    );

    const data = await weatherResponse.json();

    if (!weatherResponse.ok) {
      return res.status(weatherResponse.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('OpenWeather 요청 실패:', error);

    return res.status(502).json({
      error: '날씨 정보를 가져오지 못했습니다.'
    });
  }
}
