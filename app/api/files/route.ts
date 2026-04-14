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

    
    const sanitizedName = file.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.-]/g, "");
    const fileName = `${Date.now()}-${sanitizedName}`;
    const { data: storageData, error: storageError } = await supabase.storage
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

export async function GET(request: Request) {
  try{
    const res = await prisma.files.findMany();
    return Response.json(res, {status: 200});
  }catch(error){
    console.error(error);
    return Response.json("Erro ao buscar arquivos", {status: 500 });
  }
}
