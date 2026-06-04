import { BarChart3, Clock3, Map, UserCircle } from 'lucide-react';

const navigationItems = [
    { id: 'map', label: '지도', icon: Map },
    { id: 'history', label: '히스토리', icon: Clock3 },
    { id: 'analysis', label: '동선 분석', icon: BarChart3 },
    { id: 'profile', label: '프로필', icon: UserCircle }
];

function BottomNavigation({ activeItem = 'map', onSelect }) {
    return (
        <nav className="absolute bottom-0 left-0 right-0 z-40 border-t border-slate-100 bg-white/95 px-4 pb-3 pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-md">
            <div className="grid grid-cols-4">
                {navigationItems.map(({ id, label, icon: Icon }) => {
                    const isActive = activeItem === id;

                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => onSelect?.(id)}
                            className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-bold transition ${
                                isActive
                                    ? 'text-emerald-700'
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <span
                                className={`flex h-8 w-10 items-center justify-center rounded-full ${
                                    isActive
                                        ? 'bg-emerald-50'
                                        : 'bg-transparent'
                                }`}
                            >
                                <Icon size={20} strokeWidth={2.4} />
                            </span>
                            <span>{label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

export default BottomNavigation;
