import type { AppType } from "@shelfmates/server"
import { hc } from "hono/client"

export const client = hc<AppType>("http://localhost:8787", {
  fetch: (input: URL | RequestInfo, init?: RequestInit) => {
    return fetch(input, {
      ...init, 
      credentials: 'include'
    })
  }
});
