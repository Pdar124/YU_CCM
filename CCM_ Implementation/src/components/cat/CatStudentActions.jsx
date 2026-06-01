function CatStudentActions({
  cat,
  onReport
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onReport(cat)}
        className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white font-bold"
      >
        제보하기
      </button>
    </div>
  );
}

export default CatStudentActions;