import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

// Global error handlers to surface runtime issues in-page for easier debugging
window.addEventListener('error', (evt) => {
  console.error('Global window error:', evt.error || evt.message, evt.error || evt.filename || '');
});

window.addEventListener('unhandledrejection', (evt) => {
  const err = evt.reason;
  const msg = ((err?.message) ?? '').toLowerCase();
  const isChunk =
    err?.name === 'ChunkLoadError' ||
    msg.includes('dynamically imported module') ||
    msg.includes('loading chunk') ||
    (err instanceof TypeError && msg.includes('module'));
  if (isChunk) {
    const last = Number(sessionStorage.getItem('bw_chunk_reload_at') ?? 0);
    if (Date.now() - last > 15_000) {
      sessionStorage.setItem('bw_chunk_reload_at', String(Date.now()));
      window.location.reload();
    }
  } else {
    console.error('Unhandled Promise Rejection:', err);
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  document.body.innerHTML = '<div style="padding:24px;font-family:Inter, sans-serif">Root element not found. Check index.html for a missing <div id="root"></div>.</div>';
  throw new Error("Could not find root element to mount to");
}

// Diagnostic: apply baseline inline styles so the page is visually structured
// even if the bundled CSS file fails to load. Remove once CSS loading is confirmed.
rootElement.style.cssText = [
  'min-height: 100vh',
  'width: 100%',
  'font-family: Inter, Segoe UI, Arial, -apple-system, sans-serif',
  'font-size: 14px',
  'line-height: 1.6',
  'color: #1C1C1C',
  'background-color: #F0F7FF',
  'box-sizing: border-box',
].join('; ');

const root = ReactDOM.createRoot(rootElement);

// Dynamically import the app and ErrorBoundary so import-time errors can be caught and displayed
(async () => {
  try {
    const [{ default: App }, { default: ErrorBoundary }] = await Promise.all([import('./App'), import('./components/ErrorBoundary')]);

    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );

    // Mount indicator removed per user request
  } catch (err: any) {
    const msg = ((err?.message) ?? '').toLowerCase();
    const isChunk =
      err?.name === 'ChunkLoadError' ||
      msg.includes('dynamically imported module') ||
      msg.includes('loading chunk') ||
      (err instanceof TypeError && msg.includes('module'));
    if (isChunk) {
      const last = Number(sessionStorage.getItem('bw_chunk_reload_at') ?? 0);
      if (Date.now() - last > 15_000) {
        sessionStorage.setItem('bw_chunk_reload_at', String(Date.now()));
        window.location.reload();
        return;
      }
    }
    console.error('Error importing app:', err);
    const overlay = document.getElementById('global-error-overlay');
    if (overlay) {
      overlay.innerHTML = '<div style="max-width:980px;margin:40px auto;padding:20px;border-radius:8px;background:#1f2937;color:#fff;font-family:Inter, sans-serif"><h2 style="margin:0 0 8px 0;color:#ffbaba">Import / Startup Error</h2><pre style="white-space:pre-wrap;overflow:auto;max-height:60vh;color:#fff;background:transparent;padding:0;margin:0">' + (err && (err.stack || err.message || JSON.stringify(err))) + '</pre></div>';
      overlay.style.display = 'block';
    } else {
      document.body.innerHTML = '<pre style="padding:20px;font-family:Inter, sans-serif;color:#111">' + (err && (err.stack || err.message || JSON.stringify(err))) + '</pre>';
    }
  }
})();