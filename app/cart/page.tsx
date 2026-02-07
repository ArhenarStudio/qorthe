import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function CartPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Carrito
      </h1>
      <p className="mt-4 text-foreground/70">
        Tu carrito está vacío. Explora nuestros productos para comenzar.
      </p>
      </main>
      <Footer />
    </div>
  );
}
