export function base64ToBlob(base64Data: string): Blob {
  const parts = base64Data.split(",");
  const mime = parts[0].match(/:(.*?);/)?.[1] || "";
  const byteCharacters = atob(parts[1]);
  const byteArrays = [];

  for (let i = 0; i < byteCharacters.length; i++) {
    byteArrays.push(byteCharacters.charCodeAt(i));
  }

  const byteArray = new Uint8Array(byteArrays);
  return new Blob([byteArray], { type: mime });
}
