import { notFound } from "next/navigation";

// Internal component showcase — available in development only.
export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return children;
}
