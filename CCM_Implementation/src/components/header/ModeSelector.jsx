import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown, ShieldCheck, Sparkles, UserRound } from 'lucide-react';

function ModeSelector({ user, onModeSwitch }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (user?.role === 'admin') {

    return (
      <button
        type="button"
        onClick={() => navigate('/admin')}
        className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-full border border-violet-100 bg-violet-50 text-violet-700 text-sm font-bold shadow-sm hover:bg-violet-100 transition-all"
      >
        <ShieldCheck size={15} strokeWidth={2.5} />
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
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-bold shadow-sm transition-all ${currentMode === 'caregiver'
          ? 'border-orange-100 bg-orange-50 text-orange-700 hover:bg-orange-100'
          : 'border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          }`}
        aria-expanded={isOpen}
      >
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center ${currentMode === 'caregiver'
            ? 'bg-white text-orange-500'
            : 'bg-white text-emerald-500'
            }`}
        >
          {currentMode === 'caregiver' ? (
            <ShieldCheck size={14} strokeWidth={2.5} />
          ) : (
            <UserRound size={14} strokeWidth={2.5} />
          )}
        </span>

        {currentMode === 'caregiver'
          ? 'caregiver 모드'
          : 'student 모드'}

        <ChevronDown
          size={14}
          strokeWidth={2.5}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden z-50 p-1.5">
          <button
            type="button"
            onClick={() => {
              onModeSwitch('student');
              setIsOpen(false);
            }}
            className={`w-full px-3 py-3 rounded-2xl text-sm font-bold flex items-center justify-between transition-all ${currentMode === 'default'
              ? 'bg-emerald-50 text-emerald-700'
              : 'text-slate-600 hover:bg-slate-50'
              }`}
          >
            <span className="flex items-center gap-2">
              <UserRound size={15} strokeWidth={2.5} />
              student 모드
            </span>
            {currentMode === 'default' && (
              <Check size={15} strokeWidth={3} />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onModeSwitch('caregiver');
              setIsOpen(false);
            }}
            className={`w-full px-3 py-3 rounded-2xl text-sm font-bold flex items-center justify-between transition-all ${currentMode === 'caregiver'
              ? 'bg-orange-50 text-orange-700'
              : 'text-slate-600 hover:bg-slate-50'
              }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles size={15} strokeWidth={2.5} />
              돌보미 모드
            </span>
            {currentMode === 'caregiver' && (
              <Check size={15} strokeWidth={3} />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default ModeSelector;
