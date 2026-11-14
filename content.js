// All the text on the site lives here. Edit this file to update the portfolio;
// nothing in the 3D code needs to change.

export const CONTENT = {
  name: 'Sai Pradeep Reddy',
  // How the name is split across lines on the first screen.
  nameLines: ['Sai', 'Pradeep', 'Reddy'],
  photo: 'assets/portrait.webp',
  // Short line under the name on the first screen.
  focus: ['Spring Boot', 'React', 'Agentic AI'],
  role: 'Full Stack Developer',
  tagline: 'I build enterprise applications with Spring Boot and React, and AI features with RAG and agentic systems.',
  location: 'United States',

  about: [
    'Full stack developer with 5+ years of experience building enterprise software for healthcare and financial services, most recently at Quest Diagnostics and Goldman Sachs.',
    'My work spans Java and Spring Boot microservices, React and Angular front ends, and event streaming with Kafka. Lately I focus on generative AI: retrieval-augmented generation, agentic workflows and AI features inside production systems. I hold a Master’s in Computer Science from the University of Missouri-Kansas City and am a Claude Certified Architect (Foundations).',
  ],

  stats: [
    { value: '5+', label: 'Years of experience' },
    { value: '50K', label: 'Transactions per second' },
    { value: '1M+', label: 'Kafka events per day' },
    { value: '40%', label: 'Faster chart review' },
  ],

  skills: [
    'Java', 'Spring Boot', 'Microservices', 'React', 'Angular', 'Kafka', 'gRPC', 'GraphQL',
    'REST APIs', 'AWS', 'Azure', 'PostgreSQL', 'Docker', 'Python', 'Generative AI', 'RAG', 'Agentic AI',
  ],

  // The "Technical skills" grid.
  skillGroups: [
    { group: 'Backend', items: ['Java', 'Spring Boot', 'Microservices', 'Apache Kafka', 'gRPC', 'GraphQL', 'REST APIs'] },
    { group: 'Frontend', items: ['React', 'Angular', 'TypeScript'] },
    { group: 'Cloud and data', items: ['AWS', 'Azure', 'Docker', 'PostgreSQL'] },
    { group: 'AI', items: ['Generative AI', 'RAG', 'Agentic AI', 'LLM Engineering', 'Python'] },
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
    {
      role: 'Full Stack Developer',
      company: 'Humana · Louisville, Kentucky',
      period: 'Sep 2023 — Aug 2024',
      points: [],
    },
    {
      role: 'Full Stack Developer',
      company: 'USAA · San Antonio, Texas',
      period: 'Jan 2023 — Sep 2023',
      points: [],
    },
    {
      role: 'Software Engineer',
      company: 'CMS IT Services · Hyderabad, India',
      period: 'Jan 2021 — Nov 2022',
      points: [],
    },
  ],

  // The projects shown as large cards and as billboards in the city.
  // repo: the GitHub repository name, so it is not repeated in the grid below.
  // image: path to a screenshot (for example 'assets/ai-news-agent.png'), or '' for none.
  featured: [
    {
      name: 'AI News Agent',
      repo: 'ai-news-agent',
      summary: 'A personal news automation service. It collects articles from RSS feeds, removes duplicates, categorizes and ranks them, writes a daily AI-generated digest and sends it to Telegram.',
      tech: ['Java 21', 'Spring Boot', 'PostgreSQL', 'OpenAI API', 'Docker'],
      image: '',
      code: 'https://github.com/pradeep2312/ai-news-agent',
      live: '',
    },
    {
      name: 'Enterprise Knowledge Assistant',
      repo: 'AI_Enterprise_Knowledge_Assistant',
      summary: 'A retrieval-augmented assistant for company documents. It parses and chunks PDFs, stores embeddings in pgvector, reranks the matches and answers questions through a React interface.',
      tech: ['Python', 'FastAPI', 'pgvector', 'React', 'TypeScript'],
      image: '',
      code: 'https://github.com/pradeep2312/AI_Enterprise_Knowledge_Assistant',
      live: '',
    },
    {
      name: 'Fake News Detection',
      repo: 'Fake-News-Detection',
      summary: 'An LSTM model that classifies news articles as real or fake with 94.24% accuracy, served through a Streamlit web app.',
      tech: ['Python', 'LSTM', 'NLP', 'Streamlit'],
      image: '',
      code: 'https://github.com/pradeep2312/Fake-News-Detection',
      live: '',
    },
    {
      name: 'IoT Weather Station',
      repo: 'Weather-Station-IOT-',
      summary: 'An ESP32 station that measures weather and air-particle levels, publishes readings over MQTT to Google Cloud and shows them on a live web dashboard.',
      tech: ['ESP32', 'C++', 'MQTT', 'React', 'GCP'],
      image: '',
      code: 'https://github.com/pradeep2312/Weather-Station-IOT-',
      live: '',
    },
  ],

  // The "More on GitHub" grid is filled live from this account.
  githubUsername: 'pradeep2312',
  // Shown when a repository has no description on GitHub.
  repoNotes: {
    'stock-analysis-project': 'Stock market analysis with PySpark and SQL.',
    'mqtt': 'React dashboard showing live temperature and humidity over MQTT.',
    'linear-rergression': 'Predicts a student’s score from study hours with linear regression.',
    'JavaScript_Project': 'JavaScript practice exercises.',
  },

  contact: {
    heading: 'Let’s build something.',
    note: 'Open to new roles and interesting projects.',
    email: '',
    github: 'https://github.com/pradeep2312',
    linkedin: 'https://www.linkedin.com/in/saipradeepreddy/',
    resume: '',
  },

  theme: {
    accent: '#ff2d2d',
    accent2: '#ff6a1f',
  },
};
