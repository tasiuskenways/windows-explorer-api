import { createApp } from "./app.ts";
import { config } from "./config.ts";

createApp().listen(config.port);
console.log(`api on http://localhost:${config.port} (docs at /docs)`);
