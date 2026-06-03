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
import {
    AlertTriangle,
    LocateFixed,
    Route,
    Sparkles,
    X
} from 'lucide-react';

import { getTimeAgo } from '../../utils/time';
import useCats from '../../hooks/useCats';
import useReports from '../../hooks/useReports';
import useShelters from '../../hooks/useShelters';
import useWeather from '../../hooks/useWeather';
import useCatPrediction from '../../hooks/useCatPrediction';
import useCatModals from '../../hooks/useCatModals';
import { getCatImageUrl } from '../../utils/catImage';


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
    const polylineRef = useRef([]); // 동선 참조 추가
    const [latestDietLog, setLatestDietLog] = useState(null);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clickedCoords, setClickedCoords] = useState({ lat: 0, lng: 0 });
    const [selectedCatId, setSelectedCatId] = useState(null);
    const [activeNavigation, setActiveNavigation] = useState('map');

    const isGuest = user?.role === 'guest';

    const createCurvedRoutePath = (points) => {
        if (points.length < 2 || !window.kakao?.maps) return points;

        const curvedPath = [];

        points.forEach((point, index) => {
            const nextPoint = points[index + 1];

            if (!nextPoint) {
                curvedPath.push(point);
                return;
            }

            const startLat = point.getLat();
            const startLng = point.getLng();
            const endLat = nextPoint.getLat();
            const endLng = nextPoint.getLng();
            const midLat = (startLat + endLat) / 2;
            const midLng = (startLng + endLng) / 2;
            const latDiff = endLat - startLat;
            const lngDiff = endLng - startLng;
            const curveStrength = 0.18;
            const controlLat = midLat - lngDiff * curveStrength;
            const controlLng = midLng + latDiff * curveStrength;

            for (let step = 0; step < 14; step += 1) {
                const t = step / 14;
                const lat =
                    (1 - t) * (1 - t) * startLat +
                    2 * (1 - t) * t * controlLat +
                    t * t * endLat;
                const lng =
                    (1 - t) * (1 - t) * startLng +
                    2 * (1 - t) * t * controlLng +
                    t * t * endLng;

                curvedPath.push(new window.kakao.maps.LatLng(lat, lng));
            }
        });

        curvedPath.push(points[points.length - 1]);

        return curvedPath;
    };

    // Custom marker image generator
    const createMarkerImage = ({ emoji, bgColor, borderColor, size = 48 }) => {
        if (!window.kakao?.maps) return null;

        const svg = `
            <svg width="${size}" height="${size + 10}" viewBox="0 0 ${size} ${size + 10}" fill="none" xmlns="http://www.w3.org/2000/svg">
                <filter id="shadow" x="0" y="0" width="${size}" height="${size + 10}" filterUnits="userSpaceOnUse">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.18"/>
                </filter>
                <g filter="url(#shadow)">
                    <path d="M${size / 2} ${size + 6}C${size / 2} ${size + 6} ${size / 2 - 7} ${size - 2} ${size / 2 - 13} ${size - 10}C${size / 2 - 19} ${size - 18} ${size / 2 - 22} ${size - 24} ${size / 2 - 22} ${size / 2}C${size / 2 - 22} ${size / 2 - 12} ${size / 2 - 12} 2 ${size / 2} 2C${size / 2 + 12} 2 ${size / 2 + 22} ${size / 2 - 12} ${size / 2 + 22} ${size / 2}C${size / 2 + 22} ${size - 24} ${size / 2 + 19} ${size - 18} ${size / 2 + 13} ${size - 10}C${size / 2 + 7} ${size - 2} ${size / 2} ${size + 6} ${size / 2} ${size + 6}Z" fill="${bgColor}" stroke="${borderColor}" stroke-width="3"/>
                    <circle cx="${size / 2}" cy="${size / 2}" r="17" fill="white" fill-opacity="0.92"/>
                    <text x="50%" y="${size / 2 + 7}" text-anchor="middle" font-size="22" font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif">${emoji}</text>
                </g>
            </svg>
        `;

        const imageSrc = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
        const imageSize = new window.kakao.maps.Size(size, size + 10);
        const imageOption = {
            offset: new window.kakao.maps.Point(size / 2, size + 6)
        };

        return new window.kakao.maps.MarkerImage(
            imageSrc,
            imageSize,
            imageOption
        );
    };

    // 🐱 Custom cat marker element for CustomOverlay
    const createCatMarkerElement = ({ cat, isSelected, lastSeenText, onClick }) => {
        const markerButton = document.createElement('button');
        markerButton.type = 'button';
        markerButton.setAttribute('aria-label', `${cat.name} 마커`);
        markerButton.style.width = isSelected ? '150px' : '56px';
        markerButton.style.height = isSelected ? '112px' : '64px';
        markerButton.style.position = 'relative';
        markerButton.style.border = '0';
        markerButton.style.padding = '0';
        markerButton.style.background = 'transparent';
        markerButton.style.cursor = 'pointer';
        markerButton.style.transform = 'translateY(-6px)';
        markerButton.style.display = 'flex';
        markerButton.style.alignItems = 'flex-end';
        markerButton.style.justifyContent = 'center';

        if (isSelected) {
            const bubble = document.createElement('div');
            bubble.style.position = 'absolute';
            bubble.style.left = '50%';
            bubble.style.top = '0';
            bubble.style.transform = 'translateX(-50%)';
            bubble.style.display = 'flex';
            bubble.style.alignItems = 'center';
            bubble.style.gap = '6px';
            bubble.style.padding = '8px 11px';
            bubble.style.borderRadius = '16px';
            bubble.style.background = 'rgba(255, 255, 255, 0.96)';
            bubble.style.border = '1px solid rgba(16, 185, 129, 0.18)';
            bubble.style.color = '#334155';
            bubble.style.fontSize = '11px';
            bubble.style.fontWeight = '800';
            bubble.style.lineHeight = '1';
            bubble.style.whiteSpace = 'nowrap';
            bubble.style.boxShadow = '0 12px 28px rgba(15, 23, 42, 0.16)';
            bubble.style.backdropFilter = 'blur(10px)';
            bubble.style.pointerEvents = 'none';

            const bubbleIcon = document.createElement('span');
            bubbleIcon.textContent = '📍';
            bubbleIcon.style.display = 'flex';
            bubbleIcon.style.width = '22px';
            bubbleIcon.style.height = '22px';
            bubbleIcon.style.borderRadius = '999px';
            bubbleIcon.style.alignItems = 'center';
            bubbleIcon.style.justifyContent = 'center';
            bubbleIcon.style.background = '#ecfdf5';
            bubbleIcon.style.color = '#059669';
            bubbleIcon.innerHTML = `
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
            `;

            const bubbleText = document.createElement('span');
            bubbleText.textContent = '최근 위치';
            bubbleText.style.color = '#64748b';

            const bubbleTime = document.createElement('span');
            bubbleTime.textContent = lastSeenText || '정보 없음';
            bubbleTime.style.color = '#059669';

            const bubbleTail = document.createElement('div');
            bubbleTail.style.position = 'absolute';
            bubbleTail.style.left = '50%';
            bubbleTail.style.bottom = '-5px';
            bubbleTail.style.width = '10px';
            bubbleTail.style.height = '10px';
            bubbleTail.style.background = 'rgba(255, 255, 255, 0.96)';
            bubbleTail.style.borderRight = '1px solid rgba(16, 185, 129, 0.18)';
            bubbleTail.style.borderBottom = '1px solid rgba(16, 185, 129, 0.18)';
            bubbleTail.style.transform = 'translateX(-50%) rotate(45deg)';

            bubble.appendChild(bubbleIcon);
            bubble.appendChild(bubbleText);
            bubble.appendChild(bubbleTime);
            bubble.appendChild(bubbleTail);
            markerButton.appendChild(bubble);
        }

        const pin = document.createElement('div');
        pin.style.width = isSelected ? '60px' : '52px';
        pin.style.height = isSelected ? '60px' : '52px';
        pin.style.borderRadius = '999px';
        pin.style.background = isSelected ? '#fb923c' : '#10b981';
        pin.style.border = `3px solid ${isSelected ? '#fed7aa' : '#bbf7d0'}`;
        pin.style.boxShadow = '0 8px 18px rgba(15, 23, 42, 0.22)';
        pin.style.display = 'flex';
        pin.style.alignItems = 'center';
        pin.style.justifyContent = 'center';
        pin.style.position = 'relative';

        const inner = document.createElement('div');
        inner.style.width = isSelected ? '46px' : '40px';
        inner.style.height = isSelected ? '46px' : '40px';
        inner.style.borderRadius = '999px';
        inner.style.background = '#ffffff';
        inner.style.overflow = 'hidden';
        inner.style.display = 'flex';
        inner.style.alignItems = 'center';
        inner.style.justifyContent = 'center';
        inner.style.fontSize = isSelected ? '26px' : '22px';
        inner.style.lineHeight = '1';

        const catImageUrl = getCatImageUrl(cat);

        if (catImageUrl) {
            const img = document.createElement('img');
            img.src = catImageUrl;
            img.alt = cat.name || '고양이';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            inner.appendChild(img);
        } else {
            inner.textContent = cat.icon || '🐱';
        }

        const tail = document.createElement('div');
        tail.style.position = 'absolute';
        tail.style.left = '50%';
        tail.style.bottom = '-6px';
        tail.style.width = '14px';
        tail.style.height = '14px';
        tail.style.background = isSelected ? '#fb923c' : '#10b981';
        tail.style.borderRight = `3px solid ${isSelected ? '#fed7aa' : '#bbf7d0'}`;
        tail.style.borderBottom = `3px solid ${isSelected ? '#fed7aa' : '#bbf7d0'}`;
        tail.style.transform = 'translateX(-50%) rotate(45deg)';
        tail.style.borderRadius = '2px';

        pin.appendChild(inner);
        pin.appendChild(tail);
        markerButton.appendChild(pin);
        markerButton.addEventListener('click', onClick);

        return markerButton;
    };


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

            if (predictedLocation && window.kakao?.maps && mapRef.current) {
                mapRef.current.panTo(
                    new window.kakao.maps.LatLng(
                        predictedLocation.lat,
                        predictedLocation.lng
                    )
                );
            } else {
                moveMapToCat(currentSelectedCat);
            }
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
        markersRef.current.forEach(marker => marker.setMap && marker.setMap(null));
        markersRef.current = [];

        const visibleMarkerCats = selectedCatId
            ? cats.filter((cat) => cat.id === selectedCatId)
            : cats;

        // 새 마커 생성
        visibleMarkerCats.forEach((cat) => {
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

            const isSelected = selectedCatId === cat.id;
            const latestReportTime =
                latestReport?.observedAt ||
                latestReport?.createdAt;
            const content = createCatMarkerElement({
                cat,
                isSelected,
                lastSeenText: latestReportTime
                    ? getTimeAgo(latestReportTime)
                    : '기본 위치',
                onClick: () => {
                    setSelectedCatId(cat.id);
                    mapRef.current.panTo(position);
                }
            });

            const marker = new window.kakao.maps.CustomOverlay({
                map: mapRef.current,
                position,
                content,
                yAnchor: 1
            });

            markersRef.current.push(marker);
        });
    }, [cats, reports, mapReady, selectedCatId]);


    // 📍 예측 위치 마커 업데이트
    useEffect(() => {
        console.log("예측마커 실행");
        console.log("mapRef:", mapRef.current);
        console.log("predictedLocation:", predictedLocation);

        if (!mapRef.current) return;

        if (predictedMarkerRef.current) {
            predictedMarkerRef.current.setMap(null);
            predictedMarkerRef.current = null;
        }
        if (predictedCircleRef.current) {
            predictedCircleRef.current.setMap(null);
            predictedCircleRef.current = null;
        }

        if (activeNavigation !== 'analysis') return;
        if (!predictedLocation) return;

        const position =
            new window.kakao.maps.LatLng(
                predictedLocation.lat,
                predictedLocation.lng
            );

        const markerImage = createMarkerImage({
            emoji: '📍',
            bgColor: '#6366f1',
            borderColor: '#c7d2fe',
            size: 50
        });

        const marker = new window.kakao.maps.Marker({
            map: mapRef.current,
            position,
            image: markerImage
        });

        const circle = new window.kakao.maps.Circle({
            center: position,
            radius: 50,
            strokeWeight: 3,
            strokeColor: '#6366f1',
            strokeOpacity: 0.75,
            fillColor: '#818cf8',
            fillOpacity: 0.18,
            map: mapRef.current
        });
        mapRef.current.panTo(position);

        const infowindow =
            new window.kakao.maps.InfoWindow({
                content: `
            <div style="padding:10px 12px; font-size:12px; font-weight:800; color:#4338ca; border-radius:14px;">
                Recency Weight 예측 위치
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

    }, [activeNavigation, predictedLocation, mapReady]);

    // 🛣️ 고양이 이동 경로(Polyline) 표시
    useEffect(() => {
        if (!mapRef.current) return;
        if (!currentSelectedCat) {
            polylineRef.current.forEach((overlay) => {
                overlay.setMap(null);
            });
            polylineRef.current = [];
            return;
        }

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

        polylineRef.current.forEach((overlay) => {
            overlay.setMap(null);
        });
        polylineRef.current = [];

        if (catReports.length < 2) return;

        const path = catReports.map(
            report =>
                new window.kakao.maps.LatLng(
                    report.lat,
                    report.lng
                )
        );
        const curvedPath = createCurvedRoutePath(path);

        const routeShadow = new window.kakao.maps.Polyline({
            path: curvedPath,
            strokeWeight: 10,
            strokeColor: '#ffffff',
            strokeOpacity: 0.92,
            strokeStyle: 'solid'
        });

        const routeLine = new window.kakao.maps.Polyline({
            path: curvedPath,
            strokeWeight: 6,
            strokeColor: '#10b981',
            strokeOpacity: 0.95,
            strokeStyle: 'shortdash'
        });

        const startPoint = new window.kakao.maps.Circle({
            center: path[0],
            radius: 9,
            strokeWeight: 3,
            strokeColor: '#ffffff',
            strokeOpacity: 1,
            fillColor: '#94a3b8',
            fillOpacity: 1
        });

        const endPoint = new window.kakao.maps.Circle({
            center: path[path.length - 1],
            radius: 12,
            strokeWeight: 4,
            strokeColor: '#ffffff',
            strokeOpacity: 1,
            fillColor: '#10b981',
            fillOpacity: 1
        });

        routeShadow.setMap(mapRef.current);
        routeLine.setMap(mapRef.current);
        startPoint.setMap(mapRef.current);
        endPoint.setMap(mapRef.current);

        polylineRef.current = [
            routeShadow,
            routeLine,
            startPoint,
            endPoint
        ];

        return () => {
            polylineRef.current.forEach((overlay) => {
                overlay.setMap(null);
            });
            polylineRef.current = [];
        };

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

        const markerImage = createMarkerImage({
            emoji: '☔',
            bgColor: '#38bdf8',
            borderColor: '#bae6fd',
            size: 46
        });

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
                    ${shelter.name}
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

                    {activeNavigation !== 'analysis' && (
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
                    )}
                    {activeNavigation === 'analysis' && currentSelectedCat && (
                        <div className="absolute left-4 right-4 bottom-24 z-50 rounded-3xl bg-white p-4 shadow-2xl border border-indigo-100">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <Route size={20} strokeWidth={2.5} />
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-black text-slate-900">
                                            동선 분석
                                        </h2>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {currentSelectedCat.name}의 최근 제보 기반 예측 위치입니다.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setActiveNavigation('map')}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                    aria-label="동선 분석 닫기"
                                >
                                    <X size={18} strokeWidth={2.5} />
                                </button>
                            </div>

                            {predictedLocation ? (
                                <div className="rounded-2xl p-3 border bg-indigo-50 border-indigo-100">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="flex items-center gap-1.5 text-sm font-black text-indigo-700">
                                            <LocateFixed size={16} strokeWidth={2.5} />
                                            AI 예측 위치
                                        </span>

                                        <span className="flex items-center gap-1 text-[10px] text-indigo-500 font-semibold">
                                            <Sparkles size={12} strokeWidth={2.5} />
                                            Recency Weight
                                        </span>
                                    </div>

                                    <div className="text-xs text-slate-600">
                                        위도 {predictedLocation.lat.toFixed(5)} · 경도{' '}
                                        {predictedLocation.lng.toFixed(5)}
                                    </div>

                                    <div className="text-[11px] text-slate-500 mt-1">
                                        최근 {reportCount || 0}건의 제보를 기반으로 예측했습니다.
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-2xl p-4 bg-slate-50 text-sm text-slate-500 text-center">
                                    예측 위치 데이터가 아직 없습니다.
                                </div>
                            )}
                        </div>
                    )}
                </main>
                {user?.activeMode === 'caregiver' && latestDietLog && (
                    <div className="absolute left-4 right-4 bottom-20 z-30">
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm flex items-center gap-2 shadow-lg">
                            <AlertTriangle
                                size={18}
                                strokeWidth={2.5}
                                className="shrink-0 text-amber-600"
                            />
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
