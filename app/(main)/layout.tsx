import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { FeatureWidgets } from "@/components/layout/FeatureWidgets";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GlobalHeader />
      <main className="flex-grow pt-[100px] min-h-screen bg-sand-100 dark:bg-wood-950 flex flex-col transition-colors duration-300">
        {children}
      </main>
      <GlobalFooter />
      <FeatureWidgets />
    </>
  );
}
