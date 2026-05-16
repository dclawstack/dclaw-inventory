"use client";

import { usePathname } from "next/navigation";
import NavSidebar from "./NavSidebar";

const PUBLIC_PATHS = ["/login", "/signup"];

export default function ConditionalSidebar() {
  const pathname = usePathname();
  if (PUBLIC_PATHS.includes(pathname)) return null;
  return <NavSidebar />;
}
