// src/hooks/useReports.js

import { useEffect, useState } from 'react';
import { subscribeReports } from '../services/reportService';

export default function useReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const unsub = subscribeReports(setReports);

    return () => unsub();
  }, []);

  return { reports };
}
