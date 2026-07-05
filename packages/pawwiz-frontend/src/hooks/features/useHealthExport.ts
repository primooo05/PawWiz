import { useState, useCallback } from 'react';
import { API_BASE } from '../../lib/config.js';
import { supabase } from '../../lib/supabase.js';

function getDateThirtyDaysAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString();
}

function getNow(): string {
  return new Date().toISOString();
}

export interface UseHealthExportReturn {
  isOpen: boolean;
  startDate: string;
  endDate: string;
  notes: string;
  isExporting: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setNotes: (notes: string) => void;
  exportPdf: () => Promise<void>;
}

export function useHealthExport(catId: string): UseHealthExportReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<string>(getDateThirtyDaysAgo);
  const [endDate, setEndDate] = useState<string>(getNow);
  const [notes, setNotes] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = useCallback(() => {
    setIsOpen(true);
    setError(null);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setError(null);
  }, []);

  const handleSetStartDate = useCallback((date: string) => {
    setStartDate(date);
  }, []);

  const handleSetEndDate = useCallback((date: string) => {
    setEndDate(date);
  }, []);

  const handleSetNotes = useCallback((value: string) => {
    setNotes(value.slice(0, 500));
  }, []);

  const exportPdf = useCallback(async () => {
    // 1. Validate date range
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be on or before end date.');
      return;
    }

    // 2. Begin export
    setIsExporting(true);
    setError(null);

    try {
      // 3. Get auth session
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token ?? ''}`,
      };

      // 4. POST to export endpoint
      const response = await fetch(`${API_BASE}/api/timeline/${catId}/export/pdf`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          startDate,
          endDate,
          ...(notes.trim() ? { ownerNotes: notes.trim() } : {}),
        }),
      });

      // 5. Handle error responses
      if (!response.ok) {
        if (response.status === 429) {
          setError('Too many export requests. Please wait before retrying.');
          return;
        }
        if (response.status === 403) {
          setError('Access denied.');
          return;
        }
        if (response.status === 400) {
          const body = await response.json().catch(() => ({})) as { error?: string; message?: string };
          setError(body.error ?? body.message ?? 'The selected date range contains no events to export.');
          return;
        }
        setError('Export failed. Please try again.');
        return;
      }

      // 6. Trigger browser download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Extract filename from Content-Disposition header if present
      const disposition = response.headers.get('Content-Disposition') ?? '';
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      link.download = filenameMatch?.[1] ?? 'pawwiz-health-summary.pdf';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 7. On success: close modal
      setIsOpen(false);
    } catch (err) {
      setError((err as Error).message ?? 'An unexpected error occurred during export.');
    } finally {
      setIsExporting(false);
    }
  }, [catId, startDate, endDate, notes]);

  return {
    isOpen,
    startDate,
    endDate,
    notes,
    isExporting,
    error,
    openModal,
    closeModal,
    setStartDate: handleSetStartDate,
    setEndDate: handleSetEndDate,
    setNotes: handleSetNotes,
    exportPdf,
  };
}
