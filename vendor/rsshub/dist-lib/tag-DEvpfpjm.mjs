import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as apiRootUrl, r as rootUrl, t as ProcessItems } from "./utils-fTxO48rM.mjs";
//#region lib/routes/hk01/tag.ts
const route = {
	path: "/tag/:id?",
	radar: [{ source: ["hk01.com/tag/:id", "hk01.com/"] }],
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "1";
	const currentUrl = `${rootUrl}/tag/${id}`;
	const items = await ProcessItems((await got_default({
		method: "get",
		url: `${apiRootUrl}/v2/feed/tag/${id}`
	})).data.items, ctx.req.query("limit"));
	return {
		title: `${id} | 香港01`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
