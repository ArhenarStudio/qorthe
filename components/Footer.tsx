import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-foreground/10 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link
            href="/"
            className="text-lg font-bold text-foreground hover:text-foreground/90"
          >
            Davidsons Design
          </Link>
          <nav className="flex gap-8">
            <Link
              href="/products"
              className="text-sm text-foreground/70 hover:text-foreground"
            >
              Productos
            </Link>
            <Link
              href="/cart"
              className="text-sm text-foreground/70 hover:text-foreground"
            >
              Carrito
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-center text-sm text-foreground/50">
          © {new Date().getFullYear()} Davidsons Design. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
