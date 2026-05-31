import React, { useEffect, useRef, useState } from 'react';
import { db, auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import {
    collection,
    onSnapshot,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import { getWeather } from '../config/weather';

import Header from '../components/Header';
import CatList from '../components/cat/CatList';
import MapContainer from '../components/map/MapContainer';
import ReportModal from '../components/modal/ReportModal';
import CatDetail from '../components/cat/CatDetail';
import BottomNavigation from '../components/navigation/BottomNavigation';

function DashboardPage({ user, setUser }) {
    const [reports, setReports] = useState([]); // 신고 데이터 상태 추가
    const [mapReady, setMapReady] = useState(false); // 지도 로딩 상태 추가
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const prevCatsRef = useRef([]);
    const predictedCircleRef = useRef(null); // 예측 위치 원 참조 추가
    const shelterMarkersRef = useRef([]); // 보호소 마커 참조 추가
    const predictedMarkerRef = useRef(null); // 예측 위치 마커 참조 추가
    const polylineRef = useRef(null); // 동선 참조 추가

    // 날씨 관련 상태
    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);

    // 날씨 상태에서 비 여부 판단
    const weatherMain =
        weather?.weather?.[0]?.main;

    const isRain = [
        'Rain',
        'Drizzle',
        'Thunderstorm'
    ].includes(weatherMain);

    //비오는날 테스트
    // const isRain = true; 

    const [cats, setCats] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clickedCoords, setClickedCoords] = useState({ lat: 0, lng: 0 });
    const [selectedCatId, setSelectedCatId] = useState(null);

    // 보호소 데이터 상태 추가
    const [shelters, setShelters] = useState([]);
    // 로그아웃
    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
    };
    // 신고 등록 함수
    const handleAddReport = async (reportData) => {
        try {
            await addDoc(collection(db, 'reports'), {
                catId: reportData.catId,
                lat: clickedCoords.lat,
                lng: clickedCoords.lng,
                createdAt: serverTimestamp()
            });

            setIsModalOpen(false);
        } catch (error) {
            console.error('제보 등록 실패:', error);
        }
    };

    // 신고의 최신성 가중치 계산 함수 <<Recency Weight 함수>>
    const getRecencyWeight = (timestamp) => {
        if (!timestamp) return 0;

        const reportTime =
            timestamp.toDate().getTime();

        const hoursAgo =
            (Date.now() - reportTime) /
            (1000 * 60 * 60);

        let weight =
            Math.exp(-0.1 * hoursAgo);

        // 1시간 이내의 신고는 가중치를 2배로 높여서 최근 신고에 더 큰 영향을 주도록 함
        if (hoursAgo <= 1) {
            weight *= 2;
        }//

        return weight;
    };
    // 두 지점 간의 거리 계산 함수 (간단한 유클리드 거리)
    const getDistance = (lat1, lng1, lat2, lng2) => {
        const dx = lat1 - lat2;
        const dy = lng1 - lng2;

        return Math.sqrt(dx * dx + dy * dy);
    };

    const getNearestShelter = (lat, lng) => {
        if (shelters.length === 0) return null;

        return shelters.reduce((nearest, shelter) => {
            const currentDistance = getDistance(
                lat,
                lng,
                shelter.lat,
                shelter.lng
            );

            const nearestDistance = getDistance(
                lat,
                lng,
                nearest.lat,
                nearest.lng
            );

            return currentDistance < nearestDistance
                ? shelter
                : nearest;
        });
    };
    // 고양이 ID에 따른 최신 신고 정보 계산 함수
    const getLatestReport = (catId) => {
        const catReports = reports
            .filter(
                report => report.catId === catId
            )
            .sort(
                (a, b) =>
                    b.createdAt?.toMillis() -
                    a.createdAt?.toMillis()
            );

        return catReports[0];
    };
    // 고양이 ID에 따른 예측 위치 계산 함수
    const getPredictedLocation = (catId) => {

        const catReports =
            reports.filter(
                report => report.catId === catId
            );

        if (catReports.length === 0)
            return null;

        let weightedLat = 0;
        let weightedLng = 0;
        let totalWeight = 0;

        catReports.forEach(report => {
            const weight =
                getRecencyWeight(
                    report.createdAt
                );

            weightedLat +=
                report.lat * weight;

            weightedLng +=
                report.lng * weight;

            totalWeight += weight;
        });
        const predictedLat = weightedLat / totalWeight;
        const predictedLng = weightedLng / totalWeight;
        // 비 오는 날에는 보호소 위치도 고려 

        const nearestShelter = getNearestShelter(
            predictedLat,
            predictedLng
        );

        if (isRain && nearestShelter) {
            return {
                lat:
                    weightedLat / totalWeight * 0.7 +
                    nearestShelter.lat * 0.3,

                lng:
                    weightedLng / totalWeight * 0.7 +
                    nearestShelter.lng * 0.3
            };
        }
        return {
            lat: predictedLat,
            lng: predictedLng
        };
    };

    const handleReportClick = (cat) => {
        setSelectedCatId(cat.id);

        const latestReport = getLatestReport(cat.id);

        setClickedCoords({
            lat: latestReport?.lat || cat.lat,
            lng: latestReport?.lng || cat.lng
        });

        setIsModalOpen(true);
    };


    // 🌤️ 날씨 정보 가져오기 (지도의 로딩을 방해하지 않음)
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const data = await getWeather(
                    35.8314, // 위도
                    128.7570 // 경도
                );
                setWeather(data);
            } catch (error) {
                console.error("날씨 정보를 가져오는 데 실패했습니다:", error);
            } finally {
                setWeatherLoading(false);

            }
        };

        fetchWeather();
    }, []);

    // 🐱 cats 실시간 데이터 구독
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'cats'), (snapshot) => {
            setCats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsub();
    }, []);

    // 🏠 shelters 실시간 데이터 구독
    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, 'shelters'),
            (snapshot) => {

                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                console.log("shelters 데이터:", data);

                setShelters(data);
            }
        );

        return () => unsub();
    }, []);

    // 📝 reports 실시간 데이터 구독
    useEffect(() => {
        const unsub = onSnapshot(
            collection(db, 'reports'),
            (snapshot) => {
                setReports(
                    snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                );
            }
        );

        return () => unsub();
    }, []);

    // 🗺️ 카카오 지도 초기화
    useEffect(() => {
        const initMap = () => {
            if (!mapContainer.current) return;

            const center = new window.kakao.maps.LatLng(35.8242, 128.7530);
            const map = new window.kakao.maps.Map(mapContainer.current, {
                center,
                level: 3,
            });

            mapRef.current = map;
            setMapReady(true);

            // 지도 클릭 이벤트 등록
            window.kakao.maps.event.addListener(
                map,
                'click',
                (mouseEvent) => {
                    const latlng = mouseEvent.latLng;

                    setClickedCoords({
                        lat: latlng.getLat(),
                        lng: latlng.getLng()
                    });

                    setIsModalOpen(true);
                }
            );
        };

        if (window.kakao && window.kakao.maps) {
            initMap();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=8309e0e8095058bb527deb1918011c3c&autoload=false';
        script.async = true;

        script.onload = () => {
            window.kakao.maps.load(() => {
                initMap();
            });
        };

        document.head.appendChild(script);
    }, []);

    const filteredCats = cats.filter((cat) =>
        cat.name
            ?.toLowerCase()
            .includes(searchKeyword.toLowerCase())
    );

    const currentSelectedCat = cats.find(c => c.id === selectedCatId);
    // 현재 선택된 고양이의 예측 위치 계산
    const predictedLocation =
        currentSelectedCat
            ? getPredictedLocation(
                currentSelectedCat.id
            )
            : null;
    // 현재 선택된 고양이에 대한 신고 건수 계산
    const reportCount =
        reports.filter(
            report => report.catId === currentSelectedCat?.id
        ).length;
    // 현재 선택된 고양이에 대한 최신 신고 정보 계산
    const latestReport =
        reports
            .filter(
                report =>
                    report.catId === currentSelectedCat?.id
            )
            .sort((a, b) => {
                const aTime = a.createdAt?.seconds ?? 0;
                const bTime = b.createdAt?.seconds ?? 0;
                return bTime - aTime;
            })[0];
    // 예측 위치에서 가장 가까운 보호소 계산
    const nearestShelter =
        predictedLocation
            ? getNearestShelter(
                predictedLocation.lat,
                predictedLocation.lng
            )
            : null;



    // 디버깅용 로그
    useEffect(() => {
        console.log("reports:", reports);
        console.log("selectedCat:", currentSelectedCat);
        console.log("predictedLocation:", predictedLocation);
    }, [reports, currentSelectedCat, predictedLocation]);

    // 📍 고양이 마커 업데이트
    useEffect(() => {
        if (!mapRef.current) return;


        // 기존 마커 삭제
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // 새 마커 생성
        cats.forEach((cat) => {
            const latestReport =
                getLatestReport(cat.id);

            const position =
                latestReport
                    ? new window.kakao.maps.LatLng(
                        latestReport.lat,
                        latestReport.lng
                    )
                    : new window.kakao.maps.LatLng(
                        cat.lat,
                        cat.lng
                    );

            const marker = new window.kakao.maps.Marker({
                map: mapRef.current,
                position,
            });

            window.kakao.maps.event.addListener(marker, 'click', () => {
                setSelectedCatId(cat.id);
                mapRef.current.panTo(position);
            });

            markersRef.current.push(marker);
        });
    }, [cats, reports, mapReady]);


    // 📍 예측 위치 마커 업데이트
    useEffect(() => {
        console.log("예측마커 실행");
        console.log("mapRef:", mapRef.current);
        console.log("predictedLocation:", predictedLocation);

        if (!mapRef.current) return;
        if (!predictedLocation) return;

        if (predictedMarkerRef.current) {
            predictedMarkerRef.current.setMap(null);
        }
        if (predictedCircleRef.current) {
            predictedCircleRef.current.setMap(null);
        }

        const position =
            new window.kakao.maps.LatLng(
                predictedLocation.lat,
                predictedLocation.lng
            );

        // 예측 위치 마커는 고양이 마커와는 다른 아이콘으로 표시
        const imageSrc =
            'https://cdn-icons-png.flaticon.com/512/1828/1828884.png';

        const imageSize =
            new window.kakao.maps.Size(32, 32);

        const markerImage =
            new window.kakao.maps.MarkerImage(
                imageSrc,
                imageSize
            );

        const marker = new window.kakao.maps.Marker({
            map: mapRef.current,
            position,
            image: markerImage
        });

        const circle = new window.kakao.maps.Circle({
            center: position,
            radius: 50,
            strokeWeight: 2,
            strokeOpacity: 0.8,
            fillOpacity: 0.2,
            map: mapRef.current
        });
        mapRef.current.panTo(position);

        const infowindow =
            new window.kakao.maps.InfoWindow({
                content: `
            <div style="padding:8px;">
                📍 Recency Weight 예측 위치
            </div>
        `
            });

        window.kakao.maps.event.addListener(
            marker,
            'click',
            () => {
                infowindow.open(
                    mapRef.current,
                    marker
                );
            }
        );


        predictedMarkerRef.current = marker;
        predictedCircleRef.current = circle;

    }, [predictedLocation, mapReady]);

    // 🛣️ 고양이 이동 경로(Polyline) 표시
    useEffect(() => {
        if (!mapRef.current) return;
        if (!currentSelectedCat) return;

        const catReports = reports
            .filter(
                report =>
                    report.catId === currentSelectedCat.id
            )
            .sort(
                (a, b) =>
                    a.createdAt?.toMillis() -
                    b.createdAt?.toMillis()
            );

        if (catReports.length < 2) return;

        const path = catReports.map(
            report =>
                new window.kakao.maps.LatLng(
                    report.lat,
                    report.lng
                )
        );

        if (polylineRef.current) {
            polylineRef.current.setMap(null);
        }

        const polyline =
            new window.kakao.maps.Polyline({
                path,
                strokeWeight: 4,
                strokeColor: '#6366F1',
                strokeOpacity: 0.8,
                strokeStyle: 'dashed'
            });

        polyline.setMap(mapRef.current);

        polylineRef.current = polyline;

    }, [reports, currentSelectedCat]);

    // ☔ 비 오는 날 보호소 마커 업데이트
    useEffect(() => {
        if (!mapRef.current) return;

        console.log('shelters:', shelters);
        console.log('isRain:', isRain);

        shelterMarkersRef.current.forEach(marker =>
            marker.setMap(null)
        );

        shelterMarkersRef.current = [];

        if (!isRain) return;

        const imageSrc =
            'https://cdn-icons-png.flaticon.com/512/3313/3313888.png';

        const imageSize =
            new window.kakao.maps.Size(36, 36);

        const markerImage =
            new window.kakao.maps.MarkerImage(
                imageSrc,
                imageSize
            );

        shelters.forEach((shelter) => {
            const marker = new window.kakao.maps.Marker({
                map: mapRef.current,
                position: new window.kakao.maps.LatLng(
                    shelter.lat,
                    shelter.lng
                ),
                image: markerImage
            });

            const infowindow =
                new window.kakao.maps.InfoWindow({
                    content: `
                <div style="padding:8px;">
                    ☔ ${shelter.name}
                </div>
            `
                });

            window.kakao.maps.event.addListener(
                marker,
                'click',
                () => {
                    console.log('보호소 클릭!');

                    infowindow.open(
                        mapRef.current,
                        marker
                    );
                }
            );

            shelterMarkersRef.current.push(marker);
        });

    }, [shelters, isRain, mapReady]);



    return (
        <div className="min-h-screen bg-slate-100 flex justify-center">
            <div className="w-full max-w-md min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">

                {/* 💡 Header에 weather와 loading 상태를 props로 전달합니다 */}
                <Header
                    user={user}
                    onLogout={handleLogout}
                    weather={weather}
                    weatherLoading={weatherLoading}
                    isRain={isRain}
                    cats={filteredCats}
                    selectedCatId={selectedCatId}
                    searchKeyword={searchKeyword}
                    onSearchChange={setSearchKeyword}
                    latestReport={latestReport}
                    onCatClick={(cat) => {
                        setSelectedCatId(cat.id);

                        const latestReport = getLatestReport(cat.id);

                        const position = latestReport
                            ? new window.kakao.maps.LatLng(latestReport.lat, latestReport.lng)
                            : new window.kakao.maps.LatLng(cat.lat, cat.lng);

                        mapRef.current?.panTo(position);
                    }}
                />
                <main className="relative flex-1 overflow-hidden">
                    <MapContainer ref={mapContainer} />

                    <CatDetail
                        cat={currentSelectedCat}
                        isRain={isRain}
                        predictedLocation={predictedLocation}
                        reportCount={reportCount}
                        latestReport={latestReport}
                        nearestShelter={nearestShelter}
                        onClose={() => setSelectedCatId(null)}
                        onReport={handleReportClick}
                    />
                </main>
                <BottomNavigation />

                <ReportModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    cats={cats}
                    clickedCoords={clickedCoords}
                    selectedCatId={selectedCatId}
                    onSubmit={handleAddReport}
                />ƒ

            </div>
        </div>
    );
}

export default DashboardPage;