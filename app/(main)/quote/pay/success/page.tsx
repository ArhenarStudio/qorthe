"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, ArrowRight } from "lucide-react";

export default function QuotePaySuccessPage() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const quoteId = params.get("quote_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [quoteNumber, setQuoteNumber] = useState("");

  useEffect(() => {
    if (!quoteId) { setStatus("error"); return; }

    const confirm = async () => {
      try {
        // Update quote status to anticipo_recibido
        await fetch("/api/admin/quotes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: quoteId,
            status: "anticipo_recibido",
            deposit_paid: {
              amount: 0, // Will be filled from Stripe webhook
              method: "Stripe",
              ref: sessionId || "",
              date: new Date().toISOString(),
            },
          }),
        });

        // Fetch quote number for display
        const res = await fetch(`/api/admin/quotes?id=${quoteId}`);
        if (res.ok) {
          const data = await res.json();
          setQuoteNumber(data.quote?.number || "");
        }
        setStatus("success");
      } catch {
        setStatus("error");
      }
    };

    confirm();
  }, [quoteId, sessionId]);

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-wood-900 dark:text-sand-100 mb-2">
          {status === "success" ? "¡Pago Recibido!" : "Error"}
        </h1>
        {status === "success" ? (
          <>
            <p className="text-sm text-wood-500 mb-6">
              Tu anticipo para la cotización <strong className="text-accent-gold">{quoteNumber}</strong> ha sido procesado correctamente.
              Te contactaremos pronto para iniciar la producción.
            </p>
            <div className="flex gap-3 justify-center">
              <a href="/account" className="inline-flex items-center gap-2 px-6 py-3 bg-wood-900 text-sand-100 rounded-xl text-sm font-bold hover:bg-wood-800 transition-colors">
                Ver mi cuenta <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </>
        ) : (
          <p className="text-sm text-red-500">
            Hubo un problema procesando tu pago. Contacta a nuestro equipo.
          </p>
        )}
      </div>
    </div>
  );
}
