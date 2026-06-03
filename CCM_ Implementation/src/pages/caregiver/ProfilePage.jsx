import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import {
  doc,
  updateDoc
} from 'firebase/firestore';

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

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-white px-5 py-5">

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() =>
              navigate(-1)
            }
            className="text-2xl"
          >
            ‹
          </button>

          <h1 className="font-black text-lg">
            프로필
          </h1>

          <button>
            ⚙️
          </button>
        </div>

        {/* 프로필 카드 */}

        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm mb-5">

          <div className="flex items-center gap-3">

            <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
              🐱
            </div>

            <div>
              <div className="font-black">
                {user.nickname ||
                  user.studentId}
              </div>

              <div className="text-xs text-slate-500">
                {user.email}
              </div>
            </div>

          </div>
        </div>

        {/* 모드 전환 */}

        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm mb-5">

          <h2 className="font-black mb-2">
            모드 전환
          </h2>

          <p className="text-xs text-slate-500 mb-4">
            모드에 따라 메뉴와 기능이 변경됩니다.
          </p>

          <button
            onClick={
              handleModeSwitch
            }
            className={`w-full p-4 rounded-2xl border flex justify-between items-center ${
              user.activeMode ===
              'caregiver'
                ? 'border-orange-300 bg-orange-50'
                : 'border-emerald-300 bg-emerald-50'
            }`}
          >
            <span>
              {user.role !== 'caregiver'
                ? '기본 보기'
                : user.activeMode ===
                  'caregiver'
                  ? '🟠 돌보미 모드'
                  : '기본 보기'}
            </span>

            <span>
              ⇄
            </span>
          </button>

        </div>

        {/* 담당 고양이 */}

        <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm mb-5">

          <h2 className="font-black mb-3">
            담당 고양이
          </h2>

          {user.caregiverCatIds?.length
            ? (
              user.caregiverCatIds.map(
                (
                  catId
                ) => (
                  <div
                    key={catId}
                    className="py-2 border-b"
                  >
                    🐱 {catId}
                  </div>
                )
              )
            )
            : (
              <div className="text-sm text-slate-400">
                담당 고양이가 없습니다.
              </div>
            )}

        </div>

        {/* 신청 관리 */}

        <button
          onClick={() =>
            navigate(
              '/caregiver/apply'
            )
          }
          className="w-full p-4 rounded-2xl border border-slate-200 text-left mb-3"
        >
          📝 돌보미 신청 관리
        </button>

        <button
          onClick={
            handleLogout
          }
          className="w-full p-4 rounded-2xl border border-red-200 text-red-500"
        >
          로그아웃
        </button>

      </div>
    </div>
  );
}

export default ProfilePage;
