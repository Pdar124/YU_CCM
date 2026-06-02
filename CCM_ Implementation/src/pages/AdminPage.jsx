import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useNavigate } from 'react-router-dom';

function AdminPage() {
  const navigate = useNavigate();
  const [cats, setCats] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [catRequests, setCatRequests] = useState([]);

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

  useEffect(() => {
    const unsubCats = onSnapshot(collection(db, 'cats'), (snapshot) => {
      setCats(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });

    const unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
      setReports(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });
    const unsubCatRequests = onSnapshot(
      collection(db, 'catRegistrationRequests'),
      (snapshot) => {
        setCatRequests(
          snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        );
      }
    );

    return () => {
      unsubCats();
      unsubReports();
      unsubUsers();
      unsubCatRequests();
    };
  }, []);

  const handleApprove = async (request) => {
    try {
      await updateDoc(doc(db, 'users', request.uid), {
        role: 'caregiver',
        activeMode: 'student',
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
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert('로그아웃 실패');
    }
  };
  const caregiverCount =
    users.filter(user => user.role === 'caregiver').length;

  const pendingCount = requests.length;

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-white pb-24 border-x border-violet-200">
        <div className="bg-gradient-to-r from-violet-500 via-purple-400 to-fuchsia-400 rounded-t-[28px] px-5 pt-5 pb-10 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
            onClick={() => navigate('/')}
            className="text-3xl text-slate-700"
            >‹</button>
            </div>
            <div className="font-sans flex flex-items text-xl">
              관리자 대시보드
            </div>

            <div className="flex items-center gap-3 text-2xl">
              <button>⚙️</button>
            </div>
          </div>
        </div>

        <div className="-mt-7 bg-white rounded-3xl p-5 shadow-sm border border-violet-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-slate-900">
              통계 요약
            </h2>

            <button className="text-xs border border-slate-200 rounded-xl px-3 py-2 text-slate-600">
              2026.05.07 기준⌄
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white border border-violet-100 rounded-2xl p-3 text-center shadow-sm">
              <div className="text-[10px] text-violet-600 font-bold">총 고양이 수</div>
              <div className="text-xl font-black mt-2">{cats.length}</div>
            </div>

            <div className="bg-white border border-violet-100 rounded-2xl p-3 text-center shadow-sm">
              <div className="text-[10px] text-violet-600 font-bold">총 제보 수</div>
              <div className="text-xl font-black mt-2">{reports.length}</div>
            </div>

            <div className="bg-white border border-violet-100 rounded-2xl p-3 text-center shadow-sm">
              <div className="text-[10px] text-violet-600 font-bold">돌보미 수</div>
              <div className="text-xl font-black mt-2">{caregiverCount}</div>
            </div>

            <div className="bg-white border border-violet-100 rounded-2xl p-3 text-center shadow-sm">
              <div className="text-[10px] text-violet-600 font-bold">승인 대기 수</div>
              <div className="text-xl font-black mt-2">{pendingCount}</div>
            </div>
          </div>
        </div>


        {/* 돌보미 승인 대기 */}
        <div className="px-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-slate-900">
              돌보미 승인 대기
            </h2>

            <button className="text-xs text-violet-600 font-bold">
              전체 보기 〉
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="text-center text-slate-400 py-10 bg-white border border-violet-100 rounded-3xl">
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
                      className="flex-1 py-3 rounded-2xl bg-violet-600 text-white text-sm font-bold"
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

        {/* 신규 고양이 등록 승인 */}
        <div className="px-5 mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-slate-900">
              새로운 고양이 등록 승인
            </h2>

            <button className="text-xs text-violet-600 font-bold">
              전체 보기 〉
            </button>
          </div>

          {catRequests.length === 0 ? (
            <div className="text-center text-slate-400 py-8 bg-slate-50 rounded-3xl">
              신규 고양이 등록 요청이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {catRequests.slice(0, 2).map((request) => (
                <div
                  key={request.id}
                  className="border border-slate-200 rounded-3xl p-4 bg-white shadow-sm"
                >
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl overflow-hidden">
                      {request.imageUrl ? (
                        <img
                          src={request.imageUrl}
                          alt="신규 고양이"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        '🐈'
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="font-black text-slate-900">
                        {request.tempName || '새로운 고양이'}
                      </div>

                      <div className="text-xs text-slate-500 mt-1">
                        제보자: {request.requesterName || '정보 없음'}
                      </div>

                      <div className="text-xs text-slate-500">
                        특징: {request.description || '정보 없음'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold">
                      승인
                    </button>

                    <button className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">
                      반려
                    </button>

                    <button className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold">
                      자세히 보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="px-5 mt-8">
          <h2 className="font-black text-slate-900 mb-3">
            빠른 관리 메뉴
          </h2>

          <div className="grid grid-cols-4 gap-3">
            <button className="bg-violet-50 rounded-2xl p-4">
              <div className="text-2xl mb-2">👤</div>
              <div className="text-xs font-bold">사용자 관리</div>
            </button>

            <button className="bg-violet-50 rounded-2xl p-4">
              <div className="text-2xl mb-2">🛡️</div>
              <div className="text-xs font-bold">권한 관리</div>
            </button>

            <button className="bg-violet-50 rounded-2xl p-4">
              <div className="text-2xl mb-2">🐱</div>
              <div className="text-xs font-bold">고양이 관리</div>
            </button>

            <button className="bg-violet-50 rounded-2xl p-4">
              <div className="text-2xl mb-2">📢</div>
              <div className="text-xs font-bold">공지 관리</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;