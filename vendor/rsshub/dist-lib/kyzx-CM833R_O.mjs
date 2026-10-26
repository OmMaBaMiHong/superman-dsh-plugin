import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/chsi/kyzx.ts
const host = "https://yz.chsi.com.cn";
const route = {
	path: "/kyzx/:type",
	categories: ["study"],
	example: "/chsi/kyzx/fstj",
	parameters: { type: " type 见下表，亦可在网站 URL 找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yz.chsi.com.cn/kyzx/:type"] }],
	name: "考研资讯",
	maintainers: ["yanbot-team"],
	handler,
	description: `| \`:type\` | 专题名称 |
| ------- | -------- |
| fstj    | 复试调剂 |
| kydt    | 考研动态 |
| zcdh    | 政策导航 |
| kyrw    | 考研人物 |
| jyxd    | 经验心得 |`
};
async function handler(ctx) {
	const { type } = ctx.req.param();
	const $ = load((await got_default(`${host}/kyzx/${type}`)).data);
	const typeName = $(".bread-nav .location a").last().text() || "考研资讯";
	const list = $("ul.news-list").children();
	const items = await Promise.all(list.map((i, item) => {
		item = $(item);
		const itemTitle = item.find("a").text();
		const itemDate = item.find(".span-time").text();
		const path = item.find("a").attr("href");
		let itemUrl = "";
		itemUrl = path.startsWith("http") ? path : host + path;
		return cache_default.tryGet(itemUrl, async () => {
			let description;
			if (itemUrl) description = load((await got_default(itemUrl)).data)("#article_dnull").html().trim();
			else description = itemTitle;
			return {
				title: itemTitle,
				link: itemUrl,
				pubDate: timezone(parseDate(itemDate), 8),
				description
			};
		});
	}));
	return {
		title: `中国研究生招生信息网 - ${typeName}`,
		link: `${host}/kyzx/${type}/`,
		description: `中国研究生招生信息网 - ${typeName}`,
		item: items
	};
}
//#endregion
export { route };
