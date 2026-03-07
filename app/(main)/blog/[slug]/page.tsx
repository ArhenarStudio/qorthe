"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { GlobalFooter } from "@/components/layout/GlobalFooter";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/public/blog?slug=${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.post) setPost(d.post); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <>
      <GlobalHeader />
      <main className="min-h-screen bg-sand-50 dark:bg-wood-950 pt-32 pb-24 transition-colors">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Back link */}
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-wood-400 hover:text-wood-900 dark:hover:text-sand-100 transition-colors mb-8">
            <ArrowLeft size={14} /> Volver al blog
          </Link>

          {loading ? (
            <div className="text-center py-20 text-wood-400">Cargando...</div>
          ) : !post ? (
            <div className="text-center py-20">
              <h2 className="font-serif text-2xl text-wood-900 dark:text-sand-100 mb-3">Post no encontrado</h2>
              <Link href="/blog" className="text-accent-gold hover:underline text-sm">Volver al blog</Link>
            </div>
          ) : (
            <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* Meta */}
              <div className="flex items-center gap-3 text-[10px] text-wood-400 dark:text-sand-500 uppercase tracking-widest mb-4">
                {post.category && <span className="bg-accent-gold/10 text-accent-gold px-2 py-0.5 rounded-full font-bold">{post.category}</span>}
                {post.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(post.published_at).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                )}
                <span className="flex items-center gap-1"><User size={10} /> {post.author}</span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-4xl md:text-5xl text-wood-900 dark:text-sand-100 mb-6 leading-tight">{post.title}</h1>

              {/* Featured Image */}
              {post.featured_image && (
                <img src={post.featured_image} alt={post.title} className="w-full rounded-2xl mb-8 shadow-lg" />
              )}

              {/* Body */}
              <div className="prose prose-wood dark:prose-invert max-w-none text-wood-700 dark:text-sand-300 leading-relaxed whitespace-pre-wrap">
                {post.body}
              </div>

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="mt-10 pt-6 border-t border-wood-100 dark:border-wood-800 flex items-center gap-2 flex-wrap">
                  <Tag size={14} className="text-wood-400" />
                  {post.tags.map((tag: string) => (
                    <span key={tag} className="text-[10px] bg-wood-100 dark:bg-wood-800 text-wood-600 dark:text-sand-400 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </motion.article>
          )}
        </div>
      </main>
      <GlobalFooter />
    </>
  );
}
