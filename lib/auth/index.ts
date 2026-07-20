import { adminClient, usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const auth = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333",
  basePath: "/auth",

  plugins: [adminClient(), usernameClient()],
});
