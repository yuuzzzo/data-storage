import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const nome = formData.get("nome") as string;
    const extension = formData.get("tipo") as string;

    if (!file)
      return NextResponse.json(
        { error: "Arquivo não enviado" },
        { status: 400 },
      );

    // Valida tamanho do arquivo (50MB máximo)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Arquivo muito grande. Máximo permitido: 50MB. Você enviou: ${(file.size / (1024 * 1024)).toFixed(2)}MB` },
        { status: 413 },
      );
    }
    
    // Sanitiza nome mantendo estrutura válida
    const sanitizedName = file.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .trim();
      
    // Remove apenas caracteres realmente problemáticos (não mantém espaços em branco múltiplos)
    const safeFileName = sanitizedName
      .replace(/\s+/g, "_") // Espaços viram underscores (preserva legibilidade)
      .replace(/[<>:"|?*]/g, ""); // Remove caracteres inválidos em nomes de arquivo
      
    const fileName = `${Date.now()}-${safeFileName}`;
    const { error: storageError } = await supabase.storage
      .from("my-files")
      .upload(fileName, file);

    if (storageError) throw storageError;

    
    const {
      data: { publicUrl },
    } = supabase.storage.from("my-files").getPublicUrl(fileName);

    
    const newFile = await prisma.files.create({
      data: {
        nome: nome || file.name,
        storagePath: publicUrl,
        tipo: extension
      }
    });

    return NextResponse.json(newFile, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 });
  }
}

export async function GET() {
  try{
    const res = await prisma.files.findMany();
    return Response.json(res, {status: 200});
  }catch(error){
    console.error(error);
    return Response.json("Erro ao buscar arquivos", {status: 500 });
  }
}
