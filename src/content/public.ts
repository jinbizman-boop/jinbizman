import type { Locale } from "./locales";

export type ProjectStatus = "development" | "planning" | "validation";

export interface ProjectItem {
  slug: string;
  name: string;
  category: string;
  summary: string;
  status: ProjectStatus;
  image: string;
  points: string[];
}

export interface PublicCopy {
  nav: { company: string; business: string; newsletter: string; contact: string; search: string };
  hero: { kicker: string; title: string; subtitle: string; primary: string; secondary: string };
  proof: { label: string; value: string }[];
  why: { eyebrow: string; title: string; body: string };
  execution: { eyebrow: string; title: string; body: string; steps: string[] };
  matrix: { eyebrow: string; title: string; body: string; tracks: { id: string; title: string; summary: string; tags: string[] }[] };
  eureka: { eyebrow: string; title: string; body: string; points: string[]; cta: string };
  projectsTitle: string;
  domainsTitle: string;
  cybertron: { eyebrow: string; title: string; body: string };
  activity: { eyebrow: string; title: string; body: string };
  trust: { eyebrow: string; title: string; body: string };
  cta: { title: string; body: string; button: string };
  company: {
    kicker: string; title: string; introTitle: string; intro: string; missionTitle: string; mission: string; visionTitle: string; vision: string;
    valuesTitle: string; values: { title: string; body: string }[]; factsTitle: string; historyTitle: string; policyTitle: string; policy: string;
  };
  business: {
    kicker: string; title: string; intro: string; tracksTitle: string; domainsTitle: string; cybertronTitle: string; cybertronBody: string; howTitle: string; how: string[];
  };
  newsletter: { kicker: string; title: string; body: string; empty: string };
  contact: { kicker: string; title: string; body: string; type: string; name: string; company: string; email: string; phone: string; message: string; submit: string; success: string; error: string };
  footer: { statement: string; privacy: string; terms: string; family: string };
}

const commonProjects: Record<Locale, ProjectItem[]> = {
  ko: [
    { slug: "eureka-world", name: "Eureka World", category: "Flagship AI Service", summary: "문서·디자인·콘텐츠·프로젝트 흐름을 작업 지시에서 결과물까지 연결하는 작업 중심 AI 서비스.", status: "development", image: "/assets/images/source/eureka-workspace.webp", points: ["Office / Design / Create / Security", "결과물 중심 작업 흐름", "프로젝트·ERP 연결"] },
    { slug: "salary-captive", name: "급여납치", category: "Life Service", summary: "급여·소비 흐름과 생활 패턴을 이해해 지출관리, 습관, 자기계발을 연결하는 생활관리 플랫폼.", status: "planning", image: "/assets/images/home/business-life-service.webp", points: ["급여·지출 대시보드", "소비 성향 분석", "습관·목표 관리"] },
    { slug: "all-evaluations", name: "모든평가", category: "Community Data", summary: "사용자 기준형 평가와 리뷰·반응 데이터를 구조화해 더 깊은 판단과 분석 리포트로 연결하는 평가 커뮤니티.", status: "validation", image: "/assets/images/home/portfolio-ai.webp", points: ["평가판·리뷰·요청", "랭킹·신뢰도", "상세 분석 리포트"] },
    { slug: "new-retro-games", name: "New Retro Games", category: "Game Experience", summary: "여러 장르의 플레이 경험과 서버 검증 결과를 플레이어 성향·보상·미션·랭킹으로 연결하는 멀티게임 플랫폼.", status: "development", image: "/assets/images/source/connected-platform.webp", points: ["통합 게임 허브", "서버 권위형 결과", "플레이어 행동 모델"] },
  ],
  en: [
    { slug: "eureka-world", name: "Eureka World", category: "Flagship AI Service", summary: "A work-oriented AI service that turns instructions into documents, design, content and connected project outcomes.", status: "development", image: "/assets/images/source/eureka-workspace.webp", points: ["Office / Design / Create / Security", "Outcome-first workflows", "Project and ERP connection"] },
    { slug: "salary-captive", name: "Salary Hijacking", category: "Life Service", summary: "A personal life-management platform connecting salary, spending patterns, habits and self-development.", status: "planning", image: "/assets/images/home/business-life-service.webp", points: ["Income and expense dashboard", "Behavior insight", "Habit and goal management"] },
    { slug: "all-evaluations", name: "All Review", category: "Community Data", summary: "A community platform that structures user-defined evaluation criteria, reviews and reactions into deeper insight.", status: "validation", image: "/assets/images/home/portfolio-ai.webp", points: ["Reviews and requests", "Trust and ranking", "Analytical reports"] },
    { slug: "new-retro-games", name: "New Retro Games", category: "Game Experience", summary: "A multi-game platform connecting verified play results with player traits, rewards, missions and rankings.", status: "development", image: "/assets/images/source/connected-platform.webp", points: ["Unified game hub", "Server-authoritative results", "Player behavior model"] },
  ],
  ja: [
    { slug: "eureka-world", name: "Eureka World", category: "Flagship AI Service", summary: "文書・デザイン・コンテンツ・プロジェクトを、作業指示から成果物までつなぐワーク中心のAIサービス。", status: "development", image: "/assets/images/source/eureka-workspace.webp", points: ["Office / Design / Create / Security", "成果物中心のワークフロー", "Project・ERP連携"] },
    { slug: "salary-captive", name: "給与誘拐", category: "Life Service", summary: "給与・消費・生活パターンを理解し、支出管理・習慣・自己成長につなぐ生活管理プラットフォーム。", status: "planning", image: "/assets/images/home/business-life-service.webp", points: ["収支ダッシュボード", "行動インサイト", "習慣・目標管理"] },
    { slug: "all-evaluations", name: "すべての評価", category: "Community Data", summary: "ユーザー定義の評価基準、レビュー、反応データを構造化し、より深い判断と分析につなぐコミュニティ。", status: "validation", image: "/assets/images/home/portfolio-ai.webp", points: ["レビュー・リクエスト", "信頼・ランキング", "分析レポート"] },
    { slug: "new-retro-games", name: "New Retro Games", category: "Game Experience", summary: "複数ジャンルのプレイ結果を、プレイヤー特性・報酬・ミッション・ランキングにつなぐマルチゲームプラットフォーム。", status: "development", image: "/assets/images/source/connected-platform.webp", points: ["統合ゲームハブ", "サーバー検証", "行動モデル"] },
  ],
  fr: [
    { slug: "eureka-world", name: "Eureka World", category: "Flagship AI Service", summary: "Un service d’IA orienté travail reliant les instructions aux documents, designs, contenus et résultats de projet.", status: "development", image: "/assets/images/source/eureka-workspace.webp", points: ["Office / Design / Create / Security", "Flux orientés résultats", "Connexion projet et ERP"] },
    { slug: "salary-captive", name: "Salary Hijacking", category: "Life Service", summary: "Une plateforme de gestion quotidienne reliant salaire, dépenses, habitudes et développement personnel.", status: "planning", image: "/assets/images/home/business-life-service.webp", points: ["Tableau revenus-dépenses", "Analyse comportementale", "Habitudes et objectifs"] },
    { slug: "all-evaluations", name: "All Review", category: "Community Data", summary: "Une communauté qui structure critères, avis et réactions pour produire une compréhension plus profonde.", status: "validation", image: "/assets/images/home/portfolio-ai.webp", points: ["Avis et demandes", "Confiance et classement", "Rapports analytiques"] },
    { slug: "new-retro-games", name: "New Retro Games", category: "Game Experience", summary: "Une plateforme multijeux reliant résultats vérifiés, profils joueurs, récompenses, missions et classements.", status: "development", image: "/assets/images/source/connected-platform.webp", points: ["Hub de jeux", "Résultats vérifiés serveur", "Modèle comportemental"] },
  ],
  es: [
    { slug: "eureka-world", name: "Eureka World", category: "Flagship AI Service", summary: "Un servicio de IA orientado al trabajo que conecta instrucciones con documentos, diseño, contenido y resultados de proyecto.", status: "development", image: "/assets/images/source/eureka-workspace.webp", points: ["Office / Design / Create / Security", "Flujos centrados en resultados", "Conexión con proyectos y ERP"] },
    { slug: "salary-captive", name: "Salary Hijacking", category: "Life Service", summary: "Una plataforma de gestión personal que conecta salario, gasto, hábitos y desarrollo personal.", status: "planning", image: "/assets/images/home/business-life-service.webp", points: ["Panel de ingresos y gastos", "Análisis de comportamiento", "Hábitos y objetivos"] },
    { slug: "all-evaluations", name: "All Review", category: "Community Data", summary: "Una comunidad que estructura criterios, reseñas y reacciones para producir decisiones y análisis más profundos.", status: "validation", image: "/assets/images/home/portfolio-ai.webp", points: ["Reseñas y solicitudes", "Confianza y ranking", "Informes analíticos"] },
    { slug: "new-retro-games", name: "New Retro Games", category: "Game Experience", summary: "Una plataforma multijuego que conecta resultados verificados con perfiles, recompensas, misiones y rankings.", status: "development", image: "/assets/images/source/connected-platform.webp", points: ["Hub unificado", "Resultados validados por servidor", "Modelo de comportamiento"] },
  ],
};

export const projectsByLocale = commonProjects;

const copies: Record<Locale, PublicCopy> = {
  ko: {
    nav: { company: "회사소개", business: "사업소개", newsletter: "뉴스레터", contact: "문의하기", search: "통합검색" },
    hero: { kicker: "상상과 아이디어를 현실로 만드는 기업", title: "사람은 상상력과 창의력을\nAI는 전문성과 실행력을", subtitle: "당신의 창의력이 빛날 수 있도록 초원이 되어드립니다.", primary: "사업소개 보기", secondary: "회사소개 보기" },
    proof: [{ value: "3", label: "Current Execution Tracks" }, { value: "4", label: "Active Projects" }, { value: "5", label: "Future Business Domains" }, { value: "5", label: "Official Languages" }],
    why: { eyebrow: "WHY JINBIZ", title: "아이디어가 현실이 되기까지의 장벽을 낮춥니다", body: "진비즈 매니지먼트는 사람의 상상력과 판단에 AI의 전문적인 실행력을 연결해 자본·인력·기술의 장벽을 낮추고, 아이디어를 실제 서비스와 운영으로 이어지게 합니다." },
    execution: { eyebrow: "JINBIZ INTELLIGENCE FLOW", title: "상상을 구조로, 구조를 실행으로", body: "아이디어를 단순한 문장으로 남기지 않고 이해·구조화·지능화·실행·결과·확장의 흐름으로 전환합니다.", steps: ["Imagination", "Structure", "Intelligence", "Execution", "Output", "Expansion"] },
    matrix: { eyebrow: "EXECUTION MATRIX", title: "현재 사업을 움직이는 세 가지 실행축", body: "AI가 중심 엔진이고, 플랫폼이 확장 구조이며, 기획 역량이 복잡한 문제를 실행 가능한 구조로 정리합니다.", tracks: [
      { id: "01", title: "AI Service", summary: "작업 지시를 문서·디자인·콘텐츠·프로젝트 결과물로 연결하는 실행형 AI 서비스.", tags: ["Eureka World", "UHDM", "Agentic Workflow"] },
      { id: "02", title: "Platform Business", summary: "생활형 문제와 산업 혁신 과제를 실제 서비스 경험과 데이터 흐름으로 전환합니다.", tags: ["Life Service", "Community", "Simulation"] },
      { id: "03", title: "Planning Foundation", summary: "시장·사업·서비스·문서·프레젠테이션을 조사와 근거에서 실행 결과까지 구조화합니다.", tags: ["Strategy", "PM", "Proposal"] },
    ] },
    eureka: { eyebrow: "FLAGSHIP AI SERVICE", title: "Eureka World — 작업이 실제 결과물로 이어지는 AI Workspace", body: "단순 응답을 넘어 사용자의 의도를 이해하고 작업을 계획·라우팅·실행·검토해 문서, 디자인, 콘텐츠와 프로젝트 자산으로 연결합니다.", points: ["Office — 문서·분석", "Design — UI·시각화", "Create — 콘텐츠·창작", "Security — 검증·보안"], cta: "Eureka World 보기" },
    projectsTitle: "현재 진행 중인 프로젝트",
    domainsTitle: "미래 산업을 연결하는 5대 사업군",
    cybertron: { eyebrow: "CYBERTRON PROJECT", title: "각 사업군을 하나의 시스템으로 연결하는 미래 산업 융합 비전", body: "인공지능은 뇌, 신소재는 골격, 에너지는 심장, 국방기술은 방패, 생활복지는 감각이라는 역할로 연결됩니다. 현재 운영 사업과 구분된 중장기 확장 포트폴리오입니다." },
    activity: { eyebrow: "NOW AT JINBIZ", title: "현재의 변화와 작업을 공식 기록으로 남깁니다", body: "완료되지 않은 것을 완료했다고 말하지 않고, 개발·기획·검증 상태를 구분해 뉴스와 프로젝트 업데이트로 공개합니다." },
    trust: { eyebrow: "ENTERPRISE TRUST", title: "과장보다 근거, 기능보다 연결", body: "공개 가능한 회사정보, 프로젝트 상태, 운영 기준과 데이터 흐름을 일관되게 관리합니다. 내부 ERP는 문의부터 WBS·결재·평가 근거까지 같은 실행 데이터를 사용합니다." },
    cta: { title: "함께 만들 다음 단계를 찾고 계신가요?", body: "AI 서비스, 플랫폼 협업, 사업 아이디어 고도화가 필요하다면 진비즈 매니지먼트와 이야기를 시작해보세요.", button: "문의하기" },
    company: {
      kicker: "ABOUT JINBIZ", title: "상상과 아이디어가 현실이 되는 실행 환경을 만듭니다", introTitle: "상상은 많지만, 현실이 되는 아이디어는 많지 않습니다.", intro: "아이디어가 실행으로 이어지는 과정에는 자본, 인력, 기술이라는 현실적인 장벽이 있습니다. 진비즈 매니지먼트는 작은 실행 단위와 AI 기반 생산성, 구조화된 운영 체계로 이 장벽을 낮춥니다.",
      missionTitle: "MISSION", mission: "상상과 아이디어가 자본·인력·기술의 한계에 막히지 않도록 합니다.", visionTitle: "VISION", vision: "사람은 창의와 판단에 집중하고, AI는 전문적인 작업과 실행을 담당하는 새로운 일의 표준을 만듭니다.",
      valuesTitle: "CORE VALUES", values: [{ title: "실용성", body: "보여주기보다 실제로 작동하고 검증 가능한 구조를 만듭니다." }, { title: "명확성", body: "복잡한 기술과 요구를 이해 가능한 언어와 구조로 정리합니다." }, { title: "실행력", body: "기획에서 끝나지 않고 화면·기능·데이터·운영으로 연결합니다." }],
      factsTitle: "회사정보", historyTitle: "연혁 및 공개 원칙", policyTitle: "현재 상태를 과장하지 않고 공개합니다.", policy: "개발 중·기획 중·프로토타입 검증 중을 출시·운영과 명확히 구분하고, 확인되지 않은 수치·수상·협력·성과를 공식 정보처럼 만들지 않습니다."
    },
    business: { kicker: "BUSINESS", title: "인공지능을 중심 엔진으로, 미래 산업을 연결하는 사업 구조를 설계합니다", intro: "현재의 세 가지 실행축과 중장기 5대 사업군, 그리고 Cybertron 통합 비전을 서로 다른 층위로 명확히 구분합니다.", tracksTitle: "현재 실행 구조", domainsTitle: "중장기 확장 포트폴리오", cybertronTitle: "Cybertron Project", cybertronBody: "5대 사업군을 독립된 나열이 아니라 하나의 미래 산업 시스템으로 연결합니다.", howTitle: "How We Work", how: ["문제 정의", "리서치", "구조 설계", "AI·플랫폼 실행", "검증", "운영·확장"] },
    newsletter: { kicker: "NEWSROOM", title: "공식 소식과 현재의 작업을 기록합니다", body: "기업 소식, 공지, IR·공시, 채용, 자료실과 프로젝트 업데이트를 언어별 발행 상태와 함께 관리합니다.", empty: "현재 이 언어로 공개된 소식이 없습니다." },
    contact: { kicker: "CONTACT", title: "다음 실행을 함께 설계합니다", body: "AI 서비스, 플랫폼 사업, 협업 방식에 대해 필요한 내용을 남겨주시면 확인 후 안내드립니다.", type: "문의 유형", name: "이름", company: "회사명 또는 소속", email: "이메일", phone: "연락처", message: "문의 내용", submit: "문의 보내기", success: "문의가 정상적으로 접수되었습니다.", error: "문의 접수에 실패했습니다. 입력값 또는 연결 상태를 확인해주세요." },
    footer: { statement: "사람의 상상력과 창의력에 AI의 전문성과 실행력을 연결합니다.", privacy: "개인정보처리방침", terms: "이용약관", family: "Family Site" },
  },
  en: {
    nav: { company: "Company", business: "Business", newsletter: "Newsroom", contact: "Contact", search: "Search" },
    hero: { kicker: "TURNING IMAGINATION INTO REALITY", title: "Human imagination and creativity\nAI expertise and execution", subtitle: "A field where your creativity can shine.", primary: "Explore business", secondary: "About JINBIZ" },
    proof: [{ value: "3", label: "Current Execution Tracks" }, { value: "4", label: "Active Projects" }, { value: "5", label: "Future Business Domains" }, { value: "5", label: "Official Languages" }],
    why: { eyebrow: "WHY JINBIZ", title: "Lowering the barriers between ideas and real execution", body: "JINBIZ MANAGEMENT connects human imagination and judgment with AI execution to reduce the barriers of capital, people and technology — moving ideas into real services and operations." },
    execution: { eyebrow: "JINBIZ INTELLIGENCE FLOW", title: "From imagination to structure, from structure to execution", body: "Ideas move through a repeatable system of understanding, structuring, intelligence, execution, output and expansion.", steps: ["Imagination", "Structure", "Intelligence", "Execution", "Output", "Expansion"] },
    matrix: { eyebrow: "EXECUTION MATRIX", title: "Three tracks that drive current business", body: "AI is the engine, platforms are the expansion structure, and planning turns complex problems into executable systems.", tracks: [
      { id: "01", title: "AI Service", summary: "Work-oriented AI that turns instructions into documents, design, content and project outcomes.", tags: ["Eureka World", "UHDM", "Agentic Workflow"] },
      { id: "02", title: "Platform Business", summary: "Platforms that transform everyday and industrial problems into services and measurable data flows.", tags: ["Life Service", "Community", "Simulation"] },
      { id: "03", title: "Planning Foundation", summary: "Research, strategy, service design and communication structured from evidence to execution.", tags: ["Strategy", "PM", "Proposal"] },
    ] },
    eureka: { eyebrow: "FLAGSHIP AI SERVICE", title: "Eureka World — an AI workspace where work becomes real output", body: "Beyond chat, Eureka World understands intent, plans and routes work, executes and reviews tasks, then connects results to documents, design, content and project assets.", points: ["Office — documents & analysis", "Design — UI & visualization", "Create — content & creation", "Security — quality & protection"], cta: "Explore Eureka World" },
    projectsTitle: "Projects in progress", domainsTitle: "Five future business domains",
    cybertron: { eyebrow: "CYBERTRON PROJECT", title: "A future-industry vision connecting each domain as one system", body: "AI is the brain, materials the frame, energy the heart, defense technology the shield, and life welfare the senses. It is a long-term portfolio, clearly separated from current operating businesses." },
    activity: { eyebrow: "NOW AT JINBIZ", title: "We document what is actually happening now", body: "Development, planning and validation are clearly distinguished from released operations, then recorded through official updates." },
    trust: { eyebrow: "ENTERPRISE TRUST", title: "Evidence over exaggeration. Connected work over feature count.", body: "Public facts, project status and operational rules are managed consistently. The ERP uses the same execution data from inquiry through WBS, approvals and evaluation evidence." },
    cta: { title: "Looking for the next thing to build?", body: "Start a conversation about AI services, platform collaboration or business execution.", button: "Contact us" },
    company: { kicker: "ABOUT JINBIZ", title: "We build an execution environment where imagination becomes real", introTitle: "There are many ideas, but fewer become real.", intro: "Capital, people and technology often stand between an idea and execution. JINBIZ reduces those barriers with small execution units, AI productivity and structured operations.", missionTitle: "MISSION", mission: "Prevent ideas from being blocked by limits in capital, people or technology.", visionTitle: "VISION", vision: "Create a new standard of work where people focus on creativity and judgment while AI handles professional execution.", valuesTitle: "CORE VALUES", values: [{ title: "Practicality", body: "Build systems that actually work and can be verified." }, { title: "Clarity", body: "Turn complex technology and requirements into understandable structures." }, { title: "Execution", body: "Move beyond planning into screens, functions, data and operations." }], factsTitle: "Company facts", historyTitle: "History & public information", policyTitle: "We do not exaggerate our current status.", policy: "Development, planning and prototype validation are clearly distinguished from launched operations. Unverified claims are not presented as corporate facts." },
    business: { kicker: "BUSINESS", title: "Designing a connected future-industry structure with AI as the core engine", intro: "Current execution tracks, five long-term business domains and the Cybertron vision are treated as distinct layers.", tracksTitle: "Current execution structure", domainsTitle: "Long-term expansion portfolio", cybertronTitle: "Cybertron Project", cybertronBody: "Five business domains operate as modules of one future-industry system rather than isolated labels.", howTitle: "How We Work", how: ["Define", "Research", "Structure", "Execute", "Validate", "Operate & expand"] },
    newsletter: { kicker: "NEWSROOM", title: "Official updates and work in progress", body: "Company news, notices, IR/public information, careers, resources and project updates are managed with locale-specific publication states.", empty: "No public updates are available in this language yet." },
    contact: { kicker: "CONTACT", title: "Let’s design the next execution", body: "Tell us what you need for AI services, platform business or collaboration and we will review it.", type: "Inquiry type", name: "Name", company: "Company / organization", email: "Email", phone: "Phone", message: "Message", submit: "Send inquiry", success: "Your inquiry has been received.", error: "The inquiry could not be submitted. Please review the form or connection status." },
    footer: { statement: "Connecting human imagination with AI expertise and execution.", privacy: "Privacy", terms: "Terms", family: "Family Site" },
  },
  ja: {} as PublicCopy,
  fr: {} as PublicCopy,
  es: {} as PublicCopy,
};

function cloneLocale(base: PublicCopy, overrides: Partial<PublicCopy>): PublicCopy {
  return { ...base, ...overrides } as PublicCopy;
}

copies.ja = cloneLocale(copies.en, {
  nav: { company: "会社紹介", business: "事業紹介", newsletter: "ニュース", contact: "お問い合わせ", search: "検索" },
  hero: { kicker: "想像とアイデアを現実へ", title: "人は想像力と創造力を\nAIは専門性と実行力を", subtitle: "あなたの創造力が輝けるフィールドをつくります。", primary: "事業を見る", secondary: "会社紹介" },
  projectsTitle: "進行中のプロジェクト", domainsTitle: "未来産業をつなぐ5つの事業領域",
  company: { ...copies.en.company, kicker: "ABOUT JINBIZ", title: "想像とアイデアが現実になる実行環境をつくります", introTitle: "アイデアは多くても、現実になるものは多くありません。", intro: "資本・人材・技術の壁を、AIの生産性と構造化された運営で下げます。", missionTitle: "MISSION", mission: "想像とアイデアが資本・人材・技術の限界で止まらないようにします。", visionTitle: "VISION", vision: "人は創造と判断に集中し、AIは専門的な作業と実行を担う新しい仕事の標準をつくります。", valuesTitle: "CORE VALUES", values: [{ title: "実用性", body: "見せるだけでなく、実際に動き検証できる構造をつくります。" }, { title: "明確性", body: "複雑な技術と要件を理解できる構造に整理します。" }, { title: "実行力", body: "企画を画面・機能・データ・運営までつなぎます。" }], factsTitle: "会社情報", historyTitle: "沿革・公開情報", policyTitle: "現在の状態を誇張せず公開します。", policy: "開発中・企画中・プロトタイプ検証中を正式リリースと明確に区別します。" },
  business: { ...copies.en.business, kicker: "BUSINESS", title: "AIを中核エンジンとして未来産業をつなぐ事業構造を設計します", intro: "現在の実行軸、5つの中長期事業領域、Cybertron統合ビジョンを明確に分けます。", tracksTitle: "現在の実行構造", domainsTitle: "中長期拡張ポートフォリオ", cybertronTitle: "Cybertron Project", cybertronBody: "5つの事業領域を一つの未来産業システムとして接続します。", howTitle: "How We Work", how: ["課題定義", "調査", "構造設計", "実行", "検証", "運営・拡張"] },
  newsletter: { kicker: "NEWSROOM", title: "公式ニュースと現在の取り組み", body: "企業ニュース、お知らせ、IR、採用、資料、プロジェクト更新を言語別公開状態で管理します。", empty: "この言語で公開された情報はまだありません。" },
  contact: { kicker: "CONTACT", title: "次の実行を一緒に設計します", body: "AIサービス、プラットフォーム、協業について必要な内容をお知らせください。", type: "お問い合わせ種別", name: "お名前", company: "会社・所属", email: "メール", phone: "電話番号", message: "お問い合わせ内容", submit: "送信する", success: "お問い合わせを受け付けました。", error: "送信できませんでした。入力内容または接続状態をご確認ください。" },
  footer: { statement: "人の想像力とAIの専門性・実行力をつなぎます。", privacy: "プライバシー", terms: "利用規約", family: "Family Site" },
});

copies.fr = cloneLocale(copies.en, {
  nav: { company: "Entreprise", business: "Activités", newsletter: "Actualités", contact: "Contact", search: "Recherche" },
  hero: { kicker: "DE L’IMAGINATION AU RÉEL", title: "L’imagination humaine\nL’expertise et l’exécution de l’IA", subtitle: "Un espace où votre créativité peut prendre toute sa valeur.", primary: "Découvrir nos activités", secondary: "À propos" },
  projectsTitle: "Projets en cours", domainsTitle: "Cinq domaines d’avenir",
  company: { ...copies.en.company, title: "Nous créons un environnement d’exécution où l’imagination devient réelle", introTitle: "Les idées sont nombreuses, celles qui deviennent réelles le sont moins.", intro: "Nous réduisons les barrières de capital, de compétences et de technologie grâce à l’IA et à une exploitation structurée.", missionTitle: "MISSION", mission: "Empêcher les idées d’être bloquées par les limites de capital, de personnes ou de technologie.", visionTitle: "VISION", vision: "Créer un nouveau standard du travail où l’humain se concentre sur la créativité et le jugement, et l’IA sur l’exécution professionnelle.", valuesTitle: "VALEURS", values: [{ title: "Pragmatisme", body: "Construire des systèmes qui fonctionnent réellement." }, { title: "Clarté", body: "Rendre les technologies et exigences complexes compréhensibles." }, { title: "Exécution", body: "Relier stratégie, écrans, fonctions, données et opérations." }], factsTitle: "Informations société", historyTitle: "Historique & informations publiques", policyTitle: "Nous n’exagérons pas notre situation actuelle.", policy: "Développement, planification et validation de prototype sont clairement distingués d’un service lancé." },
  business: { ...copies.en.business, title: "Concevoir une structure industrielle connectée avec l’IA comme moteur central", intro: "Les activités actuelles, les cinq domaines d’expansion et la vision Cybertron restent des niveaux distincts.", tracksTitle: "Structure d’exécution actuelle", domainsTitle: "Portefeuille d’expansion", cybertronTitle: "Cybertron Project", cybertronBody: "Les cinq domaines sont reliés comme les modules d’un même système industriel futur.", howTitle: "Notre méthode", how: ["Définir", "Rechercher", "Structurer", "Exécuter", "Valider", "Opérer & étendre"] },
  newsletter: { kicker: "NEWSROOM", title: "Actualités officielles et travaux en cours", body: "Actualités, avis, informations publiques, carrières, ressources et projets avec publication par langue.", empty: "Aucune actualité publique n’est disponible dans cette langue." },
  contact: { kicker: "CONTACT", title: "Concevons la prochaine exécution", body: "Décrivez votre besoin en IA, plateforme ou collaboration.", type: "Type de demande", name: "Nom", company: "Entreprise / organisation", email: "E-mail", phone: "Téléphone", message: "Message", submit: "Envoyer", success: "Votre demande a bien été reçue.", error: "La demande n’a pas pu être envoyée. Vérifiez le formulaire ou la connexion." },
  footer: { statement: "Relier l’imagination humaine à l’expertise et à l’exécution de l’IA.", privacy: "Confidentialité", terms: "Conditions", family: "Family Site" },
});

copies.es = cloneLocale(copies.en, {
  nav: { company: "Empresa", business: "Negocio", newsletter: "Noticias", contact: "Contacto", search: "Buscar" },
  hero: { kicker: "DE LA IMAGINACIÓN A LA REALIDAD", title: "La imaginación humana\nLa experiencia y ejecución de la IA", subtitle: "Un campo donde tu creatividad puede brillar.", primary: "Ver negocios", secondary: "Conocer JINBIZ" },
  projectsTitle: "Proyectos en curso", domainsTitle: "Cinco áreas de negocio de futuro",
  company: { ...copies.en.company, title: "Creamos un entorno de ejecución donde la imaginación se vuelve real", introTitle: "Hay muchas ideas, pero pocas llegan a hacerse realidad.", intro: "Reducimos las barreras de capital, personas y tecnología mediante productividad con IA y operaciones estructuradas.", missionTitle: "MISIÓN", mission: "Evitar que las ideas queden bloqueadas por límites de capital, personas o tecnología.", visionTitle: "VISIÓN", vision: "Crear un nuevo estándar de trabajo en el que las personas se concentran en creatividad y juicio, y la IA en la ejecución profesional.", valuesTitle: "VALORES", values: [{ title: "Practicidad", body: "Construir sistemas que realmente funcionen y puedan verificarse." }, { title: "Claridad", body: "Convertir tecnología y requisitos complejos en estructuras comprensibles." }, { title: "Ejecución", body: "Conectar la planificación con pantallas, funciones, datos y operación." }], factsTitle: "Información de la empresa", historyTitle: "Historia e información pública", policyTitle: "No exageramos nuestro estado actual.", policy: "Desarrollo, planificación y validación de prototipos se distinguen claramente de un servicio lanzado." },
  business: { ...copies.en.business, title: "Diseñamos una estructura industrial conectada con la IA como motor central", intro: "La ejecución actual, las cinco áreas de expansión y la visión Cybertron se gestionan como niveles diferentes.", tracksTitle: "Estructura de ejecución actual", domainsTitle: "Portafolio de expansión", cybertronTitle: "Cybertron Project", cybertronBody: "Las cinco áreas se conectan como módulos de un mismo sistema industrial futuro.", howTitle: "Cómo trabajamos", how: ["Definir", "Investigar", "Estructurar", "Ejecutar", "Validar", "Operar y ampliar"] },
  newsletter: { kicker: "NEWSROOM", title: "Noticias oficiales y trabajo en curso", body: "Noticias, avisos, información pública, empleo, recursos y proyectos con publicación separada por idioma.", empty: "Aún no hay noticias públicas disponibles en este idioma." },
  contact: { kicker: "CONTACTO", title: "Diseñemos la próxima ejecución", body: "Cuéntanos qué necesitas en servicios de IA, plataformas o colaboración.", type: "Tipo de consulta", name: "Nombre", company: "Empresa / organización", email: "Correo", phone: "Teléfono", message: "Mensaje", submit: "Enviar consulta", success: "Hemos recibido tu consulta.", error: "No se pudo enviar. Revisa el formulario o el estado de conexión." },
  footer: { statement: "Conectamos la imaginación humana con la experiencia y la ejecución de la IA.", privacy: "Privacidad", terms: "Términos", family: "Family Site" },
});

export const publicCopies = copies;

export const companyFacts = [
  ["회사명", "진비즈 매니지먼트"],
  ["영문명", "JINBIZ MANAGEMENT"],
  ["대표자", "김진원"],
  ["사업자등록번호", "330-25-01693"],
  ["대외 활동 기록", "2020년부터 확인 가능"],
  ["본사 소재지", "전북특별자치도 덕진구 세병로 112"],
  ["주요 사업 분야", "AI Service · Platform Business · Planning Foundation"],
  ["공식 도메인", "www.jinbizman.com"],
  ["공식 지원 언어", "한국어 · English · 日本語 · Français · Español"],
] as const;

export const historyItems = [
  ["2020", "기업·사업 성장 지원 기반 구축", "기획·컨설팅과 실무형 프로젝트 수행을 통해 문제 구조화 역량을 축적했습니다."],
  ["2022", "디지털 서비스 기획 영역 확대", "웹·앱·플랫폼 프로젝트와 사용자 경험 설계 역량을 확장했습니다."],
  ["2024", "AI 기반 서비스 연구·개발 체계 전환", "생성형 AI와 업무 자동화를 실제 서비스 구조에 연결하기 시작했습니다."],
  ["2025", "Life Service 포트폴리오 확대", "급여납치·모든평가·New Retro Games 등 생활 밀착형 플랫폼을 확대했습니다."],
  ["2026", "JINBIZ 통합 사업·운영 체계 고도화", "Eureka World, 플랫폼, ERP를 연결한 통합 운영 구조를 고도화했습니다."],
] as const;

export const businessDomains = [
  { code: "AI", title: "인공지능", role: "Brain", body: "판단·생성·분석·제어가 가능한 지능형 시스템을 설계하는 핵심 엔진.", image: "/assets/images/home/portfolio-ai.webp" },
  { code: "MATERIALS", title: "신소재", role: "Frame", body: "경량화·내구성·열관리·복합소재 등 미래 산업의 물리적 기반.", image: "/assets/images/home/portfolio-materials.webp" },
  { code: "ENERGY", title: "에너지", role: "Heart", body: "저장·전환·효율 관리와 차세대 전력 운용을 위한 동력 인프라.", image: "/assets/images/home/portfolio-energy.webp" },
  { code: "DEFENSE", title: "국방기술", role: "Shield", body: "지능형 감시·판단지원·무인화·보안 등 고신뢰 전략 시스템.", image: "/assets/images/home/portfolio-defense.webp" },
  { code: "WELFARE", title: "생활복지", role: "Senses", body: "안전·건강·복지·돌봄·접근성처럼 기술을 사람의 삶으로 연결하는 응용 영역.", image: "/assets/images/home/portfolio-welfare.webp" },
] as const;
