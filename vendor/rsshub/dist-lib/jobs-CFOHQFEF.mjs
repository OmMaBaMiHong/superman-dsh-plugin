import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/douban/other/jobs.ts
const rootUrl = "https://jobs.douban.com";
const titleMap = {
	social: "社会招聘",
	campus: "校园招聘",
	intern: "实习生招聘"
};
const route = {
	path: "/jobs/:type",
	categories: ["social-media"],
	example: "/douban/jobs/campus",
	parameters: { type: "招聘类型，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "豆瓣招聘",
	maintainers: ["Fatpandac"],
	handler,
	description: `| 社会招聘 | 校园招聘 | 实习生招聘 |
| :------: | :------: | :--------: |
|  social  |  campus  |   intern   |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const url = `${rootUrl}/jobs/${type}`;
	const $ = load((await got_default.get(url)).data);
	const items = $("div.mod.position").toArray().map((item) => ({
		title: $(item).find("h3").text(),
		link: `${url}#${$(item).find("h3").attr("id")}`,
		description: $(item).find("div.bd").html()
	}));
	return {
		title: `豆瓣${titleMap[type]}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
