import type { Metadata } from "next";
import AdminDashboard from "@/components/AdminDashboard";

// Vue admin (hors segment [lang], FR uniquement). Non indexee. Page statique :
// l'authentification et les donnees passent par les fonctions Cloudflare.
// theme-dark : le site public est clair, cet outil garde le fond noir.
export const metadata: Metadata = {
  title: "Admin LENOPULSE",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="theme-dark min-h-screen bg-background text-ink">
      <AdminDashboard />
    </div>
  );
}
