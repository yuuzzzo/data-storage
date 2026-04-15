import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { supabaseServer } from "../../lib/supabaseServer";
import { ALLOWED_EXTENSIONS, getFileExtension } from "../../lib/fileUtils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nome = String(body.nome ?? "").trim();
    const fileName = String(body.fileName ?? "").trim();
    const tipo = String(body.tipo ?? "")
      .toLowerCase()
      .trim();

    if (!fileName) {
      return NextResponse.json(
        { error: "O nome do arquivo no storage não foi informado." },
        { status: 400 },
      );
    }

    if (!nome) {
      return NextResponse.json(
        { error: "O nome exibido do arquivo não foi informado." },
        { status: 400 },
      );
    }

    if (!tipo || !ALLOWED_EXTENSIONS.includes(tipo)) {
      return NextResponse.json(
        { error: `Tipo de arquivo não permitido: .${tipo}` },
        { status: 415 },
      );
    }

    const extensionFromFileName = getFileExtension(fileName);
    if (extensionFromFileName !== tipo) {
      return NextResponse.json(
        { error: "A extensão do arquivo não corresponde ao tipo informado." },
        { status: 400 },
      );
    }

    if (
      fileName.includes("..") ||
      fileName.includes("\\") ||
      fileName.includes("//")
    ) {
      return NextResponse.json(
        { error: "Nome do arquivo inválido." },
        { status: 400 },
      );
    }

    const { data } = supabaseServer.storage
      .from("my-files")
      .getPublicUrl(fileName);

    if (!data?.publicUrl) {
      console.error("Public URL not available for file:", fileName);
      return NextResponse.json(
        { error: "Não foi possível obter a URL pública do arquivo." },
        { status: 500 },
      );
    }

    const newFile = await prisma.files.create({
      data: {
        nome,
        storagePath: data.publicUrl,
        tipo,
      },
    });

    return NextResponse.json({ success: true, file: newFile }, { status: 201 });
  } catch (error) {
    console.error("Upload metadata error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro desconhecido ao salvar metadados";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    const files = await prisma.files.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(files, { status: 200 });
  } catch (error) {
    console.error("Fetch error:", error);
    return Response.json({ error: "Erro ao buscar arquivos" }, { status: 500 });
  }
}
