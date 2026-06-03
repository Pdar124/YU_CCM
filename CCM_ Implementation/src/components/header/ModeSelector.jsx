import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ModeSelector({ user, onModeSwitch }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (user?.role === 'admin') {

    return (
      <button
        type="button"
        onClick={() => navigate('/admin')}
        className="mt-3 text-violet-600 bg-violet-50 gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold"
      >
        관리자 모드
      </button>
    );

  }
  const isCaregiver =
    user?.role === 'caregiver';

  if (!isCaregiver) return null;

  const currentMode =
    user?.activeMode === 'caregiver'
      ? 'caregiver'
      : 'default';

  return (
    <div className="relative mt-3 z-[100]">
      <button
        type="button"
        onClick={() => {
          if (isCaregiver) setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${currentMode === 'caregiver'
          ? 'border-orange-200 bg-orange-50 text-orange-700'
          : 'border-slate-200 bg-white text-slate-600'
          }`}
      >
        {currentMode === 'caregiver'
          ? '🟠 돌보미 모드'
          : '기본 보기'}
        <span className="text-xs">⌄</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-lg overflow-hidden z-50">
          <button
            type="button"
            onClick={() => {
              onModeSwitch('student');
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            기본 보기
          </button>

          <button
            type="button"
            onClick={() => {
              onModeSwitch('caregiver');
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 text-left text-sm font-semibold text-orange-700 hover:bg-orange-50"
          >
            🟠 돌보미 모드
          </button>
        </div>
      )}
    </div>
  );
}

export default ModeSelector;
