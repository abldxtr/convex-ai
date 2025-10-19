import { unstable_cache as next_unstable_cache } from "next/cache";
import { cache } from "react";

export const unstable_cache = <Inputs extends unknown[], Output>(
  callback: (...args: Inputs) => Promise<Output>,
  keyParts: string[],
  options?: { revalidate?: number; tags?: string[] }
) => {
  const nextCache = next_unstable_cache(
    callback as (...args: any[]) => Promise<Output>,
    keyParts,
    options
  );

  return cache((...args: Inputs) => nextCache(...args));
};
