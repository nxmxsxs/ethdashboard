import { defineConfig } from "@wagmi/cli";
import { foundry } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "./src/lib/eth/abi.ts",
  contracts: [],
  plugins: [
    foundry({
      project: ".",
    }),
  ],
});
