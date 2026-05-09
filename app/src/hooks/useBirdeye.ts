import { useState, useEffect, useCallback } from 'react';

const BIRDEYE_API_BASE = 'https://public-api.birdeye.so';
const SOL_MINT = 'So11111111111111111111111111111111111111112';

interface PriceData {
  solPrice: number | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useBirdeye(): PriceData & { refetch: () => void } {
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrice = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use Birdeye public API (no key required for basic price)
      const res = await fetch(
        `${BIRDEYE_API_BASE}/defi/price?address=${SOL_MINT}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!res.ok) {
        // Fallback: use CoinGecko free API
        const cgRes = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
        );
        if (cgRes.ok) {
          const cgData = await cgRes.json();
          setSolPrice(cgData.solana?.usd || null);
          setLastUpdated(new Date());
          return;
        }
        throw new Error('Failed to fetch price');
      }

      const data = await res.json();
      if (data?.data?.value) {
        setSolPrice(data.data.value);
        setLastUpdated(new Date());
      }
    } catch (err: any) {
      // Last resort fallback — hardcode a demo price
      setError(err.message);
      // Try coingecko as fallback in catch
      try {
        const cgRes = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
        );
        if (cgRes.ok) {
          const cgData = await cgRes.json();
          setSolPrice(cgData.solana?.usd || null);
          setLastUpdated(new Date());
          setError(null);
        }
      } catch {
        // silent fail
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [fetchPrice]);

  return { solPrice, loading, error, lastUpdated, refetch: fetchPrice };
}
