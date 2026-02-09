"use client";

import Image from "next/image";
import { useState } from "react";

type TabId = "description" | "specifications" | "care" | "artisan";

interface ProductTabsProps {
  description: {
    title: string;
    paragraphs: string[];
    note?: string;
  };
  specifications: {
    length: string;
    width: string;
    height: string;
    weight: string;
    wood: string;
    finish: string;
  };
  care: {
    cleaning: string[];
    avoid: string[];
    maintenance: string[];
  };
  artist: {
    name: string;
    imageUrl: string;
    bio: string[];
    quote: string;
    warrantyText: string;
  };
}

const TAB_IDS: TabId[] = [
  "description",
  "specifications",
  "care",
  "artisan",
];

const TAB_LABELS: Record<TabId, string> = {
  description: "Descripción",
  specifications: "Especificaciones",
  care: "Cuidado y Mantenimiento",
  artisan: "El Artesano",
};

export function ProductTabs({
  description,
  specifications,
  care,
  artist,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");

  return (
    <div className="mt-16 border-t border-sand-100">
      {/* Tab Headers */}
      <div className="flex space-x-8 overflow-x-auto">
        {TAB_IDS.map((tabId) => {
          const isActive = activeTab === tabId;
          return (
            <button
              key={tabId}
              type="button"
              onClick={() => setActiveTab(tabId)}
              className={`whitespace-nowrap px-2 py-4 text-sm transition-all ${
                isActive
                  ? "border-b-2 border-walnut-500 font-semibold text-walnut-500"
                  : "border-b-2 border-transparent text-taupe-600 hover:text-walnut-600"
              }`}
            >
              {TAB_LABELS[tabId]}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="py-8">
        {/* DESCRIPCIÓN */}
        {activeTab === "description" && (
          <div className="prose max-w-none">
            <h3 className="mb-4 text-xl font-semibold text-walnut-500">
              {description.title}
            </h3>
            {description.paragraphs.map((p, i) => (
              <p
                key={i}
                className="mb-4 text-taupe-600"
                dangerouslySetInnerHTML={{ __html: p }}
              />
            ))}
            {description.note && (
              <div className="my-6 border-l-4 border-amber-500 bg-amber-50 p-4">
                <p
                  className="text-sm text-amber-900"
                  dangerouslySetInnerHTML={{ __html: description.note }}
                />
              </div>
            )}
          </div>
        )}

        {/* ESPECIFICACIONES */}
        {activeTab === "specifications" && (
          <>
            <h3 className="mb-6 text-xl font-semibold text-walnut-500">
              Especificaciones Técnicas
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <div className="rounded bg-sand-50 p-4">
                <div className="mb-1 text-xs uppercase text-taupe-500">Largo</div>
                <div className="text-lg font-semibold text-walnut-500">
                  {specifications.length}
                </div>
              </div>
              <div className="rounded bg-sand-50 p-4">
                <div className="mb-1 text-xs uppercase text-taupe-500">Ancho</div>
                <div className="text-lg font-semibold text-walnut-500">
                  {specifications.width}
                </div>
              </div>
              <div className="rounded bg-sand-50 p-4">
                <div className="mb-1 text-xs uppercase text-taupe-500">Alto</div>
                <div className="text-lg font-semibold text-walnut-500">
                  {specifications.height}
                </div>
              </div>
              <div className="rounded bg-sand-50 p-4">
                <div className="mb-1 text-xs uppercase text-taupe-500">Peso</div>
                <div className="text-lg font-semibold text-walnut-500">
                  {specifications.weight}
                </div>
              </div>
              <div className="rounded bg-sand-50 p-4">
                <div className="mb-1 text-xs uppercase text-taupe-500">
                  Madera
                </div>
                <div className="text-lg font-semibold text-walnut-500">
                  {specifications.wood}
                </div>
              </div>
              <div className="rounded bg-sand-50 p-4">
                <div className="mb-1 text-xs uppercase text-taupe-500">
                  Acabado
                </div>
                <div className="text-lg font-semibold text-walnut-500">
                  {specifications.finish}
                </div>
              </div>
            </div>
          </>
        )}

        {/* CUIDADO */}
        {activeTab === "care" && (
          <>
            <h3 className="mb-6 text-xl font-semibold text-walnut-500">
              Cuidado y Mantenimiento
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="mb-3 font-semibold text-walnut-500">
                  Limpieza:
                </h4>
                <ul className="space-y-2 text-taupe-600">
                  {care.cleaning.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 text-amber-600">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-3 font-semibold text-walnut-500">Evitar:</h4>
                <ul className="space-y-2 text-taupe-600">
                  {care.avoid.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 text-red-600">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-3 font-semibold text-walnut-500">
                  Mantenimiento:
                </h4>
                <ul className="space-y-2 text-taupe-600">
                  {care.maintenance.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 text-slate-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}

        {/* ARTESANO */}
        {activeTab === "artisan" && (
          <>
            <h3 className="mb-6 text-xl font-semibold text-walnut-500">
              El Artesano
            </h3>
            <div className="flex flex-col gap-8 md:flex-row">
              <div className="md:w-1/3">
                <Image
                  src={artist.imageUrl}
                  alt={artist.name}
                  width={300}
                  height={400}
                  className="w-full rounded-lg shadow-md"
                  unoptimized={artist.imageUrl.startsWith(
                    "https://via.placeholder"
                  )}
                />
              </div>
              <div className="space-y-4 md:w-2/3">
                <h4 className="text-2xl font-bold text-walnut-500">
                  {artist.name}
                </h4>
                {artist.bio.map((p, i) => (
                  <p key={i} className="leading-relaxed text-taupe-600">
                    {p}
                  </p>
                ))}
                <div className="rounded-lg border-l-4 border-walnut-500 bg-sand-50 p-6">
                  <p className="italic text-taupe-700">
                    &quot;{artist.quote}&quot;
                  </p>
                  <p className="mt-2 text-sm text-taupe-500">— {artist.name}</p>
                </div>
                <div className="border-t border-sand-100 pt-4">
                  <h5 className="mb-3 font-semibold text-walnut-500">
                    Garantía:
                  </h5>
                  <p
                    className="text-taupe-600"
                    dangerouslySetInnerHTML={{ __html: artist.warrantyText }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
