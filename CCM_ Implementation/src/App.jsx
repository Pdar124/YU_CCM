import { onAuthStateChanged } from 'firebase/auth';
import { auth,db } from './config/firebase';
import { useEffect, useRef, useState } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc } from 'firebase/firestore';

import Header from './components/Header';
import MapContainer from './components/map/MapContainer';
import CatList from './components/cat/CatList';
import CatDetail from './components/cat/CatDetail';
import ReportModal from './components/modal/ReportModal';


function App() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  const [cats, setCats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState({ lat: 0, lng: 0 });
  const [selectedCatId, setSelectedCatId] = useState(null);

  // 로그인 유저 상태
  const [user, setUser] = useState(null);

  // 인증 상태 감시
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const studentIdOnly = firebaseUser.email
          ? firebaseUser.email.split('@')[0]
          : '';

        setUser({
          id: studentIdOnly,
          role: 'member',
          uid: firebaseUser.uid,
        });
      } else {
        setUser((currentUser) =>
          currentUser?.role === 'guest' ? currentUser : null
        );
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src =
      'https://dapi.kakao.com/v2/maps/sdk.js?appkey=8309e0e8095058bb527deb1918011c3c&autoload=false';
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        initMap();
      });
    };

    document.head.appendChild(script);

    function initMap() {
      if (!mapContainer.current) return;

      const centerPosition = new window.kakao.maps.LatLng(
        35.8242,
        128.7530
      );

      const mapOptions = {
        center: centerPosition,
        level: 3,
      };

      const map = new window.kakao.maps.Map(
        mapContainer.current,
        mapOptions
      );

      mapRef.current = map;

      window.kakao.maps.event.addListener(
        map,
        'click',
        (mouseEvent) => {
          const latlng = mouseEvent.latLng;

          setClickedCoords({
            lat: latlng.getLat(),
            lng: latlng.getLng(),
          });

          setIsModalOpen(true);
        }
      );
    }
  }, []);

  // 파이어베이스 실시간 감시
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'cats'),
      (snapshot) => {
        const catList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCats(catList);
      }
    );

    return () => unsubscribe();
  }, []);

  // 마커 업데이트
  useEffect(() => {
    if (!mapRef.current || cats.length === 0) return;

    cats.forEach((cat) => {
      const markerPosition = new window.kakao.maps.LatLng(
        cat.lat,
        cat.lng
      );

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        map: mapRef.current,
      });

      window.kakao.maps.event.addListener(marker, 'click', () => {
        setSelectedCatId(cat.id);
        mapRef.current.panTo(markerPosition);
      });
    });
  }, [cats]);

  const handleCatClick = (cat) => {
    if (mapRef.current) {
      const newCenter = new window.kakao.maps.LatLng(
        cat.lat,
        cat.lng
      );

      mapRef.current.panTo(newCenter);
    }

    setSelectedCatId(cat.id);
  };

  const handleReportSubmit = async (newCatData) => {
    try {
      await addDoc(collection(db, 'cats'), {
        name: newCatData.name,
        location: newCatData.location,
        bio: newCatData.bio || '사람을 좋아해요.',
        lastFed: '배고픔 🐾',
        icon: newCatData.icon,
        lat: Number(newCatData.lat),
        lng: Number(newCatData.lng),
      });
    } catch (error) {
      console.error('제보 중 오류: ', error);
    }
  };

  const handleUpdateCat = async (catId, updatedFields) => {
    try {
      const catDocRef = doc(db, 'cats', catId);

      await updateDoc(catDocRef, updatedFields);

      console.log('데이터베이스 업데이트 성공!');
    } catch (error) {
      console.error('업데이트 중 오류: ', error);
    }
  };

  const currentSelectedCat = cats.find(
    (c) => c.id === selectedCatId
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      <Header user={user} />

      <main className="flex-1 flex flex-col md:flex-row p-4 md:p-6 gap-6 h-[calc(100vh-73px)]">
        <CatList
          cats={cats}
          onCatClick={(cat) => handleCatClick(cat)}
        />

        <MapContainer ref={mapContainer} />

        <CatDetail
          cat={currentSelectedCat}
          onClose={() => setSelectedCatId(null)}
          onUpdateCat={handleUpdateCat}
        />
      </main>

      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleReportSubmit}
        lat={clickedCoords.lat}
        lng={clickedCoords.lng}
      />
    </div>
  );
}

export default App;