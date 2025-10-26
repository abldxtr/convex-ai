"use cache";

import { redirect } from "next/navigation";

export default async function HomePage() {
  return redirect("/chat");
}
