"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAccessToken, isAccessTokenExpired, refreshTokens } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/signup"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (PUBLIC_PATHS.includes(pathname)) {
      setReady(true);
      return;
    }
    const token = getAccessToken();
    if (!token || isAccessTokenExpired()) {
      refreshTokens().then((ok) => {
        if (!ok) {
          router.replace("/login");
        } else {
          setReady(true);
        }
      });
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  if (!ready) return null;
  return <>{children}</>;
}
