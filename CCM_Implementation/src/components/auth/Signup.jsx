import { useState } from 'react';
import { auth, db } from '../../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Eye,
    EyeOff,
    GraduationCap,
    LockKeyhole,
    Phone,
    ShieldCheck
} from 'lucide-react';
import signupHeroSrc from '../../assets/ccm_signup_hero.png';

function Signup() {
    const navigate = useNavigate();

    const [signupType, setSignupType] = useState('student');
    const [studentId, setStudentId] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordCheck, setPasswordCheck] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordCheck, setShowPasswordCheck] = useState(false);

    const SCHOOL_DOMAIN = '@yu.ac.kr';

    const getDigitsOnly = (value) =>
        value.replace(/\D/g, '');

    const validatePassword = (value) => {
        const regex =
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/;

        return regex.test(value);
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        const accountId = getDigitsOnly(
            signupType === 'student' ? studentId : phone
        );

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
            localStorage.setItem('signup_type', signupType);

            navigate('/signup/profile');
        } catch (error) {
            console.error('회원가입 오류:', error);

            if (error.code === 'auth/email-already-in-use') {
                alert('이미 가입된 계정입니다. 로그인 화면으로 이동합니다.');
                navigate('/login');
            } else {
                alert('회원가입에 실패했습니다.');
            }
        }
    };

    const steps = [
        ['1', '계정'],
        ['2', '프로필'],
        ['3', '약관'],
        ['4', '완료']
    ];

    const signupOptions = [
        {
            id: 'student',
            label: '학번으로 가입',
            description: '학교 학번을 아이디로 사용해요.',
            icon: GraduationCap
        },
        {
            id: 'phone',
            label: '전화번호로 가입',
            description: '휴대폰 번호를 아이디로 사용해요.',
            icon: Phone
        }
    ];

    return (
        <div className="min-h-screen bg-slate-100 flex justify-center">
            <div className="w-full max-w-md min-h-screen bg-slate-50 py-5 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="w-10 h-10 rounded-full bg-white/90 border border-white shadow-sm flex items-center justify-center text-slate-600 hover:bg-white"
                        aria-label="로그인으로 돌아가기"
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>

                    <h1 className="text-lg font-black text-slate-900">회원가입</h1>

                    <div className="w-10" />
                </div>

                <div className="rounded-[1.75rem] bg-white/80 border border-white shadow-sm px-3 py-3 flex items-center justify-between mb-4">
                    {steps.map(([num, label], index) => (
                        <div key={num} className="flex-1 flex flex-col items-center relative">
                            {index !== 0 && (
                                <div className="absolute top-4 right-1/2 w-full border-t border-emerald-100" />
                            )}

                            <div
                                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-sm ${num === '1'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white border border-slate-200 text-slate-400'
                                    }`}
                            >
                                {num === '1' ? (
                                    <Check size={15} strokeWidth={3} />
                                ) : (
                                    num
                                )}
                            </div>

                            <span
                                className={`mt-2 text-[11px] font-bold ${num === '1' ? 'text-emerald-600' : 'text-slate-400'
                                    }`}
                            >
                                {label}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mb-4 text-center rounded-[2rem] bg-white/80 border border-white shadow-sm px-4 py-5">
                    <img
                        src={signupHeroSrc}
                        alt="Campus Cat Mate 로고"
                        className="mx-auto w-full max-w-[260px] object-contain"
                    />

                    <h2 className="mt-4 text-xl font-black text-slate-900">
                        CCM에 오신 것을 환영해요!
                    </h2>

                    <p className="mt-1.5 text-sm text-slate-500">
                        계정 정보를 입력하고 회원가입을 시작해 주세요.
                    </p>
                </div>

                <form onSubmit={handleSignup} className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-3">
                            가입 방식
                        </label>

                        <div className="grid grid-cols-2 gap-2.5">
                            {signupOptions.map((option) => {
                                const Icon = option.icon;
                                const isSelected = signupType === option.id;

                                return (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setSignupType(option.id)}
                                        className={`relative p-3.5 rounded-3xl border flex flex-col items-start gap-2.5 text-left transition-all ${isSelected
                                            ? 'border-emerald-200 bg-emerald-50 shadow-sm'
                                            : 'border-slate-100 bg-white hover:bg-slate-50'
                                            }`}
                                    >
                                        <div
                                            className={`w-9 h-9 rounded-2xl flex items-center justify-center ${isSelected
                                                ? 'bg-white text-emerald-600'
                                                : 'bg-slate-50 text-slate-400'
                                                }`}
                                        >
                                            <Icon size={20} strokeWidth={2.5} />
                                        </div>

                                        <div>
                                            <div className="text-sm font-black text-slate-800">
                                                {option.label}
                                            </div>
                                            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                                                {option.description}
                                            </p>
                                        </div>

                                        {isSelected && (
                                            <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                                <Check size={14} strokeWidth={3} />
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <label className="block">
                        <span className="mb-2 block text-xs font-bold text-slate-500">
                            {signupType === 'student' ? '학번' : '전화번호'}
                        </span>

                        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 focus-within:border-emerald-200 focus-within:bg-white focus-within:shadow-sm transition-all">
                            {signupType === 'student' ? (
                                <GraduationCap size={18} strokeWidth={2.5} className="shrink-0 text-emerald-500" />
                            ) : (
                                <Phone size={18} strokeWidth={2.5} className="shrink-0 text-emerald-500" />
                            )}

                            <input
                                type="text"
                                inputMode="numeric"
                                value={signupType === 'student' ? studentId : phone}
                                onChange={(e) =>
                                    signupType === 'student'
                                        ? setStudentId(getDigitsOnly(e.target.value))
                                        : setPhone(getDigitsOnly(e.target.value))
                                }
                                placeholder={
                                    signupType === 'student'
                                        ? '학번을 입력하세요'
                                        : '전화번호를 입력하세요'
                                }
                                className="min-w-0 flex-1 bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-400"
                            />
                        </div>

                        <p className="text-xs text-slate-400 mt-2">
                            숫자만 입력 가능 {signupType === 'student' && '(예: 20241234)'}
                        </p>
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-xs font-bold text-slate-500">
                            비밀번호
                        </span>

                        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 focus-within:border-emerald-200 focus-within:bg-white focus-within:shadow-sm transition-all">
                            <LockKeyhole size={18} strokeWidth={2.5} className="shrink-0 text-emerald-500" />

                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호를 입력하세요"
                                className="min-w-0 flex-1 bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-400"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="shrink-0 text-slate-400 hover:text-slate-600"
                                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                            >
                                {showPassword ? (
                                    <EyeOff size={18} strokeWidth={2.5} />
                                ) : (
                                    <Eye size={18} strokeWidth={2.5} />
                                )}
                            </button>
                        </div>

                        <p className="text-xs text-slate-400 mt-2">
                            8~16자, 영문/숫자/특수문자 조합
                        </p>
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-xs font-bold text-slate-500">
                            비밀번호 확인
                        </span>

                        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 focus-within:border-emerald-200 focus-within:bg-white focus-within:shadow-sm transition-all">
                            <ShieldCheck size={18} strokeWidth={2.5} className="shrink-0 text-emerald-500" />

                            <input
                                type={showPasswordCheck ? 'text' : 'password'}
                                value={passwordCheck}
                                onChange={(e) => setPasswordCheck(e.target.value)}
                                placeholder="비밀번호를 다시 입력하세요"
                                className="min-w-0 flex-1 bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-400"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPasswordCheck(!showPasswordCheck)}
                                className="shrink-0 text-slate-400 hover:text-slate-600"
                                aria-label={showPasswordCheck ? '비밀번호 확인 숨기기' : '비밀번호 확인 보기'}
                            >
                                {showPasswordCheck ? (
                                    <EyeOff size={18} strokeWidth={2.5} />
                                ) : (
                                    <Eye size={18} strokeWidth={2.5} />
                                )}
                            </button>
                        </div>

                        <p className="text-xs text-slate-400 mt-2">
                            비밀번호를 한 번 더 입력해 주세요.
                        </p>
                    </label>

                    <button
                        type="submit"
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all"
                    >
                        다음으로
                        <ArrowRight size={18} strokeWidth={2.5} />
                    </button>
                </form>

                <div className="mt-5 pt-4 border-t border-slate-100 text-center text-sm text-slate-500">
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
