import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../config/firebase';
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
    updateDoc,
    Timestamp
} from 'firebase/firestore';
import {
    getLatestReport
} from '../../utils/prediction';

import { getTimeAgo } from '../../utils/time';
import useCats from '../../hooks/useCats';
import useReports from '../../hooks/useReports';
import useShelters from '../../hooks/useShelters';
import useWeather from '../../hooks/useWeather';
import useCatPrediction from '../../hooks/useCatPrediction';
import useCatModals from '../../hooks/useCatModals';


import HistoryModal from '../../components/modal/HistoryModal';
import WikiEditModal from '../../components/modal/WikiEditModal';
import Header from '../../components/Header';
import MapContainer from '../../components/map/MapContainer';
import ReportModal from '../../components/modal/ReportModal';
import CatDetail from '../../components/cat/CatDetail';
import BottomNavigation from '../../components/navigation/BottomNavigation';

function DashboardPage({ user, setUser }) {
    const navigate = useNavigate();
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
    const guestDefaultSelectedRef = useRef(false);
    const [latestDietLog, setLatestDietLog] = useState(null);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clickedCoords, setClickedCoords] = useState({ lat: 0, lng: 0 });
    const [selectedCatId, setSelectedCatId] = useState(null);
    const [activeNavigation, setActiveNavigation] = useState('map');
    const isGuest = user?.role === 'guest';


    const {
        wikiModalOpen,
        wikiTargetCat,
        openWikiModal,
        closeWikiModal,
        historyModalOpen,
        historyTargetCat,
        openHistoryModal,
        closeHistoryModal
    } = useCatModals();



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
            closeWikiModal();
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
        if (isGuest) {
            alert('로그인 후 제보할 수 있습니다.');
            return;
        }

        try {
            await addDoc(collection(db, 'reports'), {
                catId: reportData.catId,
                lat: clickedCoords.lat,
                lng: clickedCoords.lng,
                memo: reportData.memo || '',
                imageUrl: reportData.imageUrl || '',
                reporterUid: user?.uid || '',
                reporterName:
                    user?.nickname ||
                    user?.studentId ||
                    user?.id ||
                    '익명 사용자',
                observedAt: reportData.observedAt
                    ? Timestamp.fromDate(reportData.observedAt)
                    : serverTimestamp(),
                createdAt: serverTimestamp()
            });

            setIsModalOpen(false);
        } catch (error) {
            console.error('제보 등록 실패:', error);
        }
    };


    const handleReportClick = (cat) => {
        if (isGuest) {
            alert('로그인 후 제보할 수 있습니다.');
            return;
        }

        setSelectedCatId(cat.id);

        const latestReport = getLatestReport(cat.id, reports);

        setClickedCoords({
            lat: latestReport?.lat || cat.lat,
            lng: latestReport?.lng || cat.lng
        });

        setIsModalOpen(true);
    };

    const moveMapToCat = (cat) => {
        if (!cat || !window.kakao?.maps || !mapRef.current) return;

        const latestReport = getLatestReport(cat.id, reports);
        const position = latestReport
            ? new window.kakao.maps.LatLng(latestReport.lat, latestReport.lng)
            : new window.kakao.maps.LatLng(cat.lat, cat.lng);

        mapRef.current.panTo(position);
    };

    const handleNavigationSelect = (itemId) => {
        setActiveNavigation(itemId);

        if (itemId === 'map') {
            setSelectedCatId(null);
            closeHistoryModal();
            return;
        }

        if (itemId === 'history') {
            if (!currentSelectedCat) {
                alert('히스토리를 볼 고양이를 먼저 선택해 주세요.');
                setActiveNavigation('map');
                return;
            }

            openHistoryModal(currentSelectedCat);
            return;
        }

        if (itemId === 'analysis') {
            if (!currentSelectedCat) {
                alert('동선을 볼 고양이를 먼저 선택해 주세요.');
                setActiveNavigation('map');
                return;
            }

            moveMapToCat(currentSelectedCat);
            return;
        }

        if (itemId === 'profile') {
            navigate(isGuest ? '/login' : '/profile');
        }
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
                    if (isGuest) {
                        alert('로그인 후 제보할 수 있습니다.');
                        return;
                    }

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
            window.kakao.maps.load(initMap);
            return;
        }

        const existingScript = document.getElementById('kakao-map-sdk');
        const loadKakaoMap = () => {
            if (window.kakao?.maps) {
                window.kakao.maps.load(initMap);
            }
        };

        if (existingScript) {
            existingScript.addEventListener('load', loadKakaoMap, { once: true });
            loadKakaoMap();
            return;
        }

        const script = document.createElement('script');
        script.id = 'kakao-map-sdk';
        script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=8309e0e8095058bb527deb1918011c3c&autoload=false';
        script.async = true;
        script.onload = loadKakaoMap;
        script.onerror = () => {
            console.warn('카카오 지도 스크립트를 불러오지 못해 기본 지도 배경을 표시합니다.');
        };

        document.head.appendChild(script);
    }, [isGuest]);

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

    useEffect(() => {
        if (
            !isGuest ||
            guestDefaultSelectedRef.current ||
            selectedCatId ||
            cats.length === 0
        ) return;

        guestDefaultSelectedRef.current = true;
        setSelectedCatId(cats[0].id);
    }, [cats, isGuest, selectedCatId]);

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
                    latestDietLog={latestDietLog}
                    caregiverCats={caregiverCats}
                    onCatClick={(cat) => {
                        if (!cat) {
                            setSelectedCatId(null);
                            setActiveNavigation('map');
                            return;
                        }

                        setSelectedCatId(cat.id);
                        setActiveNavigation('map');

                        moveMapToCat(cat);
                    }}
                />
                <main className="relative flex-1 overflow-hidden">
                    <MapContainer ref={mapContainer} isReady={mapReady} />

                    <CatDetail
    cat={currentSelectedCat}
    user={user}
    isRain={isRain}
    predictedLocation={predictedLocation}
    reportCount={reportCount}
    latestReport={latestReport}
    nearestShelter={nearestShelter}
    hasLatestDietLog={
        user?.activeMode === 'caregiver' && !!latestDietLog
    }
    onClose={() => setSelectedCatId(null)}
    onReport={handleReportClick}
    onWikiEdit={openWikiModal}
    onHistoryView={openHistoryModal}
/>

                </main>
               {user?.activeMode === 'caregiver' && latestDietLog && (
    <div className="absolute left-4 right-4 bottom-20 z-30">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm flex items-center gap-2 shadow-lg">
            ⚠️
            <span>
                {latestDietLog.catName}{' '}
                {getTimeAgo(latestDietLog.fedAt)}{' '}
                급여 기록이 있어요.
            </span>
        </div>
    </div>
)}
                <BottomNavigation
                    activeItem={activeNavigation}
                    onSelect={handleNavigationSelect}
                />

                <ReportModal
                    isOpen={isModalOpen && !isGuest}
                    onClose={() => setIsModalOpen(false)}
                    cats={cats}
                    clickedCoords={clickedCoords}
                    selectedCatId={selectedCatId}
                    onSubmit={handleAddReport}
                    user={user}
                />
                <WikiEditModal
                    isOpen={wikiModalOpen}
                    cat={wikiTargetCat}
                    onClose={closeWikiModal}
                    onSave={handleSaveWiki}
                />
                <HistoryModal
                    isOpen={historyModalOpen}
                    cat={historyTargetCat}
                    user={user}
                    onClose={closeHistoryModal}
                />

            </div>
        </div>
    );
}

export default DashboardPage;
