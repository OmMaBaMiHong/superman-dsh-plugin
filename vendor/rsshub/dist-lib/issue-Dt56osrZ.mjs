import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as apiRootUrl, r as rootUrl, t as ProcessItems } from "./utils-fTxO48rM.mjs";
//#region lib/routes/hk01/issue.ts
const route = {
	path: "/issue/:id?",
	radar: [{ source: ["hk01.com/issue/:id", "hk01.com/"] }],
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "649";
	const currentUrl = `${rootUrl}/issue/${id}`;
	const response = await got_default({
		method: "get",
		url: `${apiRootUrl}/v2/issues/${id}`
	});
	const items = await ProcessItems(response.data.blocks[0].articles, ctx.req.query("limit"));
	return {
		title: `${response.data.title} | 香港01`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
