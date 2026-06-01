import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

function AdminPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'caregiverRequests'),
      where('status', '==', 'pending')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setRequests(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    return () => unsub();
  }, []);

  const handleApprove = async (request) => {
    try {
      await updateDoc(doc(db, 'users', request.uid), {
        role: 'caregiver',
        caregiverCatIds: request.catIds || []
      });

      await updateDoc(doc(db, 'caregiverRequests', request.id), {
        status: 'approved',
        approvedAt: serverTimestamp()
      });

      alert('돌보미 신청을 승인했습니다.');
    } catch (error) {
      console.error(error);
      alert('승인 처리 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async (request) => {
    try {
      await updateDoc(doc(db, 'caregiverRequests', request.id), {
        status: 'rejected',
        rejectedAt: serverTimestamp()
      });

      alert('돌보미 신청을 반려했습니다.');
    } catch (error) {
      console.error(error);
      alert('반려 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-white px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-3xl text-slate-700"
          >
            ‹
          </button>

          <h1 className="text-lg font-black text-slate-900">
            관리자 승인
          </h1>

          <div className="w-8" />
        </div>

        <p className="text-sm text-slate-500 mb-6">
          승인 대기 중인 돌보미 신청을 확인하고 처리할 수 있습니다.
        </p>

        {requests.length === 0 ? (
          <div className="text-center text-slate-400 py-20">
            승인 대기 중인 신청이 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="border border-slate-200 rounded-3xl p-4 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-black text-slate-900">
                      {request.nickname || request.studentId}
                    </div>
                    <div className="text-xs text-slate-400">
                      학번: {request.studentId || '정보 없음'}
                    </div>
                  </div>

                  <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold">
                    승인 대기
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-3 text-sm text-slate-600 mb-3">
                  <div className="font-bold text-slate-800 mb-1">
                    신청 사유
                  </div>
                  {request.reason}
                </div>

                <div className="text-xs text-slate-500 mb-4">
                  신청 고양이 ID:{' '}
                  {(request.catIds || []).join(', ') || '없음'}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(request)}
                    className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold"
                  >
                    승인
                  </button>

                  <button
                    onClick={() => handleReject(request)}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 text-sm font-bold"
                  >
                    반려
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;