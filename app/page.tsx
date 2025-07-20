import { redirect } from "next/navigation";
export const experimental_ppr = true;

export default async function HomePage() {
  return redirect("/chat");
}
