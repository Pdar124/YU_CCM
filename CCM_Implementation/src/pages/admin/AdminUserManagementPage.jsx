import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

function AdminUserManagementPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    return () => unsub();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role,
        activeMode: role === 'caregiver' ? 'student' : 'student'
      });

      alert('사용자 권한이 변경되었습니다.');
    } catch (error) {
      console.error(error);
      alert('권한 변경 실패');
    }
  };

  return (
    <div className="min-h-screen bg-violet-50 flex justify-center">
      <div className="w-full max-w-md min-h-screen bg-white px-5 py-5">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="text-3xl"
          >
            ‹
          </button>

          <h1 className="text-lg font-black">
            사용자 관리
          </h1>

          <div className="w-8" />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="bg-violet-50 rounded-2xl p-3 text-center">
            <div className="text-xs text-violet-600 font-bold">전체</div>
            <div className="text-xl font-black">{users.length}</div>
          </div>

          <div className="bg-orange-50 rounded-2xl p-3 text-center">
            <div className="text-xs text-orange-600 font-bold">돌보미</div>
            <div className="text-xl font-black">
              {users.filter((user) => user.role === 'caregiver').length}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3 text-center">
            <div className="text-xs text-slate-600 font-bold">학생</div>
            <div className="text-xl font-black">
              {users.filter((user) => user.role === 'student').length}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="border border-violet-100 rounded-3xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-black">
                    {user.nickname || user.studentId || user.email || '사용자'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {user.email || '이메일 없음'}
                  </div>
                </div>

                <span className="text-xs bg-violet-50 text-violet-600 px-3 py-1 rounded-full font-bold">
                  {user.role || 'student'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleRoleChange(user.id, 'student')}
                  className="py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Student
                </button>

                <button
                  onClick={() => handleRoleChange(user.id, 'caregiver')}
                  className="py-2 rounded-xl bg-orange-50 text-orange-600 text-xs font-bold"
                >
                  Caregiver
                </button>

                <button
                  onClick={() => handleRoleChange(user.id, 'admin')}
                  className="py-2 rounded-xl bg-violet-50 text-violet-600 text-xs font-bold"
                >
                  Admin
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminUserManagementPage;
