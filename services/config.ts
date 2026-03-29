// Feature flags and configuration for demo/production modes
// Uses an explicit public env allowlist so secret VITE_* values are not
// accidentally pulled into the browser bundle.

type PublicEnv = Partial<Record<
  'VITE_USE_REAL_AI' |
  'VITE_USE_REAL_DATA' |
  'VITE_USE_REAL_BACKEND' |
  'VITE_SHOW_DEMO_INDICATORS' |
  'VITE_ENABLE_ANALYTICS' |
  'VITE_ENABLE_AUTH' |
  'VITE_API_BASE_URL' |
  'NODE_ENV' |
  'DEV' |
  'PROD',
  string | boolean | undefined
>>;

type WindowWithEnv = Window & { __ENV__?: Record<string, string | undefined> };

// Safe accessor for import.meta.env (undefined in Node/tsx)
const _ime = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {} as Record<string, string | boolean | undefined>;

const publicImportMetaEnv: PublicEnv = {
  VITE_USE_REAL_AI: _ime.VITE_USE_REAL_AI,
  VITE_USE_REAL_DATA: _ime.VITE_USE_REAL_DATA,
  VITE_USE_REAL_BACKEND: _ime.VITE_USE_REAL_BACKEND,
  VITE_SHOW_DEMO_INDICATORS: _ime.VITE_SHOW_DEMO_INDICATORS,
  VITE_ENABLE_ANALYTICS: _ime.VITE_ENABLE_ANALYTICS,
  VITE_ENABLE_AUTH: _ime.VITE_ENABLE_AUTH,
  VITE_API_BASE_URL: _ime.VITE_API_BASE_URL,
  NODE_ENV: _ime.MODE,
  DEV: _ime.DEV,
  PROD: _ime.PROD,
};

const runtimeEnv = typeof window !== 'undefined' ? (window as WindowWithEnv).__ENV__ || {} : {};

const _env = (key: keyof PublicEnv, fallback = ''): string =>
  String(runtimeEnv[key as string] ?? publicImportMetaEnv[key] ?? '') ||
  (typeof process !== 'undefined' ? process.env?.[key] ?? '' : '') ||
  fallback;

// Robust boolean parser � handles 'true'/'false', '1'/'0', 'yes'/'no', 'on'/'off'
function parseBoolean(value: string | boolean | undefined, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().toLowerCase();
  if (['false', '0', 'no', 'off', ''].includes(normalized)) return false;
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  return fallback;
}

export const config = {
  // AI & Backend Features
  useRealAI:         parseBoolean(_env('VITE_USE_REAL_AI'), true),
  useRealData:       parseBoolean(_env('VITE_USE_REAL_DATA'), true),
  useRealBackend:    parseBoolean(_env('VITE_USE_REAL_BACKEND'), true),

  // UI Features
  showDemoIndicators: parseBoolean(_env('VITE_SHOW_DEMO_INDICATORS'), false),
  enableAnalytics:    parseBoolean(_env('VITE_ENABLE_ANALYTICS'), false),
  enableAuth:         parseBoolean(_env('VITE_ENABLE_AUTH'), false),

  // API Configuration
  apiBaseUrl: _env('VITE_API_BASE_URL', '/api'),

  // Development flags
  isDevelopment: _env('NODE_ENV') === 'development' || Boolean(publicImportMetaEnv.DEV),
  isProduction:  _env('NODE_ENV') === 'production'  || Boolean(publicImportMetaEnv.PROD),

  // Multi-Agent Brain System
  enableMultiAgent: true,
  enableHistoricalLearning: true,
  enableRegionalCityEngine: true,
  enableDocumentIntelligence: true,
  enableLiveReportBuilder: true,
};

// Helper functions for feature detection
export const features = {
  shouldUseReal: (feature: keyof typeof config): boolean => {
    return config[feature] as boolean;
  },

  isDemoMode: (): boolean => {
    return !config.useRealAI || !config.useRealData || !config.useRealBackend;
  },

  getApiEndpoint: (endpoint: string): string | null => {
    if (config.useRealBackend) {
      return `${config.apiBaseUrl}${endpoint}`.replace(/([^:])[\/]{2,}/g, '$1/');
    }
    return null;
  },

  shouldShowDemoIndicator: (): boolean => {
    return config.showDemoIndicators && features.isDemoMode();
  },
};

// System status messages
export const systemMessages = {
  aiResponse: 'AI analysis powered by configured provider with NSIL intelligence engines.',
  dataSource: 'Processing with live data integration and intelligent caching.',
  analysis: 'Analysis complete using NSIL Intelligence Hub with multi-persona reasoning.',
  generation: 'Document generated with professional formatting and export options.',
};

export const demoMessages = systemMessages;

export default config;
