import { useState } from 'react';
import { db } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Check, FileText, LockKeyhole } from 'lucide-react';

function SignupTermsPage() {
  const navigate = useNavigate();

  const [termsAccepted, setTermsAccepted] =
    useState(false);

  const [privacyAccepted, setPrivacyAccepted] =
    useState(false);

  const [marketingAccepted, setMarketingAccepted] =
    useState(false);

  const handleNext = async () => {
    const uid =
      localStorage.getItem('signup_uid');

    if (!uid) {
      alert('회원가입 정보가 없습니다.');
      navigate('/signup');
      return;
    }

    if (
      !termsAccepted ||
      !privacyAccepted
    ) {
      alert(
        '필수 약관에 동의해주세요.'
      );
      return;
    }

    try {
      await updateDoc(
        doc(db, 'users', uid),
        {
          termsAccepted,
          privacyAccepted,
          marketingAccepted
        }
      );

      navigate('/signup/complete');
    } catch (error) {
      console.error(error);
      alert('약관 저장 실패');
    }
  };

  const terms = [
    {
      id: 'terms',
      title: '이용약관 동의',
      description: '서비스 이용을 위한 기본 약관이에요.',
      required: true,
      checked: termsAccepted,
      onChange: setTermsAccepted,
      icon: FileText,
      color: 'emerald'
    },
    {
      id: 'privacy',
      title: '개인정보 처리방침 동의',
      description: '계정 관리와 서비스 제공에 필요한 정보예요.',
      required: true,
      checked: privacyAccepted,
      onChange: setPrivacyAccepted,
      icon: LockKeyhole,
      color: 'indigo'
    },
    {
      id: 'marketing',
      title: '마케팅 정보 수신 동의',
      description: '소식과 이벤트 안내를 받을 수 있어요.',
      required: false,
      checked: marketingAccepted,
      onChange: setMarketingAccepted,
      icon: Bell,
      color: 'orange'
    }
  ];

  const requiredAllAccepted =
    termsAccepted && privacyAccepted;

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-slate-50 px-6 py-8 flex flex-col">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 border border-emerald-100">
            3단계
            <span className="w-1 h-1 rounded-full bg-emerald-400" />
            약관 동의
          </div>

          <h1 className="mt-5 text-3xl font-black text-slate-900 leading-tight">
            마지막으로<br />
            약관에 동의해 주세요
          </h1>

          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            필수 약관에 동의하면 회원가입을 완료할 수 있어요.
            선택 항목은 나중에 언제든 변경할 수 있어요.
          </p>
        </div>

        <div className="rounded-[2rem] bg-white border border-slate-100 shadow-sm p-4 space-y-3">
          {terms.map((term) => {
            const Icon = term.icon;

            return (
              <label
                key={term.id}
                className={`flex items-center gap-3 rounded-3xl border p-4 cursor-pointer transition-all ${term.checked
                  ? 'border-emerald-200 bg-emerald-50/70 shadow-sm'
                  : 'border-slate-100 bg-white hover:bg-slate-50'
                  }`}
              >
                <input
                  type="checkbox"
                  checked={term.checked}
                  onChange={(e) =>
                    term.onChange(
                      e.target.checked
                    )
                  }
                  className="sr-only"
                />

                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${term.checked
                    ? 'bg-white text-emerald-600'
                    : term.color === 'indigo'
                      ? 'bg-indigo-50 text-indigo-500'
                      : term.color === 'orange'
                        ? 'bg-orange-50 text-orange-500'
                        : 'bg-emerald-50 text-emerald-500'
                    }`}
                >
                  <Icon size={20} strokeWidth={2.5} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-slate-800">
                      {term.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${term.required
                        ? 'bg-red-50 text-red-500'
                        : 'bg-slate-100 text-slate-400'
                        }`}
                    >
                      {term.required ? '필수' : '선택'}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    {term.description}
                  </p>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${term.checked
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-200 text-transparent'
                    }`}
                >
                  <Check size={14} strokeWidth={3} />
                </div>
              </label>
            );
          })}
        </div>

        <div className="mt-auto pt-8">
          <button
            type="button"
            onClick={handleNext}
            className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${requiredAllAccepted
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100'
              : 'bg-slate-200 text-slate-400'
              }`}
          >
            가입 완료
            <ArrowRight size={18} strokeWidth={2.5} />
          </button>

          <p className="mt-4 text-center text-[11px] text-slate-400">
            필수 약관 동의 후 가입을 완료할 수 있어요.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupTermsPage;
