// src/hooks/useShelters.js

import { useEffect, useState } from 'react';
import { subscribeShelters } from '../services/shelterService';

export default function useShelters() {
  const [shelters, setShelters] = useState([]);

  useEffect(() => {
    const unsub = subscribeShelters(setShelters);

    return () => unsub();
  }, []);

  return { shelters };
}
