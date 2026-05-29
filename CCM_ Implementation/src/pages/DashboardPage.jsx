import React, { useEffect, useRef, useState } from 'react';
import { db, auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';

import Header from '../components/Header';
import CatList from '../components/cat/CatList';
import MapContainer from '../components/map/MapContainer';
import ReportModal from '../components/modal/ReportModal';
import CatDetail from '../components/cat/CatDetail';

function DashboardPage({ user, setUser }) {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const prevCatsRef = useRef([]);

    const [cats, setCats] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clickedCoords, setClickedCoords] = useState({ lat: 0, lng: 0 });
    const [selectedCatId, setSelectedCatId] = useState(null);

    // 로그아웃
    const handleLogout = async () => {
        await signOut(auth);
        setUser(null);
    };

    // cats 실시간
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'cats'), (snapshot) => {
            setCats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsub();
    }, []);

    // ⭐ 지도 로딩 (핵심 복구 코드)
    useEffect(() => {
        const initMap = () => {
            if (!mapContainer.current) return;

            const center = new window.kakao.maps.LatLng(35.8242, 128.7530);

            const map = new window.kakao.maps.Map(mapContainer.current, {
                center,
                level: 3,
            });

            mapRef.current = map;
        };

        if (window.kakao && window.kakao.maps) {
            initMap();
            return;
        }

        const script = document.createElement('script');
        script.src =
            'https://dapi.kakao.com/v2/maps/sdk.js?appkey=8309e0e8095058bb527deb1918011c3c&autoload=false';
        script.async = true;

        script.onload = () => {
            window.kakao.maps.load(() => {
                initMap();
            });
        };

        document.head.appendChild(script);
    }, []);

    const currentSelectedCat = cats.find(c => c.id === selectedCatId);


    useEffect(() => {
        if (!mapRef.current) return;
        if (prevCatsRef.current === cats) return;

        prevCatsRef.current = cats;

        // 1. 기존 마커 삭제
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // 2. 새 마커 생성
        cats.forEach((cat) => {
            const position = new window.kakao.maps.LatLng(cat.lat, cat.lng);

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
    }, [cats]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">

            <Header user={user} onLogout={handleLogout} />

            <main className="flex flex-1 gap-6 p-4">

                <CatList
                    cats={cats}
                    onCatClick={(cat) => {
                        setSelectedCatId(cat.id);
                        if (mapRef.current) {
                            mapRef.current.panTo(
                                new window.kakao.maps.LatLng(cat.lat, cat.lng)
                            );
                        }
                    }}
                />

                {/* 🔥 이거 그대로 유지 (너가 준 MapContainer) */}
                <MapContainer ref={mapContainer} />

                <CatDetail
                    cat={currentSelectedCat}
                    onClose={() => setSelectedCatId(null)}
                />
            </main>

            <ReportModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

export default DashboardPage;