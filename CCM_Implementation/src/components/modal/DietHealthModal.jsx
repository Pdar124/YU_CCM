import { useState } from 'react';
import {
  Cat,
  Check,
  HeartPulse,
  MessageSquareText,
  Save,
  Utensils,
  X
} from 'lucide-react';

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

  const amountOptions = [
    { value: 'small', label: '소량' },
    { value: 'normal', label: '보통' },
    { value: 'large', label: '많음' }
  ];

  const toggleSymptom = (symptom) => {
    setSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] p-5 w-full max-w-md shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Utensils size={22} strokeWidth={2.5} />
            </div>

            <div>
              <h2 className="font-black text-lg text-slate-900">
                급여 / 건강 기록
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                오늘의 급여와 건강 상태를 남겨주세요.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="급여 건강 기록 닫기"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-slate-50 border border-slate-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-orange-500 flex items-center justify-center shrink-0">
              <Cat size={22} strokeWidth={2.5} />
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400">
                고양이
              </div>
              <div className="text-sm font-black text-slate-800 mt-0.5">
                {cat?.name || '이름 정보 없음'}
              </div>
            </div>
          </div>

          <label className="block">
            <span className="flex items-center gap-1.5 text-xs font-black text-slate-500 mb-1.5">
              <Utensils size={14} strokeWidth={2.5} className="text-orange-500" />
              사료 종류
            </span>

            <input
              value={foodType}
              onChange={(e) =>
                setFoodType(e.target.value)
              }
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none focus:border-orange-200 focus:bg-white focus:shadow-sm transition-all"
              placeholder="예: 캐츠랑"
            />
          </label>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-500 mb-2">
              <Utensils size={14} strokeWidth={2.5} className="text-orange-500" />
              급여량
            </div>

            <div className="grid grid-cols-3 gap-2">
              {amountOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAmount(option.value)}
                  className={`rounded-2xl px-3 py-3 text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                    amount === option.value
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-100'
                      : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  {amount === option.value && (
                    <Check size={14} strokeWidth={3} />
                  )}
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-500 mb-2">
              <HeartPulse size={14} strokeWidth={2.5} className="text-red-500" />
              건강 상태
            </div>

            <div className="flex flex-wrap gap-2">
              {symptomList.map(symptom => {
                const isSelected = symptoms.includes(symptom);

                return (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() =>
                      toggleSymptom(symptom)
                    }
                    className={`px-3 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-red-50 text-red-600 border border-red-100'
                        : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && (
                      <Check size={12} strokeWidth={3} />
                    )}
                    {symptom}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block">
            <span className="flex items-center gap-1.5 text-xs font-black text-slate-500 mb-1.5">
              <MessageSquareText size={14} strokeWidth={2.5} className="text-slate-500" />
              추가 메모
            </span>

            <textarea
              value={memo}
              onChange={(e) =>
                setMemo(e.target.value)
              }
              placeholder="예: 평소보다 사료를 적게 먹었어요."
              className="w-full min-h-24 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none resize-none focus:border-orange-200 focus:bg-white focus:shadow-sm transition-all"
            />
          </label>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-all"
            >
              취소
            </button>

            <button
              type="button"
              onClick={() =>
                onSave({
                  foodType,
                  amount,
                  symptoms,
                  memo
                })
              }
              className="flex-1 py-3 rounded-2xl bg-orange-500 text-white text-sm font-bold shadow-md shadow-orange-100 flex items-center justify-center gap-2 hover:bg-orange-600 transition-all"
            >
              <Save size={16} strokeWidth={2.5} />
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DietHealthModal;
