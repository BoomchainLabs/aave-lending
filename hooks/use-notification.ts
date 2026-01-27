'use client';

import { toast } from 'sonner';

export function useNotification() {
  const success = (message: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 4000,
    });
  };

  const error = (message: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    });
  };

  const info = (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  };

  const loading = (message: string) => {
    const id = toast.loading(message);
    return id;
  };

  const updateLoading = (id: string | number, message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      toast.success(message, { id });
    } else {
      toast.error(message, { id });
    }
  };

  const dismiss = (id?: string | number) => {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  };

  return {
    success,
    error,
    info,
    loading,
    updateLoading,
    dismiss,
  };
}
