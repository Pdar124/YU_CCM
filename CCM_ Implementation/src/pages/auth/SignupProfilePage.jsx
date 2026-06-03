import { useState } from 'react';
import { db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Phone, UserRound } from 'lucide-react';

function SignupProfilePage() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');

  const handleNext = async () => {
    const uid =
      localStorage.getItem('signup_uid');

    if (!uid) {
      alert('회원가입 정보가 없습니다.');
      navigate('/signup');
      return;
    }

    if (!nickname || !department || !phone) {
      alert('모든 정보를 입력해주세요.');
      return;
    }

    try {
      await updateDoc(
        doc(db, 'users', uid),
        {
          nickname,
          department,
          phone
        }
      );

      navigate('/signup/terms');
    } catch (error) {
      console.error(error);
      alert('프로필 저장 실패');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-slate-50 px-6 py-8 flex flex-col">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 border border-emerald-100">
            2단계
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            프로필 설정
          </div>

          <h1 className="mt-5 text-3xl font-black text-slate-900 leading-tight">
            사용할 프로필을<br />
            입력해 주세요
          </h1>

          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            커뮤니티에서 사용할 닉네임과 기본 정보를 입력하면
            제보와 활동 기록에 활용돼요.
          </p>
        </div>

        <div className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-500">
              닉네임
            </span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 focus-within:border-emerald-200 focus-within:bg-white focus-within:shadow-sm transition-all">
              <UserRound
                size={18}
                strokeWidth={2.5}
                className="shrink-0 text-emerald-500"
              />
              <input
                type="text"
                placeholder="예: 다래"
                value={nickname}
                onChange={(e) =>
                  setNickname(e.target.value)
                }
                className="min-w-0 flex-1 bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-500">
              학과
            </span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 focus-within:border-emerald-200 focus-within:bg-white focus-within:shadow-sm transition-all">
              <Building2
                size={18}
                strokeWidth={2.5}
                className="shrink-0 text-indigo-500"
              />
              <input
                type="text"
                placeholder="예: 컴퓨터공학과"
                value={department}
                onChange={(e) =>
                  setDepartment(e.target.value)
                }
                className="min-w-0 flex-1 bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold text-slate-500">
              전화번호
            </span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3.5 focus-within:border-emerald-200 focus-within:bg-white focus-within:shadow-sm transition-all">
              <Phone
                size={18}
                strokeWidth={2.5}
                className="shrink-0 text-orange-500"
              />
              <input
                type="tel"
                placeholder="예: 010-1234-5678"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                className="min-w-0 flex-1 bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </label>
        </div>

        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={handleNext}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
          >
            다음으로
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>

          <p className="mt-4 text-center text-[11px] text-slate-400">
            입력한 정보는 서비스 이용을 위해서만 사용돼요.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupProfilePage;
