import { i as rootUrl, t as ProcessItems } from "./utils-BebRxcNK.mjs";
//#region lib/routes/javlibrary/newentries.ts
const route = {
	path: ["/videos/newentries/:language?", "/newentries/:language?"],
	name: "Unknown",
	maintainers: [],
	handler,
	features: { nsfw: true }
};
async function handler(ctx) {
	const language = ctx.req.param("language") ?? "ja";
	return await ProcessItems(language, `${rootUrl}/${language}/vl_newentries.php?list`);
}
//#endregion
export { route };
