import { i as rootUrl, t as ProcessItems } from "./utils-BebRxcNK.mjs";
//#region lib/routes/javlibrary/bestrated.ts
const route = {
	path: ["/videos/bestrated/:language?/:mode?", "/bestrated/:language?/:mode?"],
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
	return await ProcessItems(language, `${rootUrl}/${language}/vl_bestrated.php?list&mode=${mode}`);
}
//#endregion
export { route };
