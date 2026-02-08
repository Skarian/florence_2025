import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-ink text-fog">
      <Navbar />
      <main className="app-shell pt-8">{children}</main>
    </div>
  );
}
