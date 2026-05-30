// src/config/weather.js

// .env 파일에 저장된 API Key 가져오기
const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;

export const getWeather = async (lat, lon) => {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
    );

    // 응답이 성공(200 OK)이 아닐 경우 에러 던지기
    if (!res.ok) {
      throw new Error(`날씨 데이터를 가져오는 데 실패했습니다. 상태코드: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("API 요청 중 오류 발생:", error);
    throw error;
  }
};