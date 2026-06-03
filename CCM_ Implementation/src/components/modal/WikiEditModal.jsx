import { useState } from 'react';
import {
  Activity,
  BookOpenText,
  MapPin,
  Pencil,
  Save,
  Sparkles,
  X
} from 'lucide-react';

function WikiEditForm({
  cat,
  onClose,
  onSave
}) {
  const [origin, setOrigin] = useState(cat.origin || '');
  const [feature, setFeature] = useState(cat.feature || '');
  const [healthStatus, setHealthStatus] =
    useState(cat.healthStatus || '');
  const [territory, setTerritory] =
    useState(cat.territory || '');

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] p-5 w-full max-w-md shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
              <Pencil size={22} strokeWidth={2.5} />
            </div>

            <div>
              <h2 className="font-black text-lg text-slate-900">
                위키 편집
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {cat.name}의 정보를 업데이트해 주세요.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="위키 편집 닫기"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="flex items-center gap-1.5 text-xs font-black text-slate-500 mb-1.5">
              <BookOpenText size={14} strokeWidth={2.5} className="text-orange-500" />
              이름 유래
            </span>

            <input
              value={origin}
              onChange={(e) =>
                setOrigin(e.target.value)
              }
              placeholder="예: 도서관 앞에서 자주 보여서 도리"
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none focus:border-orange-200 focus:bg-white focus:shadow-sm transition-all"
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-1.5 text-xs font-black text-slate-500 mb-1.5">
              <Sparkles size={14} strokeWidth={2.5} className="text-indigo-500" />
              특징
            </span>

            <textarea
              value={feature}
              onChange={(e) =>
                setFeature(e.target.value)
              }
              placeholder="예: 사람을 잘 따르고 꼬리가 짧아요."
              className="w-full min-h-24 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none resize-none focus:border-orange-200 focus:bg-white focus:shadow-sm transition-all"
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-1.5 text-xs font-black text-slate-500 mb-1.5">
              <Activity size={14} strokeWidth={2.5} className="text-red-500" />
              건강 상태
            </span>

            <textarea
              value={healthStatus}
              onChange={(e) =>
                setHealthStatus(e.target.value)
              }
              placeholder="예: 최근 건강 상태 양호, 눈곱 조금 있음"
              className="w-full min-h-24 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none resize-none focus:border-orange-200 focus:bg-white focus:shadow-sm transition-all"
            />
          </label>

          <label className="block">
            <span className="flex items-center gap-1.5 text-xs font-black text-slate-500 mb-1.5">
              <MapPin size={14} strokeWidth={2.5} className="text-emerald-500" />
              주 활동 영역
            </span>

            <input
              value={territory}
              onChange={(e) =>
                setTerritory(e.target.value)
              }
              placeholder="예: 중앙도서관, 학생회관 근처"
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none focus:border-orange-200 focus:bg-white focus:shadow-sm transition-all"
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
                  origin,
                  feature,
                  healthStatus,
                  territory
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

function WikiEditModal({
  isOpen,
  cat,
  onClose,
  onSave
}) {
  if (!isOpen || !cat) return null;

  return (
    <WikiEditForm
      key={cat.id}
      cat={cat}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

export default WikiEditModal;
