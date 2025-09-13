import type { AppType } from "@shelfmates/server"
import { hc } from "hono/client"

export const client = hc<AppType>("http://localhost:8787/", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  init: {
    credentials: 'include'
  },
})
