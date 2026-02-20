import { Suspense } from 'react';
import { CheckoutSuccessPage } from "@/components/pages/CheckoutSuccessPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <CheckoutSuccessPage />
    </Suspense>
  );
}
