import React, { useEffect, useRef, useState } from 'react';
import { db, auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

import {
    collection,
    query,
    orderBy,
    limit,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    updateDoc
} from 'firebase/firestore';
import {
    getLatestReport
} from '../utils/prediction';

import WikiEditModal from '../components/modal/WikiEditModal';
import useCats from '../hooks/useCats';
import useReports from '../hooks/useReports';
import useShelters from '../hooks/useShelters';
import useWeather from '../hooks/useWeather';
import useCatPrediction from '../hooks/useCatPrediction';

import DietHealthModal from '../components/modal/DietHealthModal';
import Header from '../components/Header';
import MapContainer from '../components/map/MapContainer';
import ReportModal from '../components/modal/ReportModal';
import CatDetail from '../components/cat/CatDetail';
import BottomNavigation from '../components/navigation/BottomNavigation';

function DashboardPage({ user, setUser }) {
    const { cats } = useCats();
    const { reports } = useReports();
    const { shelters } = useShelters();
    const { weather, weatherLoading, isRain } = useWeather();

    const [mapReady, setMapReady] = useState(false); // 지도 로딩 상태 추가
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const predictedCircleRef = useRef(null); // 예측 위치 원 참조 추가
    const shelterMarkersRef = useRef([]); // 보호소 마커 참조 추가
    const predictedMarkerRef = useRef(null); // 예측 위치 마커 참조 추가
    const polylineRef = useRef(null); // 동선 참조 추가
    const [latestDietLog, setLatestDietLog] = useState(null);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clickedCoords, setClickedCoords] = useState({ lat: 0, lng: 0 });
    const [selectedCatId, setSelectedCatId] = useState(null);

    const [dietModalOpen, setDietModalOpen] = useState(false);
    const [dietTargetCat, setDietTargetCat] = useState(null);

    const [wikiModalOpen, setWikiModalOpen] = useState(false);
    const [wikiTargetCat, setWikiTargetCat] = useState(null);

    const handleDietCheck = (cat) => {
        setDietTargetCat(cat);
        setDietModalOpen(true);
    };

    const handleSaveDietLog = async (formData) => {
        if (!dietTargetCat) return;

        if (!formData.amount) {
            alert('급여량을 선택해주세요.');
            return;
        }

        try {
            await addDoc(collection(db, 'dietLogs'), {
                catId: dietTargetCat.id,
                catName: dietTargetCat.name,
                caregiverUid: user.uid,
                caregiverName:
                    user.nickname ||
                    user.studentId ||
                    user.id,
                foodType: formData.foodType || '',
                amount: formData.amount,
                symptoms: formData.symptoms || [],
                memo: formData.memo || '',
                fedAt: serverTimestamp()
            });

            alert('급여 및 건강 기록이 저장되었습니다.');

            setDietModalOpen(false);
            setDietTargetCat(null);
        } catch (error) {
            console.error('급여/건강 기록 저장 실패:', error);
            alert('기록 저장 중 오류가 발생했습니다.');
        }
    };

    const handleWikiEdit = (cat) => {
        setWikiTargetCat(cat);
        setWikiModalOpen(true);
    };

    const handleSaveWiki = async (formData) => {
        try {
            const isMyCat =
                user?.caregiverCatIds?.includes(wikiTargetCat.id);

            if (!isMyCat) {
                alert('담당 고양이만 수정할 수 있습니다.');
                return;
            }

            await updateDoc(doc(db, 'cats', wikiTargetCat.id), {
                origin: formData.origin,
                feature: formData.feature,
                healthStatus: formData.healthStatus,
                territory: formData.territory
            });

            await addDoc(collection(db, 'wikiHistories'), {
                catId: wikiTargetCat.id,
                editorUid: user.uid,
                editorName:
                    user.studentId ||
                    user.nickname,
                ...formData,
                editedAt: serverTimestamp()
            });

            alert('위키 수정이 저장되었습니다.');
            setWikiModalOpen(false);
        } catch (error) {
            console.error(error);
            alert('위키 저장 실패');
        }
    };

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


    const handleReportClick = (cat) => {
        setSelectedCatId(cat.id);

        const latestReport = getLatestReport(cat.id, reports);

        setClickedCoords({
            lat: latestReport?.lat || cat.lat,
            lng: latestReport?.lng || cat.lng
        });

        setIsModalOpen(true);
    };

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
    const { currentSelectedCat, predictedLocation, reportCount, latestReport, nearestShelter }
        = useCatPrediction({ cats, reports, shelters, selectedCatId, isRain });
    const caregiverCats =
        user?.caregiverCatIds?.length
            ? cats.filter(cat =>
                user.caregiverCatIds.includes(cat.id)
            )
            : [];

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
                getLatestReport(cat.id, reports);

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
                strokeColor: '#7ED957',
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

    useEffect(() => {
        const q = query(
            collection(db, 'dietLogs'),
            orderBy('fedAt', 'desc'),
            limit(1)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setLatestDietLog({
                    id: snapshot.docs[0].id,
                    ...snapshot.docs[0].data()
                });
            }
        });

        return () => unsub();
    }, []);



    return (
        <div className="min-h-screen bg-slate-100 flex justify-center">
            <div className="w-full max-w-md min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">

                {/* 💡 Header에 weather와 loading 상태를 props로 전달합니다 */}
                <Header
                    user={user}
                    setUser={setUser}
                    onLogout={handleLogout}
                    weather={weather}
                    weatherLoading={weatherLoading}
                    isRain={isRain}
                    cats={filteredCats}
                    selectedCatId={selectedCatId}
                    searchKeyword={searchKeyword}
                    onSearchChange={setSearchKeyword}
                    latestReport={latestReport}
                    caregiverCats={caregiverCats}
                    latestDietLog={latestDietLog}
                    onCatClick={(cat) => {
                        setSelectedCatId(cat.id);

                        const latestReport = getLatestReport(cat.id, reports);

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
                        user={user}
                        isRain={isRain}
                        predictedLocation={predictedLocation}
                        reportCount={reportCount}
                        latestReport={latestReport}
                        nearestShelter={nearestShelter}
                        onClose={() => setSelectedCatId(null)}
                        onReport={handleReportClick}
                        onDietCheck={handleDietCheck}
                        onWikiEdit={handleWikiEdit}
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
                />
                <WikiEditModal
                    isOpen={wikiModalOpen}
                    cat={wikiTargetCat}
                    onClose={() =>
                        setWikiModalOpen(false)
                    }
                    onSave={handleSaveWiki}
                />

                <DietHealthModal
                    isOpen={dietModalOpen}
                    cat={dietTargetCat}
                    onClose={() => {
                        setDietModalOpen(false);
                        setDietTargetCat(null);
                    }}
                    onSave={handleSaveDietLog}
                />

            </div>
        </div>
    );
}

export default DashboardPage;