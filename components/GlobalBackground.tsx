"use client";

import { usePathname } from "next/navigation";
import RedeViva from "./RedeViva";

export default function GlobalBackground() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <RedeViva />;
}
