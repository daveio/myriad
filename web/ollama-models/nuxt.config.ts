export default defineNuxtConfig({
  app: {
    head: {
      title: "Ollama Model Browser",
      meta: [
        {
          name: "description",
          content: "Browse and filter the live Ollama model catalogue.",
        },
      ],
    },
  },
  devtools: { enabled: false },
  experimental: {
    typedPages: false,
  },
  typescript: {
    strict: true,
    typeCheck: true,
  },
  vite: {
    build: {
      sourcemap: false,
    },
    optimizeDeps: {
      include: ["lucide-vue-next"],
    },
  },
});
