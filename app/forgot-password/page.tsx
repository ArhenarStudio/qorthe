"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/modules/auth";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      setError("Correo inválido.");
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo enviar el enlace.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-50 px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-semibold text-walnut-600">
          Restablecer contraseña
        </h1>
        <p className="mb-6 text-taupe-600">
          Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
        </p>

        {sent ? (
          <div className="rounded border border-green-200 bg-green-50 p-4 text-green-800">
            Revisa tu bandeja de entrada. Si no ves el correo, revisa spam.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-taupe-700">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-taupe-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full rounded border border-sand-300 py-3 pl-10 pr-4 focus:border-walnut-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-walnut-500 py-3 font-medium text-cream transition-opacity hover:bg-walnut-600 disabled:opacity-50"
            >
              {isLoading ? "Enviando…" : "Enviar enlace"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-taupe-600">
          <Link href="/login" className="text-walnut-600 underline hover:text-walnut-700">
            Volver a login
          </Link>
        </p>
      </div>
    </div>
  );
}
