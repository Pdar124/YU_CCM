import React, { useEffect, useRef, useState } from 'react';
import { db, auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { collection, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';

import Header from '../components/Header';
import CatList from '../components/cat/CatList';
import MapContainer from '../components/map/MapContainer';
import ReportModal from '../components/modal/ReportModal';
import CatDetail from '../components/cat/CatDetail';

function DashboardPage({ user, setUser }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  const [cats, setCats] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState({ lat: 0, lng: 0 });
  const [selectedCatId, setSelectedCatId] = useState(null);

  // 로그아웃
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // cats
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'cats'), (snapshot) => {
      setCats(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });

    return () => unsub();
  }, []);

  const currentSelectedCat = cats.find(c => c.id === selectedCatId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">

      <Header user={user} onLogout={handleLogout} />

      <main className="flex flex-1 gap-6 p-4">
        <CatList
          cats={cats}
          onCatClick={(cat) => setSelectedCatId(cat.id)}
        />

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