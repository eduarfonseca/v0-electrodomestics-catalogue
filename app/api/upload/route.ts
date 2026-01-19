// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { Readable } from "stream";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "Fotos Catalogo";

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // leer contenido del file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = (file.name?.split(".").pop() ?? "jpg").replace(/[^a-z0-9]/gi, "");
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("uploadError", uploadError);
      return NextResponse.json({ error: uploadError.message || uploadError }, { status: 500 });
    }

    // obtener url pública
    const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
    const publicUrl = publicData?.publicUrl ?? "";

    return NextResponse.json({ path: filePath, url: publicUrl }, { status: 200 });
  } catch (err: any) {
    console.error("upload route error", err);
    return NextResponse.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}
