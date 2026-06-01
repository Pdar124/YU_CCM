import React, { useState } from 'react';
import { auth, db } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Signup({ onSignupSuccess }) {
    const navigate = useNavigate();

    const [signupType, setSignupType] = useState('student');
    const [studentId, setStudentId] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordCheck, setPasswordCheck] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordCheck, setShowPasswordCheck] = useState(false);

    const SCHOOL_DOMAIN = '@yu.ac.kr';

    const validatePassword = (value) => {
        const regex =
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/;

        return regex.test(value);
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        const accountId = signupType === 'student' ? studentId.trim() : phone.trim();

        if (!accountId || !password || !passwordCheck) {
            alert('모든 정보를 입력해 주세요.');
            return;
        }

        if (!/^\d+$/.test(accountId)) {
            alert('학번 또는 전화번호는 숫자만 입력할 수 있습니다.');
            return;
        }

        if (!validatePassword(password)) {
            alert('비밀번호는 8~16자 영문/숫자/특수문자 조합이어야 합니다.');
            return;
        }

        if (password !== passwordCheck) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const emailFormat = `${accountId}${SCHOOL_DOMAIN}`;

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                emailFormat,
                password
            );

            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                studentId: signupType === 'student' ? accountId : '',
                phone: signupType === 'phone' ? accountId : '',
                email: emailFormat,
                nickname: accountId,
                department: '',
                role: 'student',
                activeMode: 'student',
                signupType,
                termsAccepted: false,
                privacyAccepted: false,
                marketingAccepted: false,
                createdAt: serverTimestamp()
            });

            localStorage.setItem('signup_uid', user.uid);
            localStorage.setItem('signup_accountId', accountId);

            navigate('/signup/profile');
        } catch (error) {
            console.error('회원가입 오류:', error);

            if (error.code === 'auth/email-already-in-use') {
                alert('이미 가입된 계정입니다.');
            } else {
                alert('회원가입에 실패했습니다.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex justify-center">
            <div className="w-full max-w-md min-h-screen bg-white px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-3xl text-slate-700"
                    >
                        ‹
                    </button>

                    <h1 className="text-lg font-black text-slate-900">회원가입</h1>

                    <div className="w-8" />
                </div>

                <div className="flex items-center justify-between mb-10">
                    {[
                        ['1', '계정 정보'],
                        ['2', '프로필 정보'],
                        ['3', '약관 동의'],
                        ['4', '가입 완료']
                    ].map(([num, label], index) => (
                        <div key={num} className="flex-1 flex flex-col items-center relative">
                            {index !== 0 && (
                                <div className="absolute top-4 right-1/2 w-full border-t border-slate-200 -z-0" />
                            )}

                            <div
                                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${num === '1'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-300 text-white'
                                    }`}
                            >
                                {num}
                            </div>

                            <span
                                className={`mt-2 text-xs font-semibold ${num === '1' ? 'text-emerald-600' : 'text-slate-500'
                                    }`}
                            >
                                {label}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="text-center mb-8">
                    <div className="text-5xl font-black text-emerald-600">CCM</div>
                    <div className="text-xs font-bold tracking-widest text-emerald-600">
                        CAMPUS CAT MATE
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-6">
                        CCM에 오신 것을 환영해요!
                    </h2>
                    <p className="text-sm text-slate-500 mt-2">
                        계정 정보를 입력하고 회원가입을 시작해 주세요.
                    </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-3">
                            아이디 선택
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setSignupType('student')}
                                className={`p-4 rounded-2xl border flex items-center justify-center gap-2 font-bold ${signupType === 'student'
                                    ? 'border-emerald-400 bg-emerald-50 text-slate-900'
                                    : 'border-slate-200 bg-white text-slate-600'
                                    }`}
                            >
                                <span>{signupType === 'student' ? '🟢' : '⚪'}</span>
                                🎓 학번으로 가입
                            </button>

                            <button
                                type="button"
                                onClick={() => setSignupType('phone')}
                                className={`p-4 rounded-2xl border flex items-center justify-center gap-2 font-bold ${signupType === 'phone'
                                    ? 'border-emerald-400 bg-emerald-50 text-slate-900'
                                    : 'border-slate-200 bg-white text-slate-600'
                                    }`}
                            >
                                <span>{signupType === 'phone' ? '🟢' : '⚪'}</span>
                                📱 전화번호로 가입
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                            {signupType === 'student' ? '학번' : '전화번호'}
                        </label>

                        <input
                            type="text"
                            value={signupType === 'student' ? studentId : phone}
                            onChange={(e) =>
                                signupType === 'student'
                                    ? setStudentId(e.target.value)
                                    : setPhone(e.target.value)
                            }
                            placeholder={
                                signupType === 'student'
                                    ? '학번을 입력하세요'
                                    : '전화번호를 입력하세요'
                            }
                            className="w-full px-4 py-4 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />

                        <p className="text-xs text-slate-400 mt-2">
                            숫자만 입력 가능 {signupType === 'student' && '(예: 20241234)'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                            비밀번호
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호를 입력하세요"
                                className="w-full px-4 py-4 pr-12 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                            >
                                👁
                            </button>
                        </div>

                        <p className="text-xs text-slate-400 mt-2">
                            8~16자, 영문/숫자/특수문자 조합
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">
                            비밀번호 확인
                        </label>

                        <div className="relative">
                            <input
                                type={showPasswordCheck ? 'text' : 'password'}
                                value={passwordCheck}
                                onChange={(e) => setPasswordCheck(e.target.value)}
                                placeholder="비밀번호를 다시 입력하세요"
                                className="w-full px-4 py-4 pr-12 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPasswordCheck(!showPasswordCheck)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                            >
                                👁
                            </button>
                        </div>

                        <p className="text-xs text-slate-400 mt-2">
                            비밀번호를 한 번 더 입력해 주세요.
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg shadow-emerald-100"
                    >
                        다음
                    </button>
                </form>

                <div className="mt-8 pt-5 border-t border-slate-100 text-center text-sm text-slate-500">
                    이미 계정이 있으신가요?{' '}
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-emerald-600 font-bold"
                    >
                        로그인
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Signup;