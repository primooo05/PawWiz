import { useState, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { API_BASE } from '../../lib/config.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

export interface UseCatAvatarUploadReturn {
  uploading: boolean;
  error: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  triggerUpload: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useCatAvatarUpload(
  catProfileId: string,
  catId: string,
  supabaseUserId: string,
  onSuccess: (photoUrl: string) => void,
) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  console.debug('[useCatAvatarUpload] Hook initialized:', {
    catProfileId,
    catId,
    supabaseUserId,
  });

  const triggerUpload = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.debug('[useCatAvatarUpload] File selected:', { 
      fileName: file?.name, 
      fileType: file?.type, 
      fileSize: file?.size 
    });
    
    if (!file) return;

    // Reset input so re-selecting same file triggers change
    e.target.value = '';

    // Client-side MIME validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.warn('[useCatAvatarUpload] Invalid MIME type:', file.type);
      setError('Only JPEG and PNG images are allowed.');
      return;
    }

    // Client-side size validation
    if (file.size > MAX_FILE_SIZE) {
      console.warn('[useCatAvatarUpload] File too large:', file.size, 'bytes');
      setError('Image must be under 5 MB.');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      console.debug('[useCatAvatarUpload] Upload starting:', {
        filePath: file.name,
        supabaseUserId,
        catId,
        catProfileId,
      });

      // Get auth session
      const { data: { session } } = await supabase.auth.getSession();
      console.debug('[useCatAvatarUpload] Auth session retrieved:', {
        hasToken: !!session?.access_token,
      });

      if (!session?.access_token) {
        throw new Error('Not authenticated. Please log in.');
      }

      // Build FormData with file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('catId', catId);

      console.debug('[useCatAvatarUpload] Sending to backend:', {
        endpoint: `${API_BASE}/api/diet/profiles/${catProfileId}/avatar/upload`,
      });

      // Upload via backend endpoint
      const res = await fetch(`${API_BASE}/api/diet/profiles/${catProfileId}/avatar/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      console.debug('[useCatAvatarUpload] Backend response:', {
        status: res.status,
        statusText: res.statusText,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error('[useCatAvatarUpload] Backend error response:', errBody);
        setError(errBody.message || `Upload failed (${res.status}).`);
        setUploading(false);
        return;
      }

      const responseData = await res.json();
      console.debug('[useCatAvatarUpload] Upload and sync complete:', responseData);
      
      onSuccess(responseData.photoUrl);
    } catch (err: any) {
      console.error('[useCatAvatarUpload] Unexpected error:', {
        message: err.message,
        stack: err.stack,
        error: err,
      });
      setError(err.message || 'Unexpected error during upload.');
    } finally {
      setUploading(false);
    }
  }, [catProfileId, catId, supabaseUserId, onSuccess]);

  return { uploading, error, inputRef, triggerUpload, handleFileChange };
}
