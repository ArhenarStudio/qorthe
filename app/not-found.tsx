import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <h1 className="mb-2 text-9xl font-bold text-[#0a0806]">404</h1>
      <h2 className="mb-4 text-2xl font-semibold text-[#0a0806]">
        Página no encontrada
      </h2>
      <p className="mb-8 max-w-md text-gray-600">
        Lo sentimos, la página que buscas no existe o ha sido movida.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-[#8b6f47] px-8 py-3 text-white transition-colors hover:bg-[#6d5638]"
      >
        Volver al Inicio
      </Link>
    </div>
  );
}
