## Objetivo
Reposicionar o CurrículoIA para falar diretamente com estudantes e profissionais iniciantes da área de tecnologia (ADS, Engenharia de Software, Ciência da Computação, etc.), mantendo todas as funcionalidades atuais.

## Escopo de Mudanças

### 1. Landing Page — `src/routes/index.tsx`
- **Hero headline**: “Transforme seus projetos em um currículo DEV pronto para vagas júnior e estágio.”
- **Hero subtítulo**: Destacar que a IA adapta o currículo à vaga, organiza projetos acadêmicos, destaca stack e tecnologias — sem inventar experiências.
- **Hero descrição/preview**: Ajustar texto de apoio para mencionar devs, estágio, primeira vaga, transição para tecnologia, GitHub, portfólio.
- **Nav links**: Ajustar rótulos se necessário (manter âncoras #como-funciona, #publico, #app).
- **Seção de fluxo lateral**: Ajustar copy de privacidade/data para manter tom dev-friendly.
- **Section titles do formulário**: Ajustar labels e descrições:
  - “Experiências e projetos” → reforçar projetos acadêmicos, GitHub, portfólio
  - “Vaga alvo” → mencionar vagas de estágio, júnior, trainee em tecnologia
- **Placeholders dos inputs**:
  - Link adicional: “LinkedIn, GitHub ou portfólio”
  - Experiências: “Ex: Projeto em React com consumo de API, autenticação, dashboard e deploy”
  - Descrição da vaga: “Cole aqui a descrição da vaga de estágio, júnior ou trainee em tecnologia”
- **Footer**: Ajustar copy se necessário.

### 2. Prompt da IA — `src/lib/curriculo.functions.ts`
- Atualizar `SYSTEM_PROMPT` para incluir foco em candidatos tech (estudantes de ADS, Engenharia de Software, Ciência da Computação, Sistemas de Informação).
- Reforçar que a IA deve valorizar projetos acadêmicos, GitHub, portfólio, stack e tecnologias.
- Manter regras absolutas: sem inventar empresas, cargos, cursos ou métricas.
- Manter formato XYZ e compatibilidade ATS.

### 3. Metadados SEO — `src/routes/__root.tsx` e `src/routes/index.tsx`
- Atualizar `<title>`, `description`, `og:title`, `og:description` e tags Twitter para refletir o novo posicionamento DEV.
- Incluir termos: projetos acadêmicos, GitHub, portfólio, stack, tecnologias, estágio, vaga júnior, primeira oportunidade, transição para tecnologia, ATS.

### 4. Não será alterado
- Funcionalidades do formulário, validações, geração de PDF, schema Zod, lógica de server function, layout visual e estrutura de componentes.
- Não será adicionada autenticação, histórico ou novas páginas.

## Critérios de Aceitação
- Todos os textos visíveis ao usuário na landing page refletem o público DEV.
- Placeholders dos campos seguem as sugestões fornecidas.
- O prompt da IA mantém rigor factual (não inventa) mas reforça valorização de projetos tech.
- Metadados SEO estão alinhados ao novo posicionamento.
- Build e preview continuam funcionando sem regressões.