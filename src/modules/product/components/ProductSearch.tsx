"use client";

import { useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface ProductSearchProps {
  isDarkMode: boolean;
  language: "es" | "en";
  onSearch: (query: string, filters: SearchFilters) => void;
}

export interface SearchFilters {
  category?: string;
  priceRange?: { min: number; max: number };
  material?: string;
  sortBy?: "name" | "price-asc" | "price-desc" | "newest";
}

export function ProductSearch({
  isDarkMode,
  language,
  onSearch,
}: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const t = {
    es: {
      placeholder: "Buscar productos...",
      filters: "Filtros",
      category: "Categoría",
      all: "Todas",
      living: "Sala",
      dining: "Comedor",
      bedroom: "Recámara",
      office: "Oficina",
      priceRange: "Rango de precio",
      material: "Material",
      sortBy: "Ordenar por",
      nameAZ: "Nombre A-Z",
      priceLowHigh: "Precio: Menor a Mayor",
      priceHighLow: "Precio: Mayor a Menor",
      newest: "Más recientes",
      apply: "Aplicar filtros",
      clear: "Limpiar",
    },
    en: {
      placeholder: "Search products...",
      filters: "Filters",
      category: "Category",
      all: "All",
      living: "Living Room",
      dining: "Dining Room",
      bedroom: "Bedroom",
      office: "Office",
      priceRange: "Price range",
      material: "Material",
      sortBy: "Sort by",
      nameAZ: "Name A-Z",
      priceLowHigh: "Price: Low to High",
      priceHighLow: "Price: High to Low",
      newest: "Newest",
      apply: "Apply filters",
      clear: "Clear",
    },
  };

  const content = t[language];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, filters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setQuery("");
    onSearch("", {});
  };

  return (
    <div
      className={`rounded-xl border p-6 ${
        isDarkMode ? "border-[#3d2f23] bg-[#1a1512]" : "border-gray-200 bg-white"
      }`}
    >
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <Search
            className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform ${
              isDarkMode ? "text-[#b8a99a]" : "text-gray-400"
            }`}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={content.placeholder}
            className={`w-full rounded-lg border py-3 pl-12 pr-24 outline-none transition-colors ${
              isDarkMode
                ? "border-[#3d2f23] bg-[#2d2419] text-white placeholder-[#b8a99a]/50 focus:border-[#8b6f47]"
                : "border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-[#8b6f47]"
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className={`absolute right-14 top-1/2 -translate-y-1/2 transform rounded-md p-1 ${
                isDarkMode
                  ? "text-[#b8a99a] hover:text-white"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-4 top-1/2 -translate-y-1/2 transform rounded-md p-1.5 transition-colors ${
              showFilters
                ? "bg-[#8b6f47] text-white"
                : isDarkMode
                  ? "text-[#b8a99a] hover:bg-[#2d2419]"
                  : "text-gray-400 hover:bg-gray-100"
            }`}
            aria-label={content.filters}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </form>

      {showFilters && (
        <div
          className={`space-y-4 border-t pt-4 ${
            isDarkMode ? "border-[#3d2f23]" : "border-gray-200"
          }`}
        >
          <div>
            <label
              className={`mb-2 block text-sm font-medium ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {content.category}
            </label>
            <select
              value={filters.category || ""}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value || undefined })
              }
              className={`w-full rounded-lg border px-4 py-2 outline-none transition-colors ${
                isDarkMode
                  ? "border-[#3d2f23] bg-[#2d2419] text-white focus:border-[#8b6f47]"
                  : "border-gray-200 bg-white text-gray-900 focus:border-[#8b6f47]"
              }`}
            >
              <option value="">{content.all}</option>
              <option value="living">{content.living}</option>
              <option value="dining">{content.dining}</option>
              <option value="bedroom">{content.bedroom}</option>
              <option value="office">{content.office}</option>
            </select>
          </div>

          <div>
            <label
              className={`mb-2 block text-sm font-medium ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {content.sortBy}
            </label>
            <select
              value={filters.sortBy || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  sortBy: (e.target.value || undefined) as SearchFilters["sortBy"],
                })
              }
              className={`w-full rounded-lg border px-4 py-2 outline-none transition-colors ${
                isDarkMode
                  ? "border-[#3d2f23] bg-[#2d2419] text-white focus:border-[#8b6f47]"
                  : "border-gray-200 bg-white text-gray-900 focus:border-[#8b6f47]"
              }`}
            >
              <option value="name">{content.nameAZ}</option>
              <option value="price-asc">{content.priceLowHigh}</option>
              <option value="price-desc">{content.priceHighLow}</option>
              <option value="newest">{content.newest}</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleClearFilters}
              className={`flex-1 rounded-lg border px-4 py-2 transition-colors ${
                isDarkMode
                  ? "border-[#3d2f23] text-[#b8a99a] hover:bg-[#2d2419]"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {content.clear}
            </button>
            <button
              onClick={() => onSearch(query, filters)}
              className="flex-1 rounded-lg bg-[#8b6f47] px-4 py-2 text-white transition-colors hover:bg-[#a68760]"
            >
              {content.apply}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
