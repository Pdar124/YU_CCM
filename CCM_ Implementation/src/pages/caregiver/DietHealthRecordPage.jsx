import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';

function DietHealthRecordPage({ user }) {
  const navigate = useNavigate();
  const { catId } = useParams();

  const [cat, setCat] = useState(null);
  const [foodType, setFoodType] = useState('');
  const [amount, setAmount] = useState('normal');
  const [symptoms, setSymptoms] = useState(['기타 이상 없음']);
  const [memo, setMemo] = useState('');

  const symptomList = [
    '식욕 저하',
    '구토',
    '설사',
    '기침/재채기',
    '눈물/눈곱',
    '절뚝거림',
    '피부 이상',
    '기타 이상 없음'
  ];

  useEffect(() => {
    const fetchCat = async () => {
      const snap = await getDoc(doc(db, 'cats', catId));

      if (snap.exists()) {
        setCat({
          id: snap.id,
          ...snap.data()
        });
      }
    };

    fetchCat();
  }, [catId]);

  const toggleSymptom = (symptom) => {
    setSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((item) => item !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSave = async () => {
    if (!user?.caregiverCatIds?.includes(catId)) {
      alert('담당 고양이만 기록할 수 있습니다.');
      return;
    }

    if (!amount) {
      alert('급여량을 선택해주세요.');
      return;
    }

    try {
      await addDoc(collection(db, 'dietLogs'), {
        catId,
        catName: cat?.name || '',
        caregiverUid: user.uid,
        caregiverName: user.nickname || user.studentId || user.id,
        foodType,
        amount,
        symptoms,
        memo,
        fedAt: serverTimestamp()
      });

      alert('급여 및 건강 기록이 저장되었습니다.');
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('기록 저장에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-white px-5 py-5">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="text-2xl">
            ‹
          </button>

          <h1 className="font-black text-lg">
            급여와 건강 기록 작성
          </h1>

          <button className="text-sm text-emerald-600 font-bold">
            기록 히스토리
          </button>
        </div>

        {cat && (
          <div className="border border-slate-100 rounded-3xl p-4 mb-5 flex items-center gap-3 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-3xl">
              {cat.icon || '🐈'}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-lg">{cat.name}</h2>
                <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded-full font-bold">
                  담당 고양이
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                거주 추정지: {cat.territory || cat.location || '정보 없음'}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2">기록 시간</label>
            <div className="w-full px-4 py-3 border rounded-2xl text-sm text-slate-600">
              현재 시간으로 자동 기록
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">사료 종류</label>
            <input
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              placeholder="예: 건식 사료"
              className="w-full px-4 py-3 border rounded-2xl text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">급여량</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                ['small', '소량', '20g 미만'],
                ['normal', '보통', '20~40g'],
                ['large', '많음', '40g 이상'],
                ['unknown', '모름', '']
              ].map(([value, label, desc]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAmount(value)}
                  className={`py-3 rounded-2xl border text-xs ${
                    amount === value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold'
                      : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <div>{label}</div>
                  <div className="text-[10px]">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-3xl p-4">
            <label className="block text-sm font-bold mb-1">건강 특이사항</label>
            <p className="text-xs text-slate-400 mb-3">
              이상 징후를 복수 선택할 수 있어요.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {symptomList.map((symptom) => (
                <label
                  key={symptom}
                  className="flex items-center gap-2 text-xs text-slate-600"
                >
                  <input
                    type="checkbox"
                    checked={symptoms.includes(symptom)}
                    onChange={() => toggleSymptom(symptom)}
                    className="accent-emerald-600"
                  />
                  {symptom}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">메모</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              maxLength={200}
              placeholder="평소보다 잘 먹었어요. 활발한 모습이었어요!"
              className="w-full h-24 px-4 py-3 border rounded-2xl text-sm resize-none"
            />
            <div className="text-right text-xs text-slate-400">
              {memo.length}/200
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black"
          >
            기록 저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default DietHealthRecordPage;
