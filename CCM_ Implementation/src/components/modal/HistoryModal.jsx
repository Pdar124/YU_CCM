import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  ClipboardList,
  FileText,
  MapPin,
  Pencil,
  UserPlus,
  Utensils,
  X
} from 'lucide-react';

function HistoryModal({ isOpen, cat, user, onClose }) {
  const navigate = useNavigate();
  const [histories, setHistories] = useState([]);

  useEffect(() => {
    if (!isOpen || !cat) return;

    const unsubscribes = [];
    const logsByType = {
      diet: [],
      wiki: [],
      report: []
    };

    const updateHistories = () => {
      const sorted = [
        ...logsByType.diet,
        ...logsByType.wiki,
        ...logsByType.report
      ].sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      setHistories(sorted);
    };

    const dietQuery = query(
      collection(db, 'dietLogs'),
      where('catId', '==', cat.id)
    );

    const wikiQuery = query(
      collection(db, 'wikiHistories'),
      where('catId', '==', cat.id)
    );

    const reportQuery = query(
      collection(db, 'reports'),
      where('catId', '==', cat.id)
    );

    unsubscribes.push(
      onSnapshot(dietQuery, (snapshot) => {
        logsByType.diet = snapshot.docs.map(doc => ({
            id: doc.id,
            type: 'diet',
            createdAt: doc.data().fedAt,
            ...doc.data()
          }));

        updateHistories();
      })
    );

    unsubscribes.push(
      onSnapshot(wikiQuery, (snapshot) => {
        logsByType.wiki = snapshot.docs.map(doc => ({
            id: doc.id,
            type: 'wiki',
            createdAt: doc.data().editedAt,
            ...doc.data()
          }));

        updateHistories();
      })
    );

    unsubscribes.push(
      onSnapshot(reportQuery, (snapshot) => {
        logsByType.report = snapshot.docs.map(doc => ({
            id: doc.id,
            type: 'report',
            createdAt: doc.data().observedAt || doc.data().createdAt,
            ...doc.data()
          }));

        updateHistories();
      })
    );

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [isOpen, cat]);

  if (!isOpen || !cat) return null;

  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return '시간 정보 없음';

    return timestamp.toDate().toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] p-5 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ClipboardList size={20} strokeWidth={2.5} />
            </div>

            <div>
              <h2 className="font-black text-lg text-slate-900">
                {cat.name} 히스토리
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                급여, 위키, 제보 기록을 모아봤어요.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="히스토리 닫기"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {user?.role === 'student' && (
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/caregiver/apply');
            }}
            className="mb-4 w-full rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 border border-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all"
          >
            <UserPlus size={17} strokeWidth={2.5} />
            돌보미 신청
          </button>
        )}

        {histories.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-center text-slate-400 py-10">
            <ClipboardList
              size={32}
              strokeWidth={2.5}
              className="mx-auto mb-2 text-slate-300"
            />
            <div className="text-sm font-bold">
              아직 기록이 없습니다.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {histories.map((item, index) => (
              <div
                key={`${item.type}-${item.id}-${index}`}
                className="border border-slate-100 rounded-3xl p-4 bg-slate-50/80"
              >
                <div className="text-xs text-slate-400 mb-1">
                  {formatTime(item.createdAt)}
                </div>

                {item.type === 'diet' && (
                  <>
                    <div className="flex items-center gap-2 font-bold text-orange-600">
                      <Utensils size={17} strokeWidth={2.5} />
                      급여/건강 기록
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      사료: {item.foodType || '정보 없음'} · 급여량: {item.amount}
                    </div>
                    <div className="text-sm text-slate-600">
                      건강 상태: {(item.symptoms || []).join(', ') || '특이사항 없음'}
                    </div>
                    {item.memo && (
                      <div className="text-sm text-slate-500 mt-1">
                        메모: {item.memo}
                      </div>
                    )}
                  </>
                )}

                {item.type === 'wiki' && (
                  <>
                    <div className="flex items-center gap-2 font-bold text-indigo-600">
                      <Pencil size={17} strokeWidth={2.5} />
                      위키 수정
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      특징: {item.feature || '정보 없음'}
                    </div>
                    <div className="text-sm text-slate-600">
                      건강: {item.healthStatus || '정보 없음'}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      작성자: {item.editorName || '정보 없음'}
                    </div>
                  </>
                )}

                {item.type === 'report' && (
                  <>
                    <div className="flex items-center gap-2 font-bold text-emerald-600">
                      <MapPin size={17} strokeWidth={2.5} />
                      제보 기록
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      위도 {item.lat?.toFixed?.(5)} · 경도 {item.lng?.toFixed?.(5)}
                    </div>
                    {item.imageUrl && (
                      <div className="relative mt-3 overflow-hidden rounded-2xl">
                        <img
                          src={item.imageUrl}
                          alt="제보 사진"
                          className="w-full h-36 object-cover"
                        />
                        <div className="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-1 text-[10px] font-bold text-white flex items-center gap-1">
                          <FileText size={11} strokeWidth={2.5} />
                          제보 사진
                        </div>
                      </div>
                    )}
                    {item.memo && (
                      <div className="text-sm text-slate-500 mt-2">
                        메모: {item.memo}
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">
                      제보자: {item.reporterName || '정보 없음'}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryModal;
