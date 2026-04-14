import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Whitelist de extensões permitidas (mantém arquivo.tipo em minúscula)
const ALLOWED_EXTENSIONS = [
  "pdf", "doc", "docx", "txt", "xlsx", "xls", "ppt", "pptx",
  "jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico",
  "zip", "rar", "7z", "tar", "gz",
  "exe", "msi", "app", "deb", "rpm", "apk",
  "mp3", "mp4", "avi", "mkv", "mov", "flv", "webm", "m4a",
  "iso", "bin", "jar", "py", "js", "ts", "tsx", "jsx", "html", "css"
];

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const nome = formData.get("nome") as string;

    if (!file)
      return NextResponse.json(
        { error: "Arquivo não enviado" },
        { status: 400 },
      );

    // Extrai extensão do arquivo
    const fileNameParts = file.name.split(".");
    const extension = fileNameParts.length > 1
      ? fileNameParts[fileNameParts.length - 1].toLowerCase()
      : "unknown";

    // Valida extension permitida
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { 
          error: `Tipo de arquivo não permitido: .${extension}. Tipos aceitos: ${ALLOWED_EXTENSIONS.join(", ")}`
        },
        { status: 415 },
      );
    }

    // Valida tamanho do arquivo (100MB máximo)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          error: `Arquivo muito grande. Máximo permitido: 100MB. Arquivo: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
        },
        { status: 413 },
      );
    }
    
    // Sanitiza nome mantendo estrutura válida
    const sanitizedName = file.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .trim();
      
    // Remove apenas caracteres realmente problemáticos
    const safeFileName = sanitizedName
      .replace(/\s+/g, "_") // Espaços viram underscores
      .replace(/[<>:"|?*]/g, ""); // Remove caracteres inválidos

    const fileName = `${Date.now()}-${safeFileName}`;
    
    // Upload para Supabase Storage
    const { error: storageError } = await supabase.storage
      .from("my-files")
      .upload(fileName, file);

    if (storageError) {
      console.error("Storage error:", storageError);
      throw new Error(`Erro ao fazer upload no storage: ${storageError.message}`);
    }

    // Obtém URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("my-files").getPublicUrl(fileName);

    // Salva no banco de dados
    const newFile = await prisma.files.create({
      data: {
        nome: nome || file.name,
        storagePath: publicUrl,
        tipo: extension
      }
    });

    return NextResponse.json(
      { 
        success: true, 
        file: newFile,
        message: `Arquivo ${file.name} enviado com sucesso!`
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao fazer upload";
    return NextResponse.json(
      { error: errorMessage }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const res = await prisma.files.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });
    return Response.json(res, { status: 200 });
  } catch (error) {
    console.error("Fetch error:", error);
    return Response.json(
      { error: "Erro ao buscar arquivos" }, 
      { status: 500 }
    );
  }
}
