import { i as rootUrl, t as ProcessItems } from "./utils-BebRxcNK.mjs";
//#region lib/routes/javlibrary/newrelease.ts
const route = {
	path: ["/videos/newrelease/:language?/:mode?", "/newrelease/:language?/:mode?"],
	name: "Unknown",
	maintainers: [],
	handler,
	description: `| videos with comments (by date) | everything (by date) |
| ------------------------------ | -------------------- |
| 1                              | 2                    |`,
	features: { nsfw: true }
};
async function handler(ctx) {
	const mode = ctx.req.param("mode") ?? "1";
	const language = ctx.req.param("language") ?? "ja";
	return await ProcessItems(language, `${rootUrl}/${language}/vl_newrelease.php?list&mode=${mode}`);
}
//#endregion
export { route };
