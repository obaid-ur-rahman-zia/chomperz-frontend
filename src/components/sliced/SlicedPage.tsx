"use client";

import { ReactNode } from "react";

interface SlicedPageProps {
  children: ReactNode;
  /** @deprecated Background is applied on GameShell for full-viewport coverage */
  bg?: string;
  className?: string;
}

export function SlicedPage({ children, className = "" }: SlicedPageProps) {
  return <div className={`relative ${className}`}>{children}</div>;
}
