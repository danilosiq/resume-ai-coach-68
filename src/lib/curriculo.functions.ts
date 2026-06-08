import { createServerFn } from "@tanstack/react-start";
import { FormSchema, AIResultSchema, type AIResult } from "./curriculo-types";

const SYSTEM_PROMPT = `Você é um assistente especialista em adaptação de currículos para vagas específicas, com foco em pessoas em início de carreira, estudantes, candidatos a estágio, profissionais júnior e em transição de área.

REGRAS ABSOLUTAS:
- NUNCA invente empresas, cargos, cursos, certificações, experiências, métricas ou números.
- Use APENAS as informações reais fornecidas pelo usuário.
- Você pode (e deve) melhorar a escrita, reorganizar e adaptar o texto para a vaga alvo.
- Linguagem profissional, objetiva, compatível com ATS (Applicant Tracking Systems).
- Use o formato XYZ nas descrições:
  X = o que a pessoa fez/estudou
  Y = como fez (ferramentas, métodos, conhecimentos)
  Z = resultado, entrega, aprendizado ou impacto real
- Se não houver resultado mensurável, use aprendizado ou entrega real — sem inventar números.
- Foque o tom em primeira vaga / estágio / júnior / transição.

Retorne SOMENTE um JSON válido (sem markdown, sem comentários) seguindo exatamente este formato:
{
  "name": string,
  "suggestedTitle": string,
  "contacts": { "email": string, "phone": string, "link": string },
  "summary": string,
  "skills": string[],
  "workExperience": [{ "title": string, "period": string, "bullets": string[] }],
  "education": [{ "title": string, "period": string, "description": string }],
  "certifications": [{ "title": string, "period": string, "description": string }],
  "compatibilityScore": number (0-100),
  "strengths": string[],
  "improvements": string[],
  "studyRecommendations": string[],
  "finalReview": string,
  "analysisSummary": string
}`;

function buildUserPrompt(data: ReturnType<typeof FormSchema.parse>) {
  const fmtItem = (i: { title: string; description: string; startDate: string; endDate: string; current: boolean }) =>
    `- ${i.title} (${i.startDate || "?"} — ${i.current ? "Atual" : i.endDate || "?"})\n  ${i.description}`;

  return `DADOS DO CANDIDATO:
Nome: ${data.fullName}
Email: ${data.email}
Telefone: ${data.phone}
Link adicional: ${data.link || "(nenhum)"}

ESTUDOS E CERTIFICAÇÕES:
${data.education.map(fmtItem).join("\n") || "(nenhum)"}

EXPERIÊNCIAS E PROJETOS:
${data.experience.map(fmtItem).join("\n") || "(nenhum)"}

VAGA ALVO:
Link: ${data.jobLink || "(não informado)"}
Descrição: ${data.jobDescription || "(não fornecida — adapte o currículo de forma generalista com base nos dados, e mencione no analysisSummary que a descrição da vaga não foi fornecida)"}

Gere o JSON conforme as regras.`;
}

export const generateCurriculo = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => FormSchema.parse(d))
  .handler(async ({ data }): Promise<AIResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY ausente no servidor.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(data) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) {
      throw new Error("Limite de uso atingido. Tente novamente em instantes.");
    }
    if (res.status === 402) {
      throw new Error("Créditos de IA esgotados. Adicione créditos no workspace.");
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Falha na IA (${res.status}): ${text.slice(0, 200)}`);
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Resposta vazia da IA.");

    let parsed: unknown;
    try {
      parsed = typeof content === "string" ? JSON.parse(content) : content;
    } catch {
      throw new Error("A IA não retornou um JSON válido.");
    }

    return AIResultSchema.parse(parsed);
  });
