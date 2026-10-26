import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as parseItem, t as baseUrl } from "./utils-BdD6YUBE.mjs";
import { load } from "cheerio";
//#region lib/routes/dcfever/news.ts
const route = {
	path: "/news/:type?",
	categories: ["new-media"],
	example: "/dcfever/news",
	parameters: { type: "分類，預設為所有新聞" },
	name: "新聞中心",
	maintainers: ["TonyRL"],
	handler,
	radar: [{
		source: ["dcfever.com/news/index.php"],
		target: "/news"
	}],
	description: `| 所有新聞 | 攝影器材 | 手機通訊 | 汽車熱話 | 攝影文化    | 影片攝錄    | 測試報告 | 生活科技 | 攝影技巧  |
| -------- | -------- | -------- | -------- | ----------- | ----------- | -------- | -------- | --------- |
|          | camera   | mobile   | auto     | photography | videography | reviews  | gadget   | technique |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const link = new URL(`${baseUrl}/news/index.php`, baseUrl);
	link.searchParams.append("type", type);
	const $ = load(await rofetch(link.href));
	const list = $(".col-md-left .title a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: new URL(item.attr("href"), link.href).href
		};
	});
	const items = await Promise.all(list.map((item) => parseItem(item)));
	return {
		title: `${$(".channel_nav").contents().filter((_, e) => e.nodeType === 3).text()} - ${$("head title").text()}`,
		link: link.href,
		image: "https://cdn10.dcfever.com/images/android_192.png",
		item: items
	};
}
//#endregion
export { route };
