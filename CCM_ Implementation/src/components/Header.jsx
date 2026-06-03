import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

import SearchBar from './header/SearchBar';
import ModeSelector from './header/ModeSelector';
import StatusFilterBar from './header/StatusFilterBar';
import CatList from './cat/CatList';

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
    onCatClick
}) {
    const navigate = useNavigate();
    const isGuest = user?.role === 'guest';
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
        <header className="relative z-40 bg-white/95 backdrop-blur-md px-4 pt-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-3">
                <SearchBar
                    value={searchKeyword}
                    onChange={onSearchChange}
                />

                <button
                    type="button"
                    onClick={() => {
                        if (isGuest) {
                            navigate('/login');
                            return;
                        }

                        onLogout();
                    }}
                    className={`h-8 px-3 rounded-full text-xs font-bold ${isGuest
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 text-white'
                        }`}
                >
                    {isGuest ? '로그인' : '로그아웃'}
                </button>
            </div>
            

            <div className="flex items-center justify-between gap-2">
                <ModeSelector
                    user={user}
                    onModeSwitch={handleModeSwitch}
                />

                <div className="shrink-0 flex items-center gap-2 bg-white mt-4 px-3 py-1 rounded-full border border-slate-100 shadow-sm text-xs">
                    {weatherLoading ? (
                        <span>날씨 불러오는 중...</span>
                    ) : weather ? (
                        <>
                            <img
                                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                                alt={weather.weather[0].description}
                                className="w-5 h-5 object-contain"
                            />

                            <span className="font-semibold text-slate-800">
                                {weather.main.temp.toFixed(1)}°C
                            </span>

                            <span className="text-slate-400">|</span>

                            <span className="text-slate-600">
                                {weather.name === 'Gyeongsan-si'
                                    ? '영남대학교'
                                    : weather.name}
                            </span>

                            {isRain && (
                                <>
                                    <span className="text-slate-400">|</span>

                                    <span className="text-amber-600 font-bold">
                                        비 오는 날 🌧️
                                    </span>
                                </>
                            )}
                        </>
                    ) : (
                        <span>날씨 정보 없음</span>
                    )}
                </div>
                {isGuest && (
                <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-0.5 shadow-sm text-xs text-emerald-700 ">
                    <div>
                        <div className="text-sm font-semibold text-emerald-800">
                            guest 모드
                        </div>
                    </div>
                </div>
            )}
            </div>

            <CatList
                cats={cats}
                onCatClick={onCatClick}
                selectedCatId={selectedCatId}
                user={user}
            />



            {!isGuest && (
                <StatusFilterBar
                    weather={weather}
                    weatherLoading={weatherLoading}
                    isRain={isRain}
                    latestReport={latestReport}
                    activeMode={user?.activeMode}
                />
            )}
        </header>
    );
}

export default Header;
