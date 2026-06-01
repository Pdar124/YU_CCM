import { useNavigate } from 'react-router-dom';

import SearchBar from './header/SearchBar';
import ModeSelector from './header/ModeSelector';
import StatusFilterBar from './header/StatusFilterBar';
import CatList from './cat/CatList';
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