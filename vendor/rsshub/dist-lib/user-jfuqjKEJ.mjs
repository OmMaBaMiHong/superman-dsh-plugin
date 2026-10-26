import { i as rootUrl, t as ProcessItems } from "./utils-BebRxcNK.mjs";
//#region lib/routes/javlibrary/user.ts
const route = {
	path: ["/users/:id/:type/:language?", "/:type/:id/:language?"],
	name: "Unknown",
	maintainers: [],
	handler,
	description: `| Wanted     | Watched     | Owned     |
| ---------- | ----------- | --------- |
| userwanted | userwatched | userowned |`,
	features: { nsfw: true }
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const type = ctx.req.param("type");
	const language = ctx.req.param("language") ?? "ja";
	return await ProcessItems(language, `${rootUrl}/${language}/${type}.php?list&u=${id}`);
}
//#endregion
export { route };
