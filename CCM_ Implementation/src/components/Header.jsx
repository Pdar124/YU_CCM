import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

import SearchBar from './header/SearchBar';
import ModeSelector from './header/ModeSelector';
import StatusFilterBar from './header/StatusFilterBar';
import CatList from './cat/CatList';
import useCaregiverRequests from '../hooks/useCaregiverRequests';
import { getTimeAgo } from '../utils/time';

function Header({
    user,
    setUser,
    onLogout,
    weather,
    weatherLoading,
    isRain,
    cats,
    selectedCatId,
    searchKeyword,
    onSearchChange,
    latestReport,
    onCatClick,
    caregiverCats,
    latestDietLog
}) {
    const navigate = useNavigate();
    const { requests } =
        useCaregiverRequests(user?.uid);
    const latestRequest =
        requests.sort((a, b) =>
            (b.createdAt?.seconds || 0) -
            (a.createdAt?.seconds || 0)
        )[0];
    const canUseCaregiverMode =
        user?.role === 'caregiver' &&
        user?.caregiverCatIds?.length > 0;

    const handleModeSwitch = async (nextMode) => {
        if (!canUseCaregiverMode) {
            alert('돌보미 승인 후 사용할 수 있습니다.');
            return;
        }

        try {
            await updateDoc(doc(db, 'users', user.uid), {
                activeMode: nextMode
            });

            setUser({
                ...user,
                activeMode: nextMode
            });
        } catch (error) {
            console.error('모드 전환 실패:', error);
            alert('모드 전환 중 오류가 발생했습니다.');
        }
    };

    return (
        <header className="relative z-40 bg-white/95 backdrop-blur-md px-4 pt-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-3">
                <button className="text-2xl text-slate-700">
                    ☰
                </button>

                <SearchBar
                    value={searchKeyword}
                    onChange={onSearchChange}
                />

                <button className="text-xl text-slate-700">
                    ⚙️
                </button>
            </div>

            <div className="flex items-center justify-between mt-2">
                <ModeSelector
                    user={user}
                    onModeSwitch={handleModeSwitch}
                />

                <div className="flex items-center gap-2">
                    {user?.role === 'student' && (
                        <button
                            onClick={() => navigate('/caregiver/apply')}
                            className="mt-3 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full font-bold"
                        >
                            돌보미 신청
                        </button>
                    )}

                    {user?.role === 'caregiver' && (
                        <span className="mt-3 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full font-bold">
                            돌보미 인증 완료
                        </span>
                    )}
                    {latestRequest && (
                        <div className="mt-3 text-xs font-bold">
                            {latestRequest.status === 'pending' && (
                                <span className="px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700">
                                    승인 대기 중
                                </span>
                            )}

                            {latestRequest.status === 'reviewing' && (
                                <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">
                                    검토 중
                                </span>
                            )}

                            {latestRequest.status === 'approved' && (
                                <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700">
                                    승인 완료
                                </span>
                            )}

                            {latestRequest.status === 'rejected' && (
                                <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-700">
                                    반려됨
                                </span>
                            )}
                        </div>
                    )}
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => navigate('/admin')}
                            className="mt-3 text-xs text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full font-bold"
                        >
                            관리자
                        </button>
                    )}

                    {user && (
                        <button
                            onClick={onLogout}
                            className="mt-3 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full"
                        >
                            로그아웃
                        </button>
                    )}
                </div>
            </div>

            <CatList
                cats={cats}
                onCatClick={onCatClick}
                selectedCatId={selectedCatId}
                user={user}
            />

            {user?.activeMode === 'caregiver' &&
                latestDietLog && (
                    <div className="mt-2 px-4">
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm flex items-center gap-2">
                            ⚠️
                            <span>
                                {latestDietLog.catName}
                                {' '}
                                {getTimeAgo(
                                    latestDietLog.fedAt
                                )}
                                {' '}
                                급여 기록이 있어요.
                            </span>
                        </div>
                    </div>
                )}



            <StatusFilterBar
                weather={weather}
                weatherLoading={weatherLoading}
                isRain={isRain}
                latestReport={latestReport}
                activeMode={user?.activeMode}
            />
        </header>
    );
}

export default Header;