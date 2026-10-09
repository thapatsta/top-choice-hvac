// The ad landing pages bring their own minimal header, footer and sticky bar
// (components/lp/LandingPage.tsx). Nothing from the site chrome renders here.
export default function LandingPagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="flex-1">
      {children}
    </main>
  );
}
