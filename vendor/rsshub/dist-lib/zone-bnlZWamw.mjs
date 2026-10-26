import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as apiRootUrl, r as rootUrl, t as ProcessItems } from "./utils-fTxO48rM.mjs";
//#region lib/routes/hk01/zone.ts
const route = {
	path: "/zone/:id?",
	radar: [{ source: ["hk01.com/zone/:id", "hk01.com/"] }],
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "1";
	const currentUrl = `${rootUrl}/zone/${id}`;
	const response = await got_default({
		method: "get",
		url: `${apiRootUrl}/v2/feed/zone/${id}`
	});
	const items = await ProcessItems(response.data.items, ctx.req.query("limit"));
	return {
		title: `${response.data.category.publishName} | 香港01`,
		link: currentUrl,
		item: items,
		image: response.data.category.icon
	};
}
//#endregion
export { route };
