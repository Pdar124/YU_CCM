// src/hooks/useCats.js

import { useEffect, useState } from 'react';
import { subscribeCats } from '../services/catService';

export default function useCats() {
  const [cats, setCats] = useState([]);

  useEffect(() => {
    const unsub = subscribeCats(setCats);

    return () => unsub();
  }, []);

  return { cats };
}
