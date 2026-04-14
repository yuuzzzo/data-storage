import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ILinks {
  url: string;
  titulo?: string;
}

export async function POST(request: Request) {
  try {
    const body: ILinks = await request.json();
    const { url, titulo } = body;

    if (!url) {
      return new Response(JSON.stringify({ error: "URL é obrigatória" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const newLink = await prisma.link.create({
      data: {
        url,
        titulo,
      },
    });

    return new Response(JSON.stringify(newLink), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Erro ao criar Link" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(request: Request) {
  try {
    const linksList = await prisma.link.findMany({ orderBy: { createdAt: "desc" } });
    return new Response(JSON.stringify(linksList), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Erro ao buscar todos os links" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
