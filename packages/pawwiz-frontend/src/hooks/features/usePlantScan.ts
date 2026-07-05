import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { ToxicityScanResult } from '../../../../pawwiz-backend/src/types/shared.js';

export function usePlantScan(apiBase: string) {
  const [plantQuery, setPlantQuery] = useState('');
  const [scanResult, setScanResult] = useState<ToxicityScanResult | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('[usePlantScan] Image selected for upload:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Client-side validation: mirrors the backend limits (JPEG/PNG only, max 10 MB).
    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      console.warn('[usePlantScan] Validation failed: Unsupported image type', file.type);
      setScanError('Only JPEG and PNG images are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      console.warn('[usePlantScan] Validation failed: File size exceeds 10MB limit', file.size);
      setScanError('Image must be smaller than 10 MB.');
      return;
    }

    setScanLoading(true); setScanError(''); setScanResult(null);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const formData = new FormData();
      formData.append('image', file);

      console.log('[usePlantScan] Sending POST /api/toxicity/scan request...');
      const response = await fetch(`${apiBase}/api/toxicity/scan`, {
        method: 'POST',
        headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {},
        body: formData,
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('[usePlantScan] API Error status:', response.status, errData);
        throw new Error(errData.error || 'Failed to analyze image.');
      }
      const data = await response.json();
      console.log('[usePlantScan] Toxicity scan result received:', data);
      setScanResult(data);
    } catch (err) {
      console.error('[usePlantScan] Exception in handleImageUpload:', err);
      setScanError((err as Error).message);
    } finally { setScanLoading(false); }
  };

  const handleTextSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantQuery.trim()) return;
    setScanLoading(true); setScanError(''); setScanResult(null);
    setImagePreview(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${apiBase}/api/toxicity/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ plantNameQuery: plantQuery }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Plant query failed.');
      }
      setScanResult(await response.json());
    } catch (err) {
      setScanError((err as Error).message);
    } finally { setScanLoading(false); }
  };

  return {
    plantQuery,
    setPlantQuery,
    scanResult,
    scanLoading,
    scanError,
    handleImageUpload,
    handleTextSearch,
    imagePreview,
    setImagePreview,
    lowConfidenceWarning: scanResult?.lowConfidenceWarning ?? false,
    dataSource: scanResult?.dataSource ?? null,
    identificationConfidence: scanResult?.identificationConfidence ?? null
  };
}
