"use client";

import { useState } from "react";
import type { SignInFlow } from "@/components/auth/types";
import { SignInCard } from "@/components/auth/sign-in-card";
import { SignUpCard } from "@/components/auth/sign-up-card";

export const AuthScreen = () => {
  const [state, setState] = useState<SignInFlow>("signIn");

  return (
    <div className="flex h-dvh w-full items-center justify-center bg-[#5C3B5B]">
      <div className="md:h-auto md:w-[420px]">
        {state === "signIn" ? (
          <SignInCard setState={setState} />
        ) : (
          <SignUpCard setState={setState} />
        )}
      </div>
    </div>
  );
};
