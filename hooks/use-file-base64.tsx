import { useState, useCallback } from "react";

export function useFileToBase64() {
  const [base64, setBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const convert = useCallback((file: File) => {
    setLoading(true);
    setError(null);

    const reader = new FileReader();

    reader.onload = () => {
      setBase64(reader.result as string); // data: URL
      setLoading(false);
    };

    reader.onerror = () => {
      setError("خطا در خواندن فایل");
      setLoading(false);
    };

    reader.readAsDataURL(file);
  }, []);

  return { base64, error, loading, convert };
}
