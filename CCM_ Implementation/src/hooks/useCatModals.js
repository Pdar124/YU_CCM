import { useState } from 'react';

function useCatModals() {
  const [wikiModalOpen, setWikiModalOpen] = useState(false);
  const [wikiTargetCat, setWikiTargetCat] = useState(null);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyTargetCat, setHistoryTargetCat] = useState(null);

  const openWikiModal = (cat) => {
    setWikiTargetCat(cat);
    setWikiModalOpen(true);
  };

  const closeWikiModal = () => {
    setWikiModalOpen(false);
    setWikiTargetCat(null);
  };

  const openHistoryModal = (cat) => {
    setHistoryTargetCat(cat);
    setHistoryModalOpen(true);
  };

  const closeHistoryModal = () => {
    setHistoryModalOpen(false);
    setHistoryTargetCat(null);
  };

  return {
    wikiModalOpen,
    wikiTargetCat,
    openWikiModal,
    closeWikiModal,

    historyModalOpen,
    historyTargetCat,
    openHistoryModal,
    closeHistoryModal
  };
}

export default useCatModals;