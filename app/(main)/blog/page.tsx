"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Calendar, User, ArrowRight, Tag } from "lucide-react";
import { GlobalHeader } from "@/components/layout/GlobalHeader";
import { GlobalFooter } from "@/components/layout/GlobalFooter";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  category: string;
  author: string;
  tags: string[];
  published_at: string;
  status: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/blog")
      .then((r) => (r.ok ? r.json() : { posts: [] }))
      .then((d) => setPosts(d.posts || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <GlobalHeader />
      <main className="min-h-screen bg-sand-50 dark:bg-wood-950 pt-32 pb-24 transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="font-serif text-5xl text-wood-900 dark:text-sand-100 mb-4">Blog</h1>
            <p className="text-wood-500 dark:text-sand-400 text-lg max-w-xl mx-auto">
              Historias de artesanía, cuidado de la madera y el arte detrás de cada pieza.
            </p>
          </motion.div>

          {/* Posts Grid */}
          {loading ? (
            <div className="text-center py-20 text-wood-400">Cargando publicaciones...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-wood-400 dark:text-sand-500 text-lg mb-4">Aún no hay publicaciones</p>
              <p className="text-wood-300 dark:text-sand-600 text-sm">Las publicaciones del blog aparecerán aquí cuando se creen desde el panel admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.map((post, idx) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white dark:bg-wood-900 rounded-2xl overflow-hidden border border-wood-100 dark:border-wood-800 shadow-sm hover:shadow-lg transition-all group"
                >
                  {post.featured_image && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-[10px] text-wood-400 dark:text-sand-500 uppercase tracking-widest mb-3">
                      {post.category && (
                        <span className="bg-accent-gold/10 text-accent-gold px-2 py-0.5 rounded-full font-bold">{post.category}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(post.published_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <h2 className="font-serif text-xl text-wood-900 dark:text-sand-100 mb-2 group-hover:text-accent-gold transition-colors">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-wood-500 dark:text-sand-400 mb-4 line-clamp-2">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-wood-400 flex items-center gap-1">
                        <User size={10} /> {post.author}
                      </span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-xs font-bold text-accent-gold hover:text-wood-900 dark:hover:text-sand-100 transition-colors flex items-center gap-1 uppercase tracking-widest"
                      >
                        Leer <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </main>
      <GlobalFooter />
    </>
  );
}
