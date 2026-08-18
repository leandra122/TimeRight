import { useCallback, useEffect, useState } from 'react';
import { catalogApi } from '../api/services';
import { getApiError } from '../api/client';
import { isActive } from '../utils/format';

export function useSalons() {
  const [salons, setSalons] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { const { data } = await catalogApi.salons(); setSalons((Array.isArray(data) ? data : []).filter(isActive)); } catch (e) { setError(getApiError(e, 'Não foi possível carregar os salões.')); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  return { salons, loading, error, reload: load };
}
