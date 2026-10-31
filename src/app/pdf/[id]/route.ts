import { type NextRequest, NextResponse } from "next/server";
import { pdfContent } from "@/lib/content/items";
import { db, isUuid } from "@/lib/db/core";

/**
 * Deschide PDF-ul unui material (într-un tab nou). Adresa rămâne aceeași; la fiecare
 * deschidere se face un link nou, valabil o oră, către fișierul din Storage. RLS decide
 * cine îl poate vedea (materialul și fișierul), deci altcineva primește 404.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const missing = () =>
    NextResponse.redirect(new URL("/pdf/indisponibil", request.url));
  if (!isUuid(id)) return missing();
  const supabase = await db();
  const { data: item } = await supabase
    .from("lesson_items")
    .select("kind, content")
    .eq("id", id)
    .maybeSingle();
  const file = item?.kind === "pdf" ? pdfContent.safeParse(item.content) : null;
  if (!file?.success) return missing();
  const { data } = await supabase.storage
    .from("materials")
    .createSignedUrl(file.data.path, 3600);
  if (!data?.signedUrl) return missing();
  return NextResponse.redirect(data.signedUrl);
}
