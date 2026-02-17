import { CheckoutHeader } from "@/components/layout/CheckoutHeader";
import { CheckoutFooter } from "@/components/layout/CheckoutFooter";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CheckoutHeader />
      <main className="flex-grow min-h-screen bg-sand-100 flex flex-col">
        {children}
      </main>
      <CheckoutFooter />
    </>
  );
}
