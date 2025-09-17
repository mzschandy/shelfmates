import { AppType } from "@shelfmates/server";
import { hc } from "hono/client";
import { cookies } from "next/headers";

export const serverClient = hc<AppType>("http://localhost:8787", {
  fetch: async (input: URL | RequestInfo, init?: RequestInit) => {
    const cookieJar = (await cookies()).toString();
    const headers = new Headers();
    headers.set("cookie", cookieJar);
    return fetch(input, {
      ...init,
      headers,
    });
  },
});
