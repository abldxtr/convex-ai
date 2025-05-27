import { createMem0 } from "@mem0/vercel-ai-provider";
import { Memory } from "mem0ai/oss";

const memory = new Memory();

const result = memory.add(
  "I like to drink coffee in the morning and go for a walk.",
  { userId: "alice", metadata: { category: "preferences" } },
);

const relatedMemories = memory.search("Should I drink coffee or tea?", {
  userId: "alice",
});

// const mem0 = createMem0({
//   provider: "openai",
//   mem0ApiKey: "m0-xxx",
//   apiKey: "provider-api-key",
//   config: {
//     compatibility: "strict",
//   },
//   // Optional Mem0 Global Config
//   mem0Config: {
//     user_id: "mem0-user-id",
//     org_id: "mem0-org-id",
//     project_id: "mem0-project-id",
//   },
// });
