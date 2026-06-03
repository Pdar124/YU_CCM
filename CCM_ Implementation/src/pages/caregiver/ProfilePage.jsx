import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import {
  doc,
  updateDoc
} from 'firebase/firestore';
import {
  ArrowLeft,
  Cat,
  FileText,
  LogOut,
  Repeat2,
  Settings,
  ShieldCheck,
  UserRound
} from 'lucide-react';

function ProfilePage({
  user,
  setUser
}) {
  const navigate = useNavigate();

  const handleModeSwitch =
    async () => {
      if (user.role !== 'caregiver') {
        alert('돌보미 승인 후 사용할 수 있습니다.');
        return;
      }

      try {
        const nextMode =
          user.activeMode ===
          'caregiver'
            ? 'student'
            : 'caregiver';

        await updateDoc(
          doc(
            db,
            'users',
            user.uid
          ),
          {
            activeMode:
              nextMode
          }
        );

        setUser({
          ...user,
          activeMode:
            nextMode
        });

      } catch (error) {
        console.error(error);
      }
    };

  const handleLogout =
    async () => {
      await signOut(auth);
      setUser(null);
      navigate('/login');
    };

  const isCaregiver =
    user.role === 'caregiver';

  const isCaregiverMode =
    user.activeMode === 'caregiver';

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-slate-50 px-5 py-6">

        <div className="flex items-center justify-between mb-7">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50"
            aria-label="뒤로가기"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>

          <h1 className="font-black text-lg text-slate-900">
            프로필
          </h1>

          <button
            type="button"
            className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-500 hover:bg-slate-50"
            aria-label="설정"
          >
            <Settings size={19} strokeWidth={2.5} />
          </button>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm mb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-500 flex items-center justify-center shadow-sm">
              <Cat size={34} strokeWidth={2.4} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-black text-lg text-slate-900 truncate">
                  {user.nickname ||
                    user.studentId}
                </h2>

                {isCaregiver && (
                  <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-orange-50 text-orange-600">
                    돌보미
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mt-1 truncate">
                {user.email}
              </p>

              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                <UserRound size={12} strokeWidth={2.5} />
                {isCaregiverMode ? '돌보미 모드 사용 중' : 'student 모드 사용 중'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm mb-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-black text-slate-900">
                모드 전환
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                모드에 따라 메뉴와 기능이 변경됩니다.
              </p>
            </div>

            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isCaregiverMode
                  ? 'bg-orange-50 text-orange-500'
                  : 'bg-emerald-50 text-emerald-500'
              }`}
            >
              <Repeat2 size={20} strokeWidth={2.5} />
            </div>
          </div>

          <button
            type="button"
            onClick={
              handleModeSwitch
            }
            className={`w-full p-4 rounded-3xl border flex justify-between items-center transition-all ${
              isCaregiverMode
                ? 'border-orange-200 bg-orange-50 text-orange-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            <span className="flex items-center gap-2 font-black text-sm">
              {isCaregiverMode ? (
                <ShieldCheck size={18} strokeWidth={2.5} />
              ) : (
                <UserRound size={18} strokeWidth={2.5} />
              )}

              {user.role !== 'caregiver'
                ? 'student 모드'
                : isCaregiverMode
                  ? 'caregiver 모드'
                  : 'student 모드'}
            </span>

            <Repeat2 size={18} strokeWidth={2.5} />
          </button>

          {!isCaregiver && (
            <p className="text-[11px] text-slate-400 mt-3">
              돌보미 승인을 받으면 모드를 전환할 수 있어요.
            </p>
          )}
        </div>

        <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-slate-900">
              담당 고양이
            </h2>

            <span className="text-[11px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
              {user.caregiverCatIds?.length || 0}마리
            </span>
          </div>

          {user.caregiverCatIds?.length
            ? (
              <div className="space-y-2">
                {user.caregiverCatIds.map(
                  (
                    catId
                  ) => (
                    <div
                      key={catId}
                      className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3"
                    >
                      <div className="w-9 h-9 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                        <Cat size={19} strokeWidth={2.5} />
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-700 truncate">
                          {catId}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          담당 고양이 ID
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )
            : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                <Cat
                  size={28}
                  strokeWidth={2.5}
                  className="mx-auto text-slate-300 mb-2"
                />
                <div className="text-sm font-bold text-slate-400">
                  담당 고양이가 없습니다.
                </div>
              </div>
            )}

        </div>

        <button
          type="button"
          onClick={() =>
            navigate(
              '/caregiver/apply'
            )
          }
          className="w-full p-4 rounded-3xl border border-slate-100 bg-white text-left mb-3 shadow-sm flex items-center justify-between hover:bg-slate-50 transition-all"
        >
          <span className="flex items-center gap-3 font-bold text-slate-700">
            <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
              <FileText size={20} strokeWidth={2.5} />
            </span>
            돌보미 신청 관리
          </span>
        </button>

        <button
          type="button"
          onClick={
            handleLogout
          }
          className="w-full p-4 rounded-3xl border border-red-100 bg-red-50 text-red-500 font-black flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
        >
          <LogOut size={18} strokeWidth={2.5} />
          로그아웃
        </button>

      </div>
    </div>
  );
}

export default ProfilePage;