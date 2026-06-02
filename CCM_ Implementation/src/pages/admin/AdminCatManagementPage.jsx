import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

function AdminCatManagementPage() {
  const navigate = useNavigate();

  const [cats, setCats] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'cats'), (snapshot) => {
      setCats(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    return () => unsub();
  }, []);

  const filteredCats = cats.filter((cat) =>
    (cat.name || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleToggleStatus = async (cat) => {
    await updateDoc(doc(db, 'cats', cat.id), {
      status:
        cat.status === 'inactive'
          ? 'active'
          : 'inactive'
    });
  };

  return (
    <div className="min-h-screen bg-violet-50 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-white px-5 py-5">

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="text-3xl"
          >
            ‹
          </button>

          <h1 className="text-lg font-black">
            고양이 관리
          </h1>

          <div className="w-8" />
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="고양이 이름 검색"
          className="w-full px-4 py-3 border rounded-2xl mb-5"
        />

        <div className="space-y-3">
          {filteredCats.map((cat) => (
            <div
              key={cat.id}
              className="border border-violet-100 rounded-3xl p-4"
            >
              <div className="flex gap-3">

                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100">
                  {cat.imageUrl ? (
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      🐈
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="font-black">
                    {cat.name}
                  </div>

                  <div className="text-xs text-slate-500">
                    {cat.description}
                  </div>

                  <div className="mt-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        cat.status === 'inactive'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-green-50 text-green-600'
                      }`}
                    >
                      {cat.status || 'active'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleToggleStatus(cat)}
                className="w-full mt-3 py-2 rounded-xl bg-violet-600 text-white text-sm font-bold"
              >
                {cat.status === 'inactive'
                  ? '활성화'
                  : '비활성화'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminCatManagementPage;