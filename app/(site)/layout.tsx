import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StickyCallBar } from "@/components/StickyCallBar";

// Chrome for every page except the /lp/* ad landing pages (app/lp/layout.tsx).
// The (site) folder is a route group: it doesn't change any URL.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {/* pb-16: room for the phone-only sticky call bar. */}
      <main id="main-content" className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>
      <Footer />
      <StickyCallBar />
    </>
  );
}
