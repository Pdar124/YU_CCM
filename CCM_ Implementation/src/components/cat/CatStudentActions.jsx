function CatStudentActions({
  cat,
  onReport,
  onDetailView
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onDetailView(cat)}
        className="py-3 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-bold"
      >
        상세 정보 보기
      </button>

      <button
        type="button"
        onClick={() => onReport(cat)}
        className="py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold"
      >
        제보하기
      </button>
    </div>
  );
}

export default CatStudentActions;
