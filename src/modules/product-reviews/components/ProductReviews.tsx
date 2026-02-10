"use client";

import { useState } from "react";
import { Star, ThumbsUp, Check } from "lucide-react";

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
}

interface ProductReviewsProps {
  productId: string;
  isDarkMode: boolean;
  language: "es" | "en";
}

export function ProductReviews({
  productId,
  isDarkMode,
  language,
}: ProductReviewsProps) {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());

  const reviews: Review[] = [
    {
      id: "1",
      author: "María Rodríguez",
      rating: 5,
      date: "2026-01-15",
      title: "Calidad excepcional",
      comment:
        "La calidad de la madera y el acabado son impresionantes. La silla es muy cómoda y el diseño es hermoso. Totalmente recomendado.",
      verified: true,
      helpful: 12,
    },
    {
      id: "2",
      author: "Carlos Mendoza",
      rating: 5,
      date: "2026-01-10",
      title: "Inversión que vale la pena",
      comment:
        "Después de 3 meses de uso, puedo confirmar que es una excelente inversión. La artesanía es notable y se nota la atención al detalle.",
      verified: true,
      helpful: 8,
    },
    {
      id: "3",
      author: "Ana Martínez",
      rating: 4,
      date: "2025-12-28",
      title: "Muy buena, pero tardó en llegar",
      comment:
        "El producto es excelente, la calidad es indiscutible. Solo le resto una estrella porque tardó más de lo esperado en llegar, pero valió la pena la espera.",
      verified: true,
      helpful: 5,
    },
    {
      id: "4",
      author: "Roberto Silva",
      rating: 5,
      date: "2025-12-20",
      title: "Superó mis expectativas",
      comment:
        "Las fotos no le hacen justicia. En persona es aún más hermosa. El tallado a mano es una obra de arte. Muy satisfecho con mi compra.",
      verified: false,
      helpful: 15,
    },
  ];

  const translations = {
    es: {
      title: "Opiniones de Clientes",
      verified: "Compra Verificada",
      helpful: "Útil",
      showAll: "Ver todas las reseñas",
      writeReview: "Escribir Reseña",
      ratings: "Calificaciones",
      filterBy: "Filtrar por:",
      allRatings: "Todas",
      stars: "estrellas",
      outOf: "de",
      basedOn: "basado en",
      reviews: "reseñas",
    },
    en: {
      title: "Customer Reviews",
      verified: "Verified Purchase",
      helpful: "Helpful",
      showAll: "Show all reviews",
      writeReview: "Write Review",
      ratings: "Ratings",
      filterBy: "Filter by:",
      allRatings: "All",
      stars: "stars",
      outOf: "out of",
      basedOn: "based on",
      reviews: "reviews",
    },
  };

  const t = translations[language];

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage:
      (reviews.filter((r) => r.rating === rating).length / reviews.length) *
      100,
  }));

  const filteredReviews =
    selectedRating === 0
      ? reviews
      : reviews.filter((r) => r.rating === selectedRating);

  const handleHelpful = (reviewId: string) => {
    const newHelpful = new Set(helpfulReviews);
    if (newHelpful.has(reviewId)) {
      newHelpful.delete(reviewId);
    } else {
      newHelpful.add(reviewId);
    }
    setHelpfulReviews(newHelpful);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2
          className={`text-2xl font-medium md:text-3xl ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {t.title}
        </h2>
        <button className="rounded-lg bg-[#8b6f47] px-6 py-2.5 font-medium text-white transition-colors hover:bg-[#6d5638]">
          {t.writeReview}
        </button>
      </div>

      <div
        className={`grid grid-cols-1 gap-8 rounded-lg p-6 md:grid-cols-2 ${
          isDarkMode ? "bg-[#2d2419]" : "bg-gray-50"
        }`}
      >
        <div className="text-center md:text-left">
          <div className="mb-3 flex items-end justify-center gap-3 md:justify-start">
            <span
              className={`text-5xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {averageRating.toFixed(1)}
            </span>
            <span
              className={`mb-2 text-lg ${
                isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
              }`}
            >
              {t.outOf} 5
            </span>
          </div>

          <div className="mb-2 flex items-center justify-center gap-1 md:justify-start">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 ${
                  star <= Math.round(averageRating)
                    ? "fill-[#8b6f47] text-[#8b6f47]"
                    : isDarkMode
                      ? "text-[#3d2f23]"
                      : "text-gray-300"
                }`}
              />
            ))}
          </div>

          <p
            className={`text-sm ${
              isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
            }`}
          >
            {t.basedOn} {reviews.length} {t.reviews}
          </p>
        </div>

        <div className="space-y-2">
          {ratingDistribution.map(({ rating, count, percentage }) => (
            <button
              key={rating}
              onClick={() =>
                setSelectedRating(selectedRating === rating ? 0 : rating)
              }
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                selectedRating === rating
                  ? "bg-[#8b6f47]/20"
                  : isDarkMode
                    ? "hover:bg-[#3d2f23]"
                    : "hover:bg-gray-100"
              }`}
            >
              <span
                className={`w-12 text-sm font-medium ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {rating} {t.stars}
              </span>
              <div
                className={`flex-1 overflow-hidden rounded-full ${
                  isDarkMode ? "h-2 bg-[#1a1512]" : "h-2 bg-gray-200"
                }`}
              >
                <div
                  className="h-full bg-[#8b6f47] transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span
                className={`w-8 text-right text-sm ${
                  isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedRating > 0 && (
        <div className="flex items-center justify-between">
          <p
            className={`text-sm ${
              isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
            }`}
          >
            {t.filterBy} {selectedRating} {t.stars}
          </p>
          <button
            onClick={() => setSelectedRating(0)}
            className={`text-sm font-medium ${
              isDarkMode
                ? "text-[#8b6f47] hover:text-[#b8a99a]"
                : "text-[#8b6f47] hover:text-[#6d5638]"
            }`}
          >
            {t.allRatings}
          </button>
        </div>
      )}

      <div className="space-y-6">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className={`rounded-lg border p-6 ${
              isDarkMode
                ? "border-[#3d2f23] bg-[#2d2419]"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {review.author}
                  </span>
                  {review.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                      <Check className="h-3 w-3" />
                      {t.verified}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-[#8b6f47] text-[#8b6f47]"
                            : isDarkMode
                              ? "text-[#3d2f23]"
                              : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-[#b8a99a]" : "text-gray-500"
                    }`}
                  >
                    {new Date(review.date).toLocaleDateString(
                      language === "es" ? "es-MX" : "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>
            </div>

            <h4
              className={`mb-2 font-medium ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {review.title}
            </h4>
            <p
              className={`mb-4 text-sm leading-relaxed ${
                isDarkMode ? "text-[#b8a99a]" : "text-gray-600"
              }`}
            >
              {review.comment}
            </p>

            <button
              onClick={() => handleHelpful(review.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                helpfulReviews.has(review.id)
                  ? "bg-[#8b6f47] text-white"
                  : isDarkMode
                    ? "bg-[#3d2f23] text-[#b8a99a] hover:bg-[#4d3f33]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
              {t.helpful} (
              {review.helpful + (helpfulReviews.has(review.id) ? 1 : 0)})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
