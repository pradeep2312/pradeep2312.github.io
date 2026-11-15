// All the text on the site lives here. Edit this file to update the portfolio;
// nothing in the layout or animation code needs to change.

export const CONTENT = {
  name: 'Sai Pradeep Reddy',
  // The word shown in large faint letters behind the video on the first screen.
  giantName: 'Pradeep',
  role: 'Full Stack Developer',
  tagline: 'I build enterprise applications with Spring Boot and React, and AI features with RAG and agentic systems. From payment microservices to clinical AI summaries, I like turning hard problems into software people rely on.',
  // First-screen headline lines and the short line under them.
  headline: ['Full Stack', 'Developer'],
  heroLine: 'Enterprise software · AI engineering',
  location: 'United States',

  photos: {
    // The slow-motion cut-out in the first screen (picture on the left half, matte on the right).
    heroVideo: 'assets/walk.mp4',
    hero: 'assets/stand.png',
    about: 'assets/seated.png',
    work: 'assets/typing.png',
    journey: 'assets/smile.png',
  },

  // The talking intro video shown in the About section.
  intro: { file: 'assets/about.mp4' },

  // Words between *stars* are highlighted.
  statement: 'Full stack developer who loves *shipping*. I turn messy enterprise problems into *products* people actually use: clean APIs, fast microservices and *AI features* that hold up in production.',
  about: 'Five-plus years across healthcare and financial services, most recently at Quest Diagnostics and Goldman Sachs. Master’s in Computer Science from the University of Missouri-Kansas City, and a Claude Certified Architect.',

  stats: [
    { value: '5+', label: 'Years of experience' },
    { value: '50K', label: 'Transactions per second' },
    { value: '1M+', label: 'Kafka events per day' },
    { value: '40%', label: 'Faster chart review' },
  ],

  // The skills that revolve around the photo. Each item is [short form, name].
  skillGroups: [
    { group: 'Backend', items: [['Jv', 'Java'], ['Sb', 'Spring Boot'], ['Ms', 'Microservices'], ['Kf', 'Apache Kafka'], ['Gr', 'gRPC'], ['Gq', 'GraphQL'], ['Rs', 'REST APIs']] },
    { group: 'Frontend', items: [['Re', 'React'], ['Ng', 'Angular'], ['Ts', 'TypeScript']] },
    { group: 'Cloud and data', items: [['Aw', 'AWS'], ['Az', 'Azure'], ['Dk', 'Docker'], ['Pg', 'PostgreSQL']] },
    { group: 'AI', items: [['Ga', 'Generative AI'], ['Rg', 'RAG'], ['Ag', 'Agentic AI'], ['Lm', 'LLM Engineering'], ['Py', 'Python']] },
  ],

  education: [
    { title: 'Master’s Degree, Computer Science', place: 'University of Missouri-Kansas City' },
    { title: 'Bachelor’s Degree, Electrical, Electronics and Communications Engineering', place: 'BV Raju Institute of Technology (BVRIT)' },
  ],

  certifications: [
    { title: 'Claude Certified Architect — Foundations', place: 'Anthropic' },
    { title: 'AWS Certified Solutions Architect — Associate', place: 'Amazon Web Services' },
    { title: 'Azure Solutions Architect Expert', place: 'Microsoft' },
    { title: 'Generative AI Fundamentals', place: 'Databricks' },
    { title: 'Oracle Certified AI Foundations Associate', place: 'Oracle' },
    { title: 'AI Engineer Core Track: LLM Engineering, RAG, QLoRA, Agents', place: 'Udemy' },
  ],

  experience: [
    {
      role: 'Full Stack Java Developer',
      company: 'Quest Diagnostics',
      period: 'Oct 2025 — Present',
      points: [
        'Conceived and developed the Quest AI Summary feature, reducing chart-review time by 40%.',
        'Integrated multiple EHR systems via REST APIs, processing thousands of lab results daily.',
        'Built a diagnostic data visualization app for clinical users, with optimized database queries.',
      ],
    },
    {
      role: 'Full Stack Developer',
      company: 'Goldman Sachs · Richardson, Texas',
      period: 'Aug 2024 — Oct 2025',
      points: [
        'Architected distributed payment microservices with Java 17/21, Spring Boot, gRPC and GraphQL, processing over 50K financial transactions per second.',
        'Led a zero-downtime Java migration from version 14 to 17/21, improving JVM performance by 25%.',
        'Built fault-tolerant Apache Kafka streaming pipelines handling over 1M financial events daily.',
      ],
    },
    { role: 'Full Stack Developer', company: 'Humana · Louisville, Kentucky', period: 'Sep 2023 — Aug 2024', points: [] },
    { role: 'Full Stack Developer', company: 'USAA · San Antonio, Texas', period: 'Jan 2023 — Sep 2023', points: [] },
    { role: 'Software Engineer', company: 'CMS IT Services · Hyderabad, India', period: 'Jan 2021 — Nov 2022', points: [] },
  ],

  // The revolving project cards: the five most recently updated GitHub projects.
  // Each has a big figure and a label under it.
  featured: [
    {
      name: 'AI News Agent',
      repo: 'ai-news-agent',
      tag: 'AI automation',
      summary: 'A personal news service that collects RSS articles, removes duplicates, ranks them and sends an AI-written daily digest to Telegram.',
      tech: ['Java 21', 'Spring Boot', 'PostgreSQL', 'OpenAI API', 'Docker'],
      card: { figure: '1–10', label: 'Importance score' },
      code: 'https://github.com/pradeep2312/ai-news-agent',
      live: '',
    },
    {
      name: 'Enterprise Knowledge Assistant',
      repo: 'AI_Enterprise_Knowledge_Assistant',
      tag: 'RAG',
      summary: 'A retrieval-augmented assistant that parses company PDFs, stores embeddings in pgvector, reranks matches and answers questions in a React interface.',
      tech: ['Python', 'FastAPI', 'pgvector', 'React', 'TypeScript'],
      card: { figure: 'RAG', label: 'Retrieval pipeline' },
      code: 'https://github.com/pradeep2312/AI_Enterprise_Knowledge_Assistant',
      live: '',
    },
    {
      name: 'JavaScript Project',
      repo: 'JavaScript_Project',
      tag: 'Web',
      summary: 'JavaScript practice exercises.',
      tech: ['JavaScript', 'HTML'],
      card: { figure: 'JS', label: 'Practice work' },
      code: 'https://github.com/pradeep2312/JavaScript_Project',
      live: '',
    },
    {
      name: 'Stock Analysis',
      repo: 'stock-analysis-project',
      tag: 'Data',
      summary: 'Stock market analysis with PySpark and SQL.',
      tech: ['PySpark', 'SQL', 'Jupyter'],
      card: { figure: 'SQL', label: 'PySpark analysis' },
      code: 'https://github.com/pradeep2312/stock-analysis-project',
      live: '',
    },
    {
      name: 'IoT Weather Station',
      repo: 'Weather-Station-IOT-',
      tag: 'IoT',
      summary: 'An ESP32 station that measures weather and air-particle levels, publishes readings over MQTT to Google Cloud and shows them on a live dashboard.',
      tech: ['ESP32', 'C++', 'MQTT', 'React', 'GCP'],
      card: { figure: 'MQTT', label: 'Live telemetry' },
      code: 'https://github.com/pradeep2312/Weather-Station-IOT-',
      live: '',
    },
  ],

  // The "More on GitHub" list is filled live from this account.
  githubUsername: 'pradeep2312',
  // Shown when a repository has no description on GitHub.
  repoNotes: {
    'stock-analysis-project': 'Stock market analysis with PySpark and SQL.',
    'mqtt': 'React dashboard showing live temperature and humidity over MQTT.',
    'linear-rergression': 'Predicts a student’s score from study hours with linear regression.',
    'JavaScript_Project': 'JavaScript practice exercises.',
  },

  contact: {
    heading: ['Let’s build', 'something.'],
    note: 'Open to new roles and interesting projects.',
    email: '',
    github: 'https://github.com/pradeep2312',
    linkedin: 'https://www.linkedin.com/in/saipradeepreddy/',
    resume: '',
  },
};
