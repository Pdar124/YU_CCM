import { useEffect, useState } from 'react';
import { getWeather } from '../config/weather';

export default function useWeather() {
    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const data = await getWeather(
                    35.8314,
                    128.7570
                );

                setWeather(data);
            } catch (error) {
                console.error(
                    '날씨 정보를 가져오는 데 실패했습니다:',
                    error
                );
            } finally {
                setWeatherLoading(false);
            }
        };

        fetchWeather();
    }, []);

    const weatherMain =
        weather?.weather?.[0]?.main;
    
    //isRain = true -> 테스트용

    const isRain = [
        'Rain',
        'Drizzle',
        'Thunderstorm'
    ].includes(weatherMain);

    return {
        weather,
        weatherLoading,
        isRain
    };
}