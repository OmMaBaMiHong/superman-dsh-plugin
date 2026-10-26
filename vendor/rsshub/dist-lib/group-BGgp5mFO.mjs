import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/aliyun/developer/group.ts
const route = {
	path: "/developer/group/:type",
	categories: ["programming"],
	example: "/aliyun/developer/group/alitech",
	parameters: { type: "对应技术领域分类" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["developer.aliyun.com/group/:type"] }],
	name: "开发者社区 - 主题",
	maintainers: ["umm233"],
	handler
};
async function handler(ctx) {
	const link = `https://developer.aliyun.com/group/${ctx.req.param("type")}`;
	const data = (await got_default({
		method: "get",
		url: link
	})).data;
	const $ = load(data);
	const title = $("div[class=\"header-information-title\"]").contents().filter((element) => element.nodeType === 3).text().trim();
	const desc = $("div[class=\"header-information\"]").find("span").last().text().trim();
	const list = $("ul[class^=\"content-tab-list\"] > li");
	return {
		title: `阿里云开发者社区-${title}`,
		link,
		description: desc,
		item: list.toArray().map((item) => {
			item = $(item);
			const desc = item.find(".question-desc");
			const description = item.find(".browse").text() + " " + desc.find(".answer").text();
			return {
				title: item.find(".question-title").text().trim() || item.find("a p").text().trim(),
				link: item.find("a").attr("href"),
				pubDate: parseDate(item.find(".time").text()),
				description
			};
		})
	};
}
//#endregion
export { route };
