// convex/convex.config.ts
import workflow from "@convex-dev/workflow/convex.config";
import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";
import workpool from "@convex-dev/workpool/convex.config";
import persistentTextStreaming from "@convex-dev/persistent-text-streaming/convex.config";

const app = defineApp();
app.use(agent);
app.use(workflow);
app.use(persistentTextStreaming);
// app.use(workpool, { name: "emailWorkpool" });
// app.use(workpool, { name: "scrapeWorkpool" });

export default app;
