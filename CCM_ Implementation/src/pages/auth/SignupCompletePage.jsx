import { useNavigate } from 'react-router-dom';
import { ArrowRight, Cat, CheckCircle2 } from 'lucide-react';

function SignupCompletePage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.removeItem('signup_uid');
    localStorage.removeItem('signup_accountId');

    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-slate-50 px-6 py-8 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-[2rem] bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
              <Cat size={52} strokeWidth={2.3} />
            </div>

            <div className="absolute -right-2 -bottom-2 w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
              <CheckCircle2 size={22} strokeWidth={3} />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 border border-emerald-100 mb-5">
            가입 완료
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            Welcome
          </div>

          <h1 className="text-3xl font-black text-slate-900 leading-tight mb-4">
            회원가입이<br />
            완료되었어요!
          </h1>

          <p className="text-sm text-slate-500 leading-relaxed">
            Campus Cat Mate의 새로운 메이트가 되신 것을 환영합니다.
            <br />
            이제 캠퍼스 고양이 제보를 함께 시작해 볼까요?
          </p>
        </div>

        <div className="pt-8">
          <button
            type="button"
            onClick={handleLogin}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all"
          >
            로그인 하러 가기
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignupCompletePage;