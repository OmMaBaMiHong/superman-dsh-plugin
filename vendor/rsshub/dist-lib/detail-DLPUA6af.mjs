import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as rootUrl } from "./utils-BhxW03lY.mjs";
import { load } from "cheerio";
//#region lib/routes/agefans/detail.ts
const route = {
	path: "/detail/:id",
	categories: ["anime"],
	example: "/agefans/detail/20200035",
	parameters: { id: "番剧 id，对应详情 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["agemys.org/detail/:id"] }],
	name: "番剧详情",
	maintainers: ["s2marine"],
	handler
};
async function handler(ctx) {
	const $ = load((await got_default(`${rootUrl}/detail/${ctx.req.param("id")}`)).data);
	const ldJson = JSON.parse($("script[type=\"application/ld+json\"]").text());
	const items = $(".video_detail_episode").first().find("li").toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		return {
			title: a.text(),
			link: a.attr("href").replace("http://", "https://")
		};
	}).toReversed();
	return {
		title: `AGE动漫 - ${ldJson.name}`,
		link: `${rootUrl}/detail/${ctx.req.param("id")}`,
		description: ldJson.description,
		item: items
	};
}
//#endregion
export { route };
