import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig({}),
  // OpenNext runs this internally — must not be `npm run build` (infinite loop).
  buildCommand: "npm run build:next",
};
