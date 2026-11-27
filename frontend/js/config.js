// BLIK config — fill after creating Supabase (+ optional AI keys).
// AI keys in the browser are visible; prefer free-tier keys with low limits
// or a Netlify proxy later. Never put service-role keys here.
window.BLIK_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  // Optional free OpenAI-compatible endpoints for AI guide + Prompt Lab
  groqApiKey: '',          // https://console.groq.com
  openRouterApiKey: '',    // https://openrouter.ai
  aiDefaultProvider: 'groq', // groq | openrouter | offline
};
