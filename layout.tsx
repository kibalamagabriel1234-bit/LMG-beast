import "./style.css";
import type { ReactNode } from "react";
export const metadata = { title: "LMG MARKETS", description: "Educational market insights and member portal" };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
