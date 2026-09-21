s// Guarda e devolve os dados do painel (financeiro/positivacao/estoque) num
// "Netlify Blob" - um armazenamento simples compartilhado por todo mundo que
// acessa o site, sem precisar de banco de dados separado.
import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("painel-hhb-dados");

  if (req.method === "GET") {
    const dados = await store.get("atual", { type: "json" });
    return new Response(JSON.stringify(dados || {}), {
      headers: { "Content-Type": "application/json" }
    });
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ erro: "JSON invalido" }), { status: 400 });
    }
    const { tipo, dados, info } = body || {};
    if (tipo !== "financeiro" && tipo !== "estoque") {
      return new Response(JSON.stringify({ erro: "tipo invalido" }), { status: 400 });
    }
    const atual = (await store.get("atual", { type: "json" })) || {};
    atual[tipo] = { dados, info: info || null, atualizadoEm: new Date().toISOString() };
    await store.setJSON("atual", atual);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/dados" };
