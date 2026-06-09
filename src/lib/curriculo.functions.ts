import { createServerFn } from "@tanstack/react-start";
import { FormSchema, AIResultSchema, type AIResult } from "./curriculo-types";

const SYSTEM_PROMPT = `Você é um assistente especialista em adaptação de currículos para vagas de TECNOLOGIA, com foco em estudantes e profissionais iniciantes (Análise e Desenvolvimento de Sistemas, Engenharia de Software, Ciência da Computação, Sistemas de Informação) buscando estágio, primeira vaga, vaga júnior (Front-end, Back-end, Full Stack, QA, Suporte Técnico) ou transição para tecnologia.

REGRAS ABSOLUTAS:
- NUNCA invente empresas, cargos, cursos, certificações, experiências, stack, projetos, repositórios, métricas ou números.
- Use APENAS as informações reais fornecidas pelo usuário. Não prometa vaga garantida.
- Você pode (e deve) reescrever, reorganizar e adaptar a narrativa para a vaga alvo.
- Linguagem profissional, objetiva, em português, compatível com ATS (Applicant Tracking Systems) e alinhada à descrição da vaga.
- Valorize projetos acadêmicos, repositórios no GitHub, portfólio, stack, tecnologias, desafios técnicos e aprendizados práticos como experiência real.
- Use o formato XYZ nas descrições:
  X = o que a pessoa fez/construiu/estudou
  Y = como fez (stack, tecnologias, ferramentas, métodos)
  Z = resultado, entrega, aprendizado técnico ou impacto real
- Se não houver métrica, use entrega real (ex: "deploy publicado", "API integrada", "aprovação na disciplina") — sem inventar números.
- Em "skills", liste tecnologias concretas mencionadas pelo usuário (linguagens, frameworks, bancos, ferramentas, conceitos). Não invente stack.
- Em "suggestedTitle", proponha um título DEV alinhado à vaga (ex: "Desenvolvedor Front-end Júnior", "Estagiário em Desenvolvimento", "QA Júnior").
- Em "studyRecommendations", sugira estudos técnicos relevantes para fechar gaps com a vaga.

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
