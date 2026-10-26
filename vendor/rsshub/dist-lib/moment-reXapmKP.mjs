import { t as got_default } from "./got-Dnzt41dd.mjs";
import { d as processItems, f as rootUrl, i as apiMomentRootUrl, o as buildFeedMetadata, s as buildHuxiuRouteTitlePrefix } from "./util-CislQG2a.mjs";
//#region lib/routes/huxiu/moment.ts
const route = {
	path: "/moment",
	categories: ["new-media"],
	example: "/huxiu/moment",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: true,
		supportScihub: false
	},
	radar: [{ source: ["huxiu.com/moment"] }],
	name: "24 小时",
	maintainers: ["nczitzk"],
	handler,
	url: "huxiu.com/moment"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20;
	const apiUrl = new URL("web-v3/moment/feed", apiMomentRootUrl).href;
	const currentUrl = new URL("moment", rootUrl).href;
	const { data: response } = await got_default.post(apiUrl, { form: { platform: "www" } });
	return {
		item: await processItems(response.data.moment_list.datalist, limit),
		...buildFeedMetadata({
			title: "24 小时",
			link: currentUrl,
			description: "虎嗅 24 小时",
			subtitle: "24 小时",
			titlePrefix: buildHuxiuRouteTitlePrefix(route.name)
		})
	};
}
//#endregion
export { route };
