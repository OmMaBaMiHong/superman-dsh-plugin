import { i as rootUrl, t as ProcessItems } from "./utils-BebRxcNK.mjs";
//#region lib/routes/javlibrary/mostwanted.ts
const route = {
	path: ["/videos/mostwanted/:language?/:mode?", "/mostwanted/:language?/:mode?"],
	name: "Unknown",
	maintainers: [],
	handler,
	description: `| Last Month | All Time |
| ---------- | -------- |
| 1          | 2        |`,
	features: { nsfw: true }
};
async function handler(ctx) {
	const mode = ctx.req.param("mode") ?? "1";
	const language = ctx.req.param("language") ?? "ja";
	return await ProcessItems(language, `${rootUrl}/${language}/vl_mostwanted.php?list&mode=${mode}`);
}
//#endregion
export { route };
