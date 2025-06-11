import { useState, useCallback } from "react";

export function useFileToBase64() {
  const [base64, setBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const convert = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null);

      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        setBase64(result);
        setLoading(false);
        resolve(result);
      };

      reader.onerror = () => {
        const message = "خطا در خواندن فایل";
        setError(message);
        setLoading(false);
        reject(new Error(message));
      };

      reader.readAsDataURL(file);
    });
  }, []);

  return { base64, error, loading, convert };
}
