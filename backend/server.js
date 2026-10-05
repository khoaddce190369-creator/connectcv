// Shared entry point for the team's unified Render frontend/backend service.
const { createApp } = require('./app');
const app = createApp();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
