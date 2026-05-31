function SearchBar({ value, onChange }) {
    return (
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-2xl flex-1">
            <span className="text-slate-400">🔍</span>

            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="고양이 이름, 특징 검색"
                className="bg-transparent outline-none text-sm flex-1 text-slate-700 placeholder:text-slate-400"
            />
        </div>
    );
}

export default SearchBar;