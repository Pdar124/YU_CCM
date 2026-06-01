import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import useCats from '../hooks/useCats';

function CaregiverApplicationPage({ user }) {
  const navigate = useNavigate();
  const { cats } = useCats();

  const [selectedCatIds, setSelectedCatIds] = useState([]);
  const [reason, setReason] = useState('');
  const [authCode, setAuthCode] = useState('');

  const toggleCat = (catId) => {
    setSelectedCatIds((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedCatIds.length === 0) {
      alert('돌봄을 희망하는 고양이를 선택해주세요.');
      return;
    }

    if (!reason.trim()) {
      alert('신청 사유를 입력해주세요.');
      return;
    }

    try {
      await addDoc(collection(db, 'caregiverRequests'), {
        uid: user.uid,
        studentId: user.studentId || user.id,
        nickname: user.nickname || user.id,
        catIds: selectedCatIds,
        reason: reason.trim(),
        authCode: authCode.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      });

      alert('돌보미 신청이 접수되었습니다.');
      navigate('/');
    } catch (error) {
      console.error('돌보미 신청 실패:', error);
      alert('신청 저장 중 오류가 발생했습니다.');
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
            돌보미 신청
          </h1>

          <div className="w-8" />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-black text-slate-900">
            담당하고 싶은 고양이를 선택해주세요
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            신청 후 관리자의 승인을 받으면 돌보미 모드를 사용할 수 있어요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-3">
              고양이 선택
            </label>

            <div className="space-y-2">
              {cats.map((cat) => {
                const selected = selectedCatIds.includes(cat.id);

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCat(cat.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left ${
                      selected
                        ? 'border-orange-400 bg-orange-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="text-2xl">{cat.icon || '🐈'}</div>

                    <div className="flex-1">
                      <div className="font-bold text-slate-900">
                        {cat.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {cat.location || '위치 정보 없음'}
                      </div>
                    </div>

                    <div className="text-lg">
                      {selected ? '🟠' : '⚪'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              신청 사유
            </label>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="예: 중앙도서관 근처 고양이에게 주기적으로 급식하고 있습니다."
              className="w-full h-32 px-4 py-3 border border-slate-200 rounded-2xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              인증 코드 또는 참고 내용
            </label>

            <input
              type="text"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder="선택 입력"
              className="w-full px-4 py-4 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black shadow-lg shadow-orange-100"
          >
            신청 제출
          </button>
        </form>
      </div>
    </div>
  );
}

export default CaregiverApplicationPage;