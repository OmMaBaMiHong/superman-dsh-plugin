import { i as rootUrl, t as ProcessItems } from "./utils-BebRxcNK.mjs";
//#region lib/routes/javlibrary/update.ts
const route = {
	path: ["/videos/update/:language?", "/update/:language?"],
	name: "Unknown",
	maintainers: [],
	handler,
	features: { nsfw: true }
};
async function handler(ctx) {
	const language = ctx.req.param("language") ?? "ja";
	return await ProcessItems(language, `${rootUrl}/${language}/vl_update.php?list`);
}
//#endregion
export { route };
