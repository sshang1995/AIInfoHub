export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const TOPIC_COLORS: Record<string, string> = {
  "model-releases": "#7C3AED",
  "product-launches": "#2563EB",
  "agent-workflows": "#0891B2",
  "coding-copilots": "#059669",
  rag: "#65A30D",
  evals: "#CA8A04",
  "inference-infra": "#EA580C",
  "safety-policy": "#DC2626",
  "prompt-engineering": "#DB2777",
  "developer-tooling": "#9333EA",
  "open-source": "#16A34A",
  research: "#0369A1",
  "enterprise-ai": "#475569",
};

export const TOPICS = [
  { slug: "model-releases", name: "Model Releases", nameZh: "模型发布" },
  { slug: "product-launches", name: "Product Launches", nameZh: "产品发布" },
  { slug: "agent-workflows", name: "Agent Workflows", nameZh: "智能体工作流" },
  { slug: "coding-copilots", name: "Coding Copilots", nameZh: "编程助手" },
  { slug: "rag", name: "RAG", nameZh: "检索增强生成" },
  { slug: "evals", name: "Evals & Benchmarks", nameZh: "评测基准" },
  { slug: "inference-infra", name: "Inference & Infra", nameZh: "推理与基础设施" },
  { slug: "safety-policy", name: "Safety & Policy", nameZh: "安全与政策" },
  { slug: "prompt-engineering", name: "Prompt Engineering", nameZh: "提示工程" },
  { slug: "developer-tooling", name: "Developer Tooling", nameZh: "开发者工具" },
  { slug: "open-source", name: "Open Source", nameZh: "开源" },
  { slug: "research", name: "Research", nameZh: "研究" },
  { slug: "enterprise-ai", name: "Enterprise AI", nameZh: "企业 AI" },
] as const;

export const INITIAL_SOURCES = [
  { name: "OpenAI Blog", slug: "openai-blog", sourceType: "RSS" as const, url: "https://openai.com/blog", rssUrl: "https://openai.com/blog/rss.xml", category: "Company Blog" },
  { name: "Anthropic News", slug: "anthropic-news", sourceType: "RSS" as const, url: "https://www.anthropic.com/news", rssUrl: "https://www.anthropic.com/rss.xml", category: "Company Blog" },
  { name: "Google DeepMind Blog", slug: "deepmind-blog", sourceType: "RSS" as const, url: "https://deepmind.google/discover/blog", rssUrl: "https://deepmind.google/blog/rss.xml", category: "Company Blog" },
  { name: "Meta AI Blog", slug: "meta-ai-blog", sourceType: "COMPANY_BLOG" as const, url: "https://ai.meta.com/blog", category: "Company Blog" },
  { name: "Hugging Face Blog", slug: "huggingface-blog", sourceType: "RSS" as const, url: "https://huggingface.co/blog", rssUrl: "https://huggingface.co/blog/feed.xml", category: "Company Blog" },
  { name: "Mistral Blog", slug: "mistral-blog", sourceType: "RSS" as const, url: "https://mistral.ai/news", rssUrl: "https://mistral.ai/news/feed.xml", category: "Company Blog" },
  { name: "LangChain Blog", slug: "langchain-blog", sourceType: "RSS" as const, url: "https://blog.langchain.dev", rssUrl: "https://blog.langchain.dev/rss", category: "Developer Tools" },
  { name: "Vercel AI Blog", slug: "vercel-ai-blog", sourceType: "RSS" as const, url: "https://vercel.com/blog", rssUrl: "https://vercel.com/blog/feed.xml", category: "Developer Tools" },
  { name: "Microsoft AI Blog", slug: "microsoft-ai-blog", sourceType: "RSS" as const, url: "https://blogs.microsoft.com/ai", rssUrl: "https://blogs.microsoft.com/ai/feed", category: "Company Blog" },
  { name: "Cohere Blog", slug: "cohere-blog", sourceType: "RSS" as const, url: "https://cohere.com/blog", rssUrl: "https://cohere.com/blog/feed.xml", category: "Company Blog" },
  { name: "Perplexity Blog", slug: "perplexity-blog", sourceType: "COMPANY_BLOG" as const, url: "https://blog.perplexity.ai", category: "Company Blog" },
  { name: "NVIDIA AI Blog", slug: "nvidia-ai-blog", sourceType: "RSS" as const, url: "https://developer.nvidia.com/blog/category/artificial-intelligence", rssUrl: "https://developer.nvidia.com/blog/feed", category: "Company Blog" },
] as const;
