import type { Metadata } from "next";
import AdminDashboard from "@/components/AdminDashboard";

// Vue admin (hors segment [lang], FR uniquement). Non indexee. Page statique :
// l'authentification et les donnees passent par les fonctions Cloudflare.
export const metadata: Metadata = {
  title: "Admin LENOPULSE",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
