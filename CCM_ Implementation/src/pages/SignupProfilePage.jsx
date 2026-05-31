import { useState } from 'react';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

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
      <div className="w-full max-w-md bg-white min-h-screen p-6">

        <h1 className="text-2xl font-bold mb-8">
          프로필 정보
        </h1>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) =>
              setNickname(e.target.value)
            }
            className="w-full p-4 border rounded-xl"
          />

          <input
            type="text"
            placeholder="학과"
            value={department}
            onChange={(e) =>
              setDepartment(e.target.value)
            }
            className="w-full p-4 border rounded-xl"
          />

          <input
            type="text"
            placeholder="전화번호"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            className="w-full p-4 border rounded-xl"
          />

          <button
            onClick={handleNext}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold"
          >
            다음
          </button>

        </div>
      </div>
    </div>
  );
}

export default SignupProfilePage;