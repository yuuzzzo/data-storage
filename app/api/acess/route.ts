import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();
const secret = process.env.ACCESS_SECRET_KEY || process.env.NEXTAUTH_SECRET || "default-access-secret-key-1234567890";
const key = crypto.scryptSync(secret, "acess-salt", 32);

function encryptPassword(password: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(password, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

function decryptPassword(encrypted: string) {
  const [ivHex, tagHex, encryptedText] = encrypted.split(":");
  if (!ivHex || !tagHex || !encryptedText) return "";

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(tagHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedText, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}

interface IAcess {
  servico: string;
  usuario: string;
  senha: string;
}

export async function POST(request: Request) {
  try {
    const body: IAcess = await request.json();
    const { servico, usuario, senha } = body;

    if (!servico || !usuario || !senha) {
      return new Response(JSON.stringify({ error: "Todos os campos são obrigatórios." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const encryptedSenha = encryptPassword(senha);
    const newAcess = await prisma.acess.create({
      data: {
        servico,
        usuario,
        senha: encryptedSenha,
      },
    });

    return new Response(JSON.stringify({ ...newAcess, senha: senha }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Erro ao salvar acesso." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(request: Request) {
  try {
    const acessos = await prisma.acess.findMany({ orderBy: { createdAt: "desc" } });
    const decrypted = acessos.map((item) => ({
      ...item,
      senha: decryptPassword(item.senha),
    }));

    return new Response(JSON.stringify(decrypted), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Erro ao buscar acessos." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
