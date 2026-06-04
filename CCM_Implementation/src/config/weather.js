export const getWeather = async (lat, lon) => {
  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lon)
    });

    const res = await fetch(
      `/api/weather?${params.toString()}`
    );

    if (!res.ok) {
      throw new Error(`날씨 데이터를 가져오는 데 실패했습니다. 상태코드: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("API 요청 중 오류 발생:", error);
    throw error;
  }
};
