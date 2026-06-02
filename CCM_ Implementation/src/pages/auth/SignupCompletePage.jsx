import { useNavigate } from 'react-router-dom';

function SignupCompletePage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    localStorage.removeItem('signup_uid');
    localStorage.removeItem('signup_accountId');

    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-white flex flex-col items-center justify-center px-6">

        <div className="text-6xl mb-6">
          🐾
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-4">
          회원가입 완료!
        </h1>

        <p className="text-center text-slate-500 leading-relaxed">
          Campus Cat Mate의
          <br />
          새로운 메이트가 되신 것을 환영합니다.
        </p>

        <button
          onClick={handleLogin}
          className="mt-10 w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl"
        >
          로그인 하러 가기
        </button>

      </div>
    </div>
  );
}

export default SignupCompletePage;