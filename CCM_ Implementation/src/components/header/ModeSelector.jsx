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

  const currentMode =
    user?.activeMode === 'caregiver'
      ? 'caregiver'
      : 'student';

  return (
    <div className="relative mt-3 z-[100]">
      <button
        type="button"
        onClick={() => {
          if (isCaregiver) setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${currentMode === 'caregiver'
          ? 'border-orange-200 bg-orange-50 text-orange-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
      >
        {currentMode === 'caregiver'
          ? '🟠 Caregiver 모드'
          : '🐱 Student 모드'}
        {isCaregiver && <span className="text-xs">⌄</span>}
      </button>

      {isOpen && isCaregiver && (
        <div className="absolute top-full left-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-lg overflow-hidden z-50">
          <button
            type="button"
            onClick={() => {
              onModeSwitch('student');
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 text-left text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            🐱 Student 모드
          </button>

          <button
            type="button"
            onClick={() => {
              onModeSwitch('caregiver');
              setIsOpen(false);
            }}
            className="w-full px-4 py-3 text-left text-sm font-semibold text-orange-700 hover:bg-orange-50"
          >
            🟠 Caregiver 모드
          </button>
        </div>
      )}
    </div>
  );
}

export default ModeSelector;