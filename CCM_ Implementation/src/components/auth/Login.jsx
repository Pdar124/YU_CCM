// src/components/auth/Login.jsx
import { useState } from 'react';
import { auth } from '../../config/firebase.js';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Login({ onLoginSuccess, onGuestLogin }) {
  const [studentId, setStudentId] = useState(''); // 💡 이메일 대신 학번 상태 사용
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  // 💡 고정으로 사용할 학교 이메일 도메인
  const SCHOOL_DOMAIN = '@yu.ac.kr';

  // [경로 A] 기존 회원 로그인 처리
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!studentId.trim() || !password.trim()) {
      alert('학번과 비밀번호를 입력해주세요!');
      return;
    }

    // 💡 학번 뒤에 도메인을 붙여서 Firebase Auth용 이메일 형식 완성 (예: 20261234@yu.ac.kr)
    const emailFormat = `${studentId.trim()}${SCHOOL_DOMAIN}`;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailFormat, password);
      const user = userCredential.user;

      console.log("로그인 성공:", studentId);
      // App.jsx에는 깔끔하게 도메인을 뗀 '학번'만 넘겨서 화면에 띄우기 좋게 합니다.
      onLoginSuccess({ id: studentId, role: 'member', uid: user.uid });
    } catch (error) {
      console.error("로그인 에러:", error.code);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        alert('등록되지 않은 학번이거나 비밀번호가 일치하지 않습니다.');
      } else {
        alert('로그인 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-slate-200">

        {/* 서비스 로고 및 타이틀 */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🐾</div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Campus Cat Mate</h1>
          <p className="text-sm text-slate-500 mt-1">
            우리 캠퍼스 고양이들을 함께 돌봐요
          </p>
        </div>

        {/* 1.1 인증 정보 입력 영역 */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">

          {/* 학번 입력란 (인풋 뒤에 학교 도메인을 시각적으로 표시해 주면 훨씬 친절합니다!) */}
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500">
            <span className="pl-3 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="학번 입력 (예: 20261234)"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full pl-2 pr-2 py-3 bg-transparent text-sm focus:outline-none"
              required
            />
            <span className="pr-3 text-slate-400 text-xs font-semibold select-none">
              {SCHOOL_DOMAIN}
            </span>
          </div>

          {/* 비밀번호 입력란 */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호 입력 (6자리 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 accent-emerald-600"
              />
              로그인 상태 유지
            </label>

            <button
              type="button"
              onClick={() => alert('학과 사무실이나 관리자에게 문의해 주세요.')}
              className="hover:underline"
            >
              비밀번호 찾기
            </button>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-sm"
          >
            로그인
          </button>
        </form>

        <div className="my-6 border-t border-slate-100 relative">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-slate-400">또는</span>
        </div>

        <button
          type="button"
          onClick={() => {
            onGuestLogin();
            navigate('/');
          }}
          className="w-full border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 p-4 rounded-xl cursor-pointer transition text-left group"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              로그인 없이 이용
            </span>
            <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform text-sm">➔</span>
          </div>
          <h3 className="text-sm font-bold text-slate-700">조회 전용 모드로 시작</h3>
          <p className="text-xs text-slate-500 mt-0.5">지도 조회 및 고양이의 기본 정보 확인만 가능합니다.</p>
        </button>

        <div className="text-center mt-8 text-xs text-slate-500">
          아직 계정이 없으신가요?{' '}
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="text-emerald-600 font-bold hover:underline"
          >
            회원가입 &gt;
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;
