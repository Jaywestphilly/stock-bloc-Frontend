import { useState, useEffect } from 'react';

export interface SecFiling {
  form_type: string;
  filing_date: string;
  description: string;
  doc_url: string;
}

export interface SecFund {
  fund_name: string;
  manager: string;
  cik: string;
  filings: SecFiling[];
}

export interface SecIntelData {
  updated_at: string;
  funds: SecFund[];
}

export const useSecIntelData = () => {
  const [data, setData] = useState<SecIntelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIntel = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://raw.githubusercontent.com/Jaywestphilly/stock-bloc-backend/main/sec_intel_data.json");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (err: unknown) {
        setError((err as Error)?.message || "Failed to fetch SEC Intel data");
      } finally {
        setLoading(false);
      }
    };
    fetchIntel();
  }, []);

  return { data, loading, error };
};
