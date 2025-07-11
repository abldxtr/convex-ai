export function useDirection(text: string): "rtl" | "ltr" {
  const rtlChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return rtlChars.test(text) ? "rtl" : "ltr";
}
