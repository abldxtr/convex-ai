import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import Link from "next/link";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import CurrentUser from "@/components/current-user";
export default async function HomePage() {
  const token = await convexAuthNextjsToken();
  console.log({ token });
  // const isAuth = await isAuthenticatedNextjs();

  // if (!isAuth) {
  //   redirect("/register");
  // }
  // if (token) {
  const user = await fetchQuery(api.user.getUser, {}, { token });
  console.log({ user });
  // }

  return (
    <>
      <CurrentUser />
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        hello world
        <div className="flex flex-col gap-4">
          <Link href="/chat" className="text-2xl font-bold text-white">
            Chat
          </Link>
          <Link href="/auth" className="text-2xl font-bold text-white">
            Auth
          </Link>
        </div>
        {JSON.stringify(user)}
        {/* <UserInfo /> */}
        {/* <ConvexChatStream /> */}
      </main>
    </>
  );
}
