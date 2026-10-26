import { Hono } from "hono";

//#region lib/app-bootstrap.d.ts
declare const app: Hono<import("hono/types").BlankEnv, import("hono/types").BlankSchema, "/">;
//#endregion
export { app as default };