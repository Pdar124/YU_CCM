import React, { useState, useEffect } from 'react';

function WikiEditModal({
  isOpen,
  cat,
  onClose,
  onSave
}) {
  const [origin, setOrigin] = useState('');
  const [feature, setFeature] = useState('');
  const [healthStatus, setHealthStatus] =
    useState('');
  const [territory, setTerritory] =
    useState('');

  useEffect(() => {
    if (!cat) return;

    setOrigin(cat.origin || '');
    setFeature(cat.feature || '');
    setHealthStatus(
      cat.healthStatus || ''
    );
    setTerritory(cat.territory || '');
  }, [cat]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 w-full max-w-md">

        <h2 className="font-black text-lg mb-4">
          ✏️ 위키 편집
        </h2>

        <input
          value={origin}
          onChange={(e) =>
            setOrigin(e.target.value)
          }
          placeholder="이름 유래"
          className="w-full border rounded-xl p-3 mb-3"
        />

        <textarea
          value={feature}
          onChange={(e) =>
            setFeature(e.target.value)
          }
          placeholder="특징"
          className="w-full border rounded-xl p-3 mb-3"
        />

        <textarea
          value={healthStatus}
          onChange={(e) =>
            setHealthStatus(e.target.value)
          }
          placeholder="건강 상태"
          className="w-full border rounded-xl p-3 mb-3"
        />

        <input
          value={territory}
          onChange={(e) =>
            setTerritory(e.target.value)
          }
          placeholder="주 활동 영역"
          className="w-full border rounded-xl p-3 mb-4"
        />

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 rounded-xl"
          >
            취소
          </button>

          <button
            onClick={() =>
              onSave({
                origin,
                feature,
                healthStatus,
                territory
              })
            }
            className="flex-1 py-3 bg-orange-500 text-white rounded-xl"
          >
            저장
          </button>
        </div>

      </div>
    </div>
  );
}

export default WikiEditModal;