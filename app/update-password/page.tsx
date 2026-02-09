"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Lock } from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.push("/login?message=password_updated");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-50 px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-semibold text-walnut-600">
          Nueva contraseña
        </h1>
        <p className="mb-6 text-taupe-600">
          Elige una contraseña segura de al menos 8 caracteres.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-taupe-700">
              Nueva contraseña
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-taupe-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded border border-sand-300 py-3 pl-10 pr-4 focus:border-walnut-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-taupe-700">
              Confirmar contraseña
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-taupe-400" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la contraseña"
                className="w-full rounded border border-sand-300 py-3 pl-10 pr-4 focus:border-walnut-500 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-walnut-500 py-3 font-medium text-cream transition-opacity hover:bg-walnut-600 disabled:opacity-50"
          >
            {isLoading ? "Guardando…" : "Actualizar contraseña"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-taupe-600">
          <Link href="/login" className="text-walnut-600 underline hover:text-walnut-700">
            Volver a login
          </Link>
        </p>
      </div>
    </div>
  );
}
