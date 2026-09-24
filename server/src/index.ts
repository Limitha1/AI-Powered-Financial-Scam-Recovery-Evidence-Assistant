import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🛡️  SHIELDTRACE AI BACKEND RUNNING ON PORT: ${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log(`⚡ Health:   http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});
