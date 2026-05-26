import react from '@vitejs/plugin-react';

export default {
  plugins: [react],
  server: {
    port: 5173,
    proxy: {
      '/scan-face': 'http://localhost:8000',
      '/scan-image': 'http://localhost:8000',
      '/calibrate': 'http://localhost:8000',
      '/scan-complete': 'http://localhost:8000',
      '/validate-cube': 'http://localhost:8000',
      '/api/solve': 'http://localhost:8787',
      '/api/health': 'http://localhost:8787'
    }
  }
};
