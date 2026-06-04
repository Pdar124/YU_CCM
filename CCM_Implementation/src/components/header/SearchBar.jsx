import { Search } from 'lucide-react';

function SearchBar({ value, onChange }) {
    return (
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-2xl flex-1 border border-transparent focus-within:bg-white focus-within:border-emerald-100 focus-within:shadow-sm transition-all">
            <Search
                size={17}
                strokeWidth={2.5}
                className="shrink-0 text-slate-400"
            />

            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="고양이 이름, 특징 검색"
                className="bg-transparent outline-none text-sm flex-1 min-w-0 text-slate-700 placeholder:text-slate-400"
            />
        </div>
    );
}

export default SearchBar;