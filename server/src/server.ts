import { createServer } from "node:http";

import { createApp } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { logger } from "./config/logger";

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  const httpServer = createServer(app);

  httpServer.listen(env.PORT, () => {
    logger.info(`Prepview backend listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  logger.error({ error }, "Failed to start Prepview backend");
  process.exit(1);
});
