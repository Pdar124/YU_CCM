function BottomNavigation() {
    return (
        <nav className="absolute bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-6 py-2 flex justify-between text-xs">
            <button className="text-emerald-600 font-bold flex flex-col items-center gap-1">
                🗺️
                <span>지도</span>
            </button>

            <button className="text-slate-400 flex flex-col items-center gap-1">
                🕘
                <span>히스토리</span>
            </button>

            <button className="text-slate-400 flex flex-col items-center gap-1">
                📈
                <span>동선 분석</span>
            </button>

            <button className="text-slate-400 flex flex-col items-center gap-1">
                ⋯
                <span>더보기</span>
            </button>
        </nav>
    );
}

export default BottomNavigation;