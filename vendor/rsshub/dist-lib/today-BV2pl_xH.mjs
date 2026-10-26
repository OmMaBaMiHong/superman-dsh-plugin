import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as parseItems, r as parseList, t as baseUrl } from "./utils-NhizIc1j.mjs";
//#region lib/routes/line/today.ts
const route = {
	path: "/today/:edition?/:tab?",
	categories: ["new-media"],
	example: "/line/today",
	parameters: {
		edition: "Edition, see below, Taiwan by default",
		tab: "Tag, can be found in URL, `top` by default"
	},
	radar: [{ source: ["today.line.me/"] }],
	name: "TODAY",
	maintainers: ["nczitzk"],
	handler,
	url: "today.line.me/",
	description: `Edition

| Taiwan | Thailand | Hong Kong |
| ------ | -------- | --------- |
| tw     | th       | hk        |`
};
async function handler(ctx) {
	const edition = ctx.req.param("edition") || "tw";
	const tab = ctx.req.param("tab") || "top";
	const tabUrl = `${baseUrl}/webapi/portal/page/${tab}?country=${edition}`;
	const recommendationUrl = `${baseUrl}/webapi/api/v6/recommendation/articles/listings/mytoday_rec:id?offset=0&length=50&country=${edition}&gender=&age=&excludeNoThumbnail=0&containMainSnapshot=0`;
	const currentUrl = `${baseUrl}/${edition}/v2/tab/${tab}`;
	let title = "Recommendation", moduleUrl;
	if (tab !== "recommendation") {
		const moduleResponse = await got_default({
			method: "get",
			url: tabUrl
		});
		const listing = moduleResponse.data.modules.findLast((item) => item.source === "CATEGORY_MOST_VIEW").listings[0];
		title = moduleResponse.data.name;
		moduleUrl = `${baseUrl}/webapi/trending/category/mostView/listings/${listing.id}?offset=0&length=50&country=${edition}&targetContent=${listing.params.targetContent}&categories=${listing.params.categories}&trendingEventPeriod=${listing.params.trendingEventPeriod}`;
	}
	const items = await parseItems(parseList((await got_default({
		method: "get",
		url: tab === "recommendation" ? recommendationUrl : moduleUrl
	})).data.items));
	return {
		title: `${title} - Line Today`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
