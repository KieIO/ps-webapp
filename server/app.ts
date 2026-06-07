import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mountApiProxy } from './middleware/apiProxy.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '../dist');
const indexHtml = path.join(distPath, 'index.html');

const app = express();

app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

mountApiProxy(app);

app.use(express.static(distPath));

app.get(/^(?!\/v1(?:\/|$)).*/, (_req, res) => {
  res.sendFile(indexHtml);
});

export default app;
