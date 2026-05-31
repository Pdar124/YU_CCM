import React, { useEffect, useRef, useState, useCallback } from 'react';
import { db, auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import {
    collection,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
import {
    getLatestReport
} from '../utils/prediction';

import CatPath from '../components/map/CatPath';
import ShelterMarkers from '../components/map/ShelterMarkers';
import PredictedMarker from '../components/map/PredictedMarker';
import CatMarkers from '../components/map/CatMarkers';
import useKakaoMap from '../hooks/useKakaoMap';
import useCats from '../hooks/useCats';
import useReports from '../hooks/useReports';
import useShelters from '../hooks/useShelters';
import useWeather from '../hooks/useWeather';
import useCatPrediction from '../hooks/useCatPrediction';

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

    const [searchKeyword, setSearchKeyword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clickedCoords, setClickedCoords] = useState({ lat: 0, lng: 0 });
    const [selectedCatId, setSelectedCatId] = useState(null);

    const handleMapClick = useCallback(({ lat, lng }) => {
        setClickedCoords({ lat, lng });
        setIsModalOpen(true);
    }, []);

    const {
        mapContainer,
        mapRef,
        mapReady
    } = useKakaoMap({
        onMapClick: handleMapClick
    });

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

    const filteredCats = cats.filter((cat) =>
        cat.name
            ?.toLowerCase()
            .includes(searchKeyword.toLowerCase())
    );
    const { currentSelectedCat, predictedLocation, reportCount, latestReport, nearestShelter }
        = useCatPrediction({ cats, reports, shelters, selectedCatId, isRain });

    // 디버깅용 로그
    useEffect(() => {
        console.log("reports:", reports);
        console.log("selectedCat:", currentSelectedCat);
        console.log("predictedLocation:", predictedLocation);
    }, [reports, currentSelectedCat, predictedLocation]);




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

                        const latestReport = getLatestReport(cat.id, reports);

                        const position = latestReport
                            ? new window.kakao.maps.LatLng(latestReport.lat, latestReport.lng)
                            : new window.kakao.maps.LatLng(cat.lat, cat.lng);

                        mapRef.current?.panTo(position);
                    }}
                />
                <main className="relative flex-1 overflow-hidden">
                    <MapContainer ref={mapContainer} />
                    <CatMarkers
                        map={mapRef.current}
                        cats={cats}
                        reports={reports}
                        onSelectCat={(cat, position) => {
                            setSelectedCatId(cat.id);
                            mapRef.current?.panTo(position);
                        }}
                    />
                    <PredictedMarker
                        mapRef={mapRef}
                        predictedLocation={predictedLocation}
                    />
                    <ShelterMarkers
                        mapRef={mapRef}
                        shelters={shelters}
                        isRain={isRain}
                    />
                    <CatPath
                        mapRef={mapRef}
                        reports={reports}
                        currentSelectedCat={currentSelectedCat}
                    />

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
                />

            </div>
        </div>
    );
}

export default DashboardPage;