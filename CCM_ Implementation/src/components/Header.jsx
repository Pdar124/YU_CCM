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
    latestReport,
    onCatClick
}) {
    return (
        <header className="relative z-50 bg-white/95 backdrop-blur-md px-4 pt-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-3">
                <button className="text-2xl text-slate-700">
                    ☰
                </button>

                <SearchBar />

                <button className="text-xl text-slate-700">
                    ⚙️
                </button>
            </div>

            <div className="flex items-center justify-between mt-2">
                <ModeSelector />

                {user && (
                    <button
                        onClick={onLogout}
                        className="mt-3 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full"
                    >
                        로그아웃
                    </button>
                )}
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