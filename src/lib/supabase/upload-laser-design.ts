// ═══════════════════════════════════════════════════════════════
// LASER DESIGN UPLOAD — Upload de diseños láser a Supabase Storage
//
// Sube archivos directamente desde el browser a Supabase Storage
// bucket "laser-designs". Requiere que el usuario esté autenticado
// en Supabase o que el bucket permita uploads anónimos.
//
// Path pattern: {timestamp}-{sanitizedFileName}
// ═══════════════════════════════════════════════════════════════

import { createClient } from "@/lib/supabase/client";

const BUCKET_NAME = "laser-designs";

/**
 * Upload a laser design file to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadLaserDesign(file: File): Promise<string> {
  const supabase = createClient();
  if (!supabase) {
    throw new Error("Supabase client not configured");
  }

  // Generate unique filename
  const timestamp = Date.now();
  const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${timestamp}-${sanitized}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("[uploadLaserDesign] Upload error:", error);
    throw new Error(`Error al subir archivo: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Delete a laser design from Supabase Storage.
 */
export async function deleteLaserDesign(filePath: string): Promise<void> {
  const supabase = createClient();
  if (!supabase) return;

  // Extract path from full URL
  const url = new URL(filePath);
  const pathParts = url.pathname.split(`/storage/v1/object/public/${BUCKET_NAME}/`);
  const storagePath = pathParts[1];

  if (storagePath) {
    await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
  }
}
