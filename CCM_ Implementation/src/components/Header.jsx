import { useNavigate } from 'react-router-dom';

import SearchBar from './header/SearchBar';
import ModeSelector from './header/ModeSelector';
import StatusFilterBar from './header/StatusFilterBar';
import CatList from './cat/CatList';
import useCaregiverRequests from '../hooks/useCaregiverRequests';

function Header({
    user,
    onLogout,
    weather,
    weatherLoading,
    isRain,
    cats,
    selectedCatId,
    searchKeyword,
    onSearchChange,
    latestReport,
    onCatClick
}) {
    const navigate = useNavigate();
    const { requests } =
        useCaregiverRequests(user?.uid);
    const latestRequest =
        requests.sort((a, b) =>
            (b.createdAt?.seconds || 0) -
            (a.createdAt?.seconds || 0)
        )[0];

    return (
        <header className="relative z-50 bg-white/95 backdrop-blur-md px-4 pt-3 pb-2 border-b border-slate-100">
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
                <ModeSelector />

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
            />


            <StatusFilterBar
                weather={weather}
                weatherLoading={weatherLoading}
                isRain={isRain}
                latestReport={latestReport}
            />
        </header>
    );
}

export default Header;