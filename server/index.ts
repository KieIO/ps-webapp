import app from './app.js';
import { serverConfig } from './config.js';

app.listen(serverConfig.port, () => {
  console.log(`Pokeslide server listening on port ${serverConfig.port}`);
  console.log(`API proxy: ${serverConfig.apiProxyPath} -> ${serverConfig.apiProxyTarget}`);
});
