import { useState } from 'react';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

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

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen p-6">

        <h1 className="text-2xl font-bold mb-8">
          약관 동의
        </h1>

        <div className="space-y-4">

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) =>
                setTermsAccepted(
                  e.target.checked
                )
              }
            />
            이용약관 동의 (필수)
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) =>
                setPrivacyAccepted(
                  e.target.checked
                )
              }
            />
            개인정보 처리방침 동의 (필수)
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={marketingAccepted}
              onChange={(e) =>
                setMarketingAccepted(
                  e.target.checked
                )
              }
            />
            마케팅 정보 수신 동의 (선택)
          </label>

          <button
            onClick={handleNext}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold mt-6"
          >
            가입 완료
          </button>

        </div>
      </div>
    </div>
  );
}

export default SignupTermsPage;