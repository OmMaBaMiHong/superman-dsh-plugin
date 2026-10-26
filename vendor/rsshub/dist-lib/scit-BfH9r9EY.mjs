import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/nju/scit.ts
const route = {
	path: "/scit/:type",
	categories: ["university"],
	example: "/nju/scit/tzgg",
	parameters: { type: "分类名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "科学技术处",
	maintainers: ["ret-1"],
	handler,
	description: `| 通知公告 | 科研动态 |
| -------- | -------- |
| tzgg     | kydt     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const type_dict = {
		tzgg: ["https://scit.nju.edu.cn/10916/list.htm", "通知公告"],
		kydt: ["https://scit.nju.edu.cn/11003/list.htm", "科研动态"]
	};
	const data = (await got_default({
		method: "get",
		url: type_dict[type][0]
	})).data;
	const $ = load(data);
	const list = $("li.list_item");
	return {
		title: `科学技术处-${type_dict[type][1]}`,
		link: type_dict[type][0],
		item: list.toArray().map((item) => {
			item = $(item);
			return {
				title: item.find("a").attr("title"),
				link: "https://scit.nju.edu.cn" + item.find("a").attr("href"),
				pubDate: timezone(parseDate(item.find(".Article_PublishDate").first().text(), "YYYY-MM-DD"), 8)
			};
		})
	};
}
//#endregion
export { route };
