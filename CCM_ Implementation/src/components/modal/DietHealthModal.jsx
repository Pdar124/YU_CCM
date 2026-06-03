import { useState } from 'react';

function DietHealthModal({
  isOpen,
  cat,
  onClose,
  onSave
}) {
  const [foodType, setFoodType] =
    useState('');

  const [amount, setAmount] =
    useState('normal');

  const [memo, setMemo] =
    useState('');

  const [symptoms, setSymptoms] =
    useState([]);

  if (!isOpen) return null;

  const symptomList = [
    '특이사항 없음',
    '식욕 저하',
    '구토',
    '설사',
    '절뚝거림'
  ];

  const toggleSymptom = (symptom) => {
    setSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">

      <div className="bg-white rounded-3xl p-5 w-full max-w-md">

        <h2 className="font-black text-lg mb-4">
          🍖 급여 / 건강 기록
        </h2>

        <div className="mb-3">
          <div className="font-bold text-sm mb-2">
            고양이
          </div>

          <div className="text-slate-600">
            {cat?.name}
          </div>
        </div>

        <div className="mb-3">
          <div className="font-bold text-sm mb-2">
            사료 종류
          </div>

          <input
            value={foodType}
            onChange={(e) =>
              setFoodType(e.target.value)
            }
            className="w-full border rounded-xl p-3"
            placeholder="예: 캐츠랑"
          />
        </div>

        <div className="mb-3">
          <div className="font-bold text-sm mb-2">
            급여량
          </div>

          <div className="flex gap-2">
            {['small', 'normal', 'large']
              .map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v)}
                  className={`px-3 py-2 rounded-xl ${
                    amount === v
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100'
                  }`}
                >
                  {v === 'small' && '소량'}
                  {v === 'normal' && '보통'}
                  {v === 'large' && '많음'}
                </button>
              ))}
          </div>
        </div>

        <div className="mb-3">
          <div className="font-bold text-sm mb-2">
            건강 상태
          </div>

          <div className="flex flex-wrap gap-2">
            {symptomList.map(symptom => (
              <button
                key={symptom}
                type="button"
                onClick={() =>
                  toggleSymptom(symptom)
                }
                className={`px-3 py-2 rounded-full text-xs ${
                  symptoms.includes(symptom)
                    ? 'bg-red-100 text-red-600'
                    : 'bg-slate-100'
                }`}
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={memo}
          onChange={(e) =>
            setMemo(e.target.value)
          }
          placeholder="추가 메모"
          className="w-full border rounded-xl p-3 mb-4"
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-100"
          >
            취소
          </button>

          <button
            onClick={() =>
              onSave({
                foodType,
                amount,
                symptoms,
                memo
              })
            }
            className="flex-1 py-3 rounded-xl bg-orange-500 text-white"
          >
            저장
          </button>
        </div>

      </div>
    </div>
  );
}

export default DietHealthModal;
