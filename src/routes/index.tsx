import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { useFieldArray, useForm, type Control, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, FileText, Sparkles, Download, Loader2, CheckCircle2, AlertCircle, ListChecks, Lightbulb, BookOpen } from "lucide-react";
import { FormSchema, type FormValues, type AIResult } from "@/lib/curriculo-types";
import { generateCurriculo } from "@/lib/curriculo.functions";
import { generatePDF } from "@/lib/pdf";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CurrículoIA — Adapte seu currículo para cada vaga com IA" },
      { name: "description", content: "Ferramenta de IA para criar e adaptar currículos ATS-friendly para vagas específicas. Ideal para estudantes, estágios, primeira vaga e transição de carreira." },
      { property: "og:title", content: "CurrículoIA — Currículo adaptado por IA" },
      { property: "og:description", content: "Adapte seu currículo para cada vaga com IA. ATS-friendly, em segundos." },
    ],
  }),
  component: Page,
});

const emptyItem = { title: "", description: "", startDate: "", endDate: "", current: false };
const defaultValues: FormValues = {
  fullName: "", email: "", phone: "", link: "",
  education: [{ ...emptyItem }],
  experience: [{ ...emptyItem }],
  jobLink: "", jobDescription: "",
};

function Page() {
  const callGenerate = useServerFn(generateCurriculo);
  const [result, setResult] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const eduArr = useFieldArray({ control: form.control, name: "education" });
  const expArr = useFieldArray({ control: form.control, name: "experience" });

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    setLoading(true);
    try {
      const r = await callGenerate({ data: values });
      setResult(r);
      // scroll result into view on mobile
      setTimeout(() => document.getElementById("result-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar currículo.");
    } finally {
      setLoading(false);
    }
  });

  const progress = useMemo(() => {
    const v = form.watch();
    let done = 0;
    if (v.fullName && v.email && v.phone) done++;
    if (v.education.some((e) => e.title)) done++;
    if (v.experience.some((e) => e.title)) done++;
    if (v.jobLink || v.jobDescription) done++;
    return done;
  }, [form.watch()]);

  return (
    <div className="min-h-screen bg-background">
      {/* TOP BAR */}
      <header className="bg-topbar text-topbar-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">CurrículoIA</span>
          </div>
          <nav className="hidden text-sm text-topbar-foreground/70 md:flex items-center gap-6">
            <a href="#como-funciona" className="hover:text-topbar-foreground">Como funciona</a>
            <a href="#publico" className="hover:text-topbar-foreground">Para quem é</a>
            <a href="#app" className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:opacity-90">Começar</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-topbar text-topbar-foreground pb-16">
        <div className="mx-auto max-w-7xl px-6 pt-8 pb-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-topbar-foreground/15 bg-topbar-foreground/5 px-3 py-1 text-xs text-topbar-foreground/80">
                <Sparkles className="h-3 w-3" /> Currículo adaptado por IA
              </span>
              <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                Adapte seu currículo para <span className="text-primary">cada vaga</span> em segundos.
              </h1>
              <p className="mt-4 max-w-xl text-topbar-foreground/70">
                Feito para estudantes, estágios, primeira vaga e transição de carreira. Geramos um currículo ATS-friendly,
                com linguagem profissional e foco real na vaga — sem inventar nada.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#app" className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                  Criar meu currículo <Sparkles className="h-4 w-4" />
                </a>
                <a href="#como-funciona" className="inline-flex items-center gap-2 rounded-md border border-topbar-foreground/20 px-5 py-2.5 text-sm text-topbar-foreground/90 hover:bg-topbar-foreground/5">
                  Como funciona
                </a>
              </div>
            </div>
            <div className="rounded-2xl border border-topbar-foreground/10 bg-topbar-foreground/5 p-6 backdrop-blur">
              <div className="flex items-center justify-between text-xs text-topbar-foreground/60">
                <span>Preview do resultado</span>
                <span className="rounded-full bg-success/20 px-2 py-0.5 text-success">Score 92%</span>
              </div>
              <div className="mt-4 rounded-lg bg-white p-5 text-foreground shadow-2xl">
                <div className="text-xl font-bold">Ana Silva</div>
                <div className="text-sm text-muted-foreground">Desenvolvedora Front-end Júnior</div>
                <div className="mt-1 text-[11px] text-muted-foreground">+55 11 9 9999-0000 • ana@email.com • github.com/ana</div>
                <div className="mt-4 text-[11px] font-bold uppercase tracking-wider">Summary</div>
                <div className="h-px bg-border my-1" />
                <div className="text-xs text-muted-foreground">Estudante de Análise de Sistemas com projetos em React e foco em desenvolver interfaces acessíveis…</div>
                <div className="mt-3 text-[11px] font-bold uppercase tracking-wider">Skills</div>
                <div className="h-px bg-border my-1" />
                <div className="text-xs text-muted-foreground">React • TypeScript • Tailwind • Git • Acessibilidade</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* APP */}
      <main id="app" className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)_minmax(0,420px)]">
          {/* SIDE FLOW */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-xl border bg-card p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fluxo</div>
              <ol className="mt-4 space-y-3 text-sm">
                <StepItem n={1} label="Dados pessoais" done={progress >= 1} />
                <StepItem n={2} label="Estudos" done={progress >= 2} />
                <StepItem n={3} label="Experiências" done={progress >= 3} />
                <StepItem n={4} label="Vaga alvo" done={progress >= 4} />
                <StepItem n={5} label="Análise IA" done={!!result} />
              </ol>
              <div className="mt-5 rounded-md bg-muted p-3 text-xs text-muted-foreground">
                Não criamos conta, não salvamos histórico. Seus dados ficam no seu navegador.
              </div>
            </div>
          </aside>

          {/* FORM */}
          <form onSubmit={onSubmit} className="space-y-6">
            <Section title="Dados pessoais" icon={<FileText className="h-4 w-4" />}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nome completo" error={form.formState.errors.fullName?.message}>
                  <input {...form.register("fullName")} className="input" placeholder="Seu nome completo" />
                </Field>
                <Field label="Email" error={form.formState.errors.email?.message}>
                  <input type="email" {...form.register("email")} className="input" placeholder="voce@email.com" />
                </Field>
                <Field label="Telefone" error={form.formState.errors.phone?.message}>
                  <input {...form.register("phone")} className="input" placeholder="+55 11 9 9999-9999" />
                </Field>
                <Field label="Link adicional (LinkedIn, GitHub, portfólio)">
                  <input {...form.register("link")} className="input" placeholder="https://..." />
                </Field>
              </div>
            </Section>

            <Section title="Estudos e certificações" icon={<BookOpen className="h-4 w-4" />}>
              <ItemList
                items={eduArr.fields}
                onAdd={() => eduArr.append({ ...emptyItem })}
                onRemove={(i) => eduArr.remove(i)}
                register={form.register}
                control={form.control}
                name="education"
                titleLabel="Nome do curso / formação / certificação"
              />
            </Section>

            <Section title="Experiências e projetos" icon={<ListChecks className="h-4 w-4" />}>
              <ItemList
                items={expArr.fields}
                onAdd={() => expArr.append({ ...emptyItem })}
                onRemove={(i) => expArr.remove(i)}
                register={form.register}
                control={form.control}
                name="experience"
                titleLabel="Cargo / projeto / experiência"
              />
            </Section>

            <Section title="Vaga alvo" icon={<Sparkles className="h-4 w-4" />}>
              <div className="space-y-4">
                <Field label="Link da vaga no LinkedIn">
                  <input {...form.register("jobLink")} className="input" placeholder="https://www.linkedin.com/jobs/view/..." />
                </Field>
                <Field label="Descrição da vaga (cole aqui se preferir, ou se o link não puder ser lido)">
                  <textarea {...form.register("jobDescription")} className="input min-h-[140px]" placeholder="Cole a descrição completa da vaga aqui..." />
                </Field>
                <p className="text-xs text-muted-foreground">
                  Não conseguimos ler links do LinkedIn automaticamente (eles bloqueiam acesso). Cole a descrição da vaga para obter o melhor resultado.
                </p>
              </div>
            </Section>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60 md:w-auto"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? "Gerando com IA..." : "Gerar currículo com IA"}
            </button>
          </form>

          {/* RESULT */}
          <aside id="result-panel" className="lg:sticky lg:top-6 lg:self-start">
            <ResultPanel result={result} loading={loading} />
          </aside>
        </div>
      </main>

      <footer className="border-t bg-card/50">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-xs text-muted-foreground">
          CurrículoIA — feito para quem está construindo carreira. Os dados não são salvos.
        </div>
      </footer>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--input);
          background: var(--card);
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: var(--foreground);
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .input:focus {
          border-color: var(--ring);
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--ring) 25%, transparent);
        }
      `}</style>
    </div>
  );
}

function StepItem({ n, label, done }: { n: number; label: string; done: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
      </span>
      <span className={done ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </li>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-6">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-accent-foreground">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs font-medium text-foreground">{label}</div>
      {children}
      {error && <div className="mt-1 text-xs text-destructive">{error}</div>}
    </label>
  );
}

function ItemList({
  items, onAdd, onRemove, register, control, name, titleLabel,
}: {
  items: { id: string }[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  register: UseFormRegister<FormValues>;
  control: Control<FormValues>;
  name: "education" | "experience";
  titleLabel: string;
}) {
  void control;
  return (
    <div className="space-y-4">
      {items.map((field, i) => (
        <div key={field.id} className="rounded-lg border bg-muted/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-medium text-muted-foreground">Item {i + 1}</div>
            {items.length > 1 && (
              <button type="button" onClick={() => onRemove(i)} className="inline-flex items-center gap-1 text-xs text-destructive hover:underline">
                <Trash2 className="h-3.5 w-3.5" /> Remover
              </button>
            )}
          </div>
          <div className="grid gap-3">
            <Field label={titleLabel}>
              <input {...register(`${name}.${i}.title` as const)} className="input" />
            </Field>
            <Field label="Descrição (será adaptada pela IA)">
              <textarea {...register(`${name}.${i}.description` as const)} className="input min-h-[80px]" placeholder="Descreva o que fez, ferramentas usadas, resultados ou aprendizados..." />
            </Field>
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="Início">
                <input type="month" {...register(`${name}.${i}.startDate` as const)} className="input" />
              </Field>
              <Field label="Fim">
                <input type="month" {...register(`${name}.${i}.endDate` as const)} className="input" />
              </Field>
              <label className="flex items-end gap-2 pb-2 text-sm">
                <input type="checkbox" {...register(`${name}.${i}.current` as const)} className="h-4 w-4 rounded border-input" />
                Atual
              </label>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={onAdd} className="inline-flex items-center gap-2 rounded-md border border-dashed border-input px-3 py-2 text-sm text-muted-foreground hover:bg-accent">
        <Plus className="h-4 w-4" /> Adicionar item
      </button>
    </div>
  );
}

function ResultPanel({ result, loading }: { result: AIResult | null; loading: boolean }) {
  if (loading && !result) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> A IA está analisando seu currículo...
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-32 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-xl border border-dashed bg-card p-6 text-center">
        <Sparkles className="mx-auto h-6 w-6 text-muted-foreground" />
        <div className="mt-2 text-sm font-medium">Resultado aparece aqui</div>
        <p className="mt-1 text-xs text-muted-foreground">Preencha o formulário e clique em "Gerar currículo com IA".</p>
      </div>
    );
  }

  const scoreColor =
    result.compatibilityScore >= 75 ? "text-success" :
    result.compatibilityScore >= 50 ? "text-primary" : "text-destructive";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Compatibilidade com a vaga</div>
        <div className={`mt-1 text-4xl font-bold ${scoreColor}`}>{result.compatibilityScore}%</div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className={`h-full rounded-full ${result.compatibilityScore >= 75 ? "bg-success" : result.compatibilityScore >= 50 ? "bg-primary" : "bg-destructive"}`} style={{ width: `${result.compatibilityScore}%` }} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{result.analysisSummary}</p>
      </div>

      <ResultBlock title="Pontos fortes" icon={<CheckCircle2 className="h-4 w-4 text-success" />} items={result.strengths} />
      <ResultBlock title="Pontos a melhorar" icon={<AlertCircle className="h-4 w-4 text-destructive" />} items={result.improvements} />
      <ResultBlock title="Sugestões de estudo" icon={<Lightbulb className="h-4 w-4 text-primary" />} items={result.studyRecommendations} />

      <div className="rounded-xl border bg-card p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Review final</div>
        <p className="mt-2 text-sm text-muted-foreground">{result.finalReview}</p>
      </div>

      {/* CV PREVIEW */}
      <div className="rounded-xl border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preview do currículo</div>
          <button
            onClick={() => generatePDF(result)}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            <Download className="h-3.5 w-3.5" /> Baixar PDF
          </button>
        </div>
        <CVPreview r={result} />
      </div>
    </div>
  );
}

function ResultBlock({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {title}
      </div>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2"><span className="text-muted-foreground">•</span><span>{it}</span></li>
        ))}
      </ul>
    </div>
  );
}

function CVPreview({ r }: { r: AIResult }) {
  return (
    <div className="rounded-lg bg-white p-5 text-[#111] shadow-inner ring-1 ring-border">
      <div className="text-xl font-bold leading-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>{r.name}</div>
      <div className="text-sm">{r.suggestedTitle}</div>
      <div className="mt-1 text-[11px] text-neutral-600">
        {[r.contacts.phone, r.contacts.email, r.contacts.link].filter(Boolean).join("  •  ")}
      </div>

      <CVSection title="Summary"><p className="text-xs">{r.summary}</p></CVSection>
      <CVSection title="Skills"><p className="text-xs">{r.skills.join(" • ")}</p></CVSection>

      <CVSection title="Work Experience">
        {r.workExperience.map((w, i) => (
          <div key={i} className="mb-2">
            <div className="text-xs font-semibold">{w.title}</div>
            {w.period && <div className="text-[11px] text-neutral-600">{w.period}</div>}
            <ul className="ml-4 list-disc text-xs">
              {w.bullets.map((b, j) => <li key={j}>{b}</li>)}
            </ul>
          </div>
        ))}
      </CVSection>

      <CVSection title="Education">
        {r.education.map((e, i) => (
          <div key={i} className="mb-2">
            <div className="text-xs font-semibold">{e.title}</div>
            {e.period && <div className="text-[11px] text-neutral-600">{e.period}</div>}
            {e.description && <div className="text-xs">{e.description}</div>}
          </div>
        ))}
      </CVSection>

      {r.certifications.length > 0 && (
        <CVSection title="Certifications">
          {r.certifications.map((c, i) => (
            <div key={i} className="mb-2">
              <div className="text-xs font-semibold">{c.title}</div>
              {c.period && <div className="text-[11px] text-neutral-600">{c.period}</div>}
              {c.description && <div className="text-xs">{c.description}</div>}
            </div>
          ))}
        </CVSection>
      )}
    </div>
  );
}

function CVSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <div className="text-[11px] font-bold uppercase tracking-widest">{title}</div>
      <div className="my-1 h-px bg-neutral-300" />
      {children}
    </div>
  );
}
