import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/163/news/special.ts
const typeMap = {
	1: "轻松一刻",
	2: "槽值",
	3: "人间",
	4: "大国小民",
	5: "三三有梗",
	6: "数读",
	7: "看客",
	8: "下划线",
	9: "谈心社",
	10: "哒哒",
	11: "胖编怪聊",
	12: "曲一刀",
	13: "今日之声",
	14: "浪潮",
	15: "沸点"
};
const route = {
	path: "/news/special/:type?",
	categories: ["new-media"],
	example: "/163/news/special/1",
	parameters: { type: "栏目" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "专栏",
	maintainers: ["nczitzk"],
	handler,
	description: `| 轻松一刻 | 槽值 | 人间 | 大国小民 | 三三有梗 | 数读 | 看客 | 下划线 | 谈心社 | 哒哒 | 胖编怪聊 | 曲一刀 | 今日之声 | 浪潮 | 沸点 |
| -------- | ---- | ---- | -------- | -------- | ---- | ---- | ------ | ------ | ---- | -------- | ------ | -------- | ---- | ---- |
| 1        | 2    | 3    | 4        | 5        | 6    | 7    | 8      | 9      | 10   | 11       | 12     | 13       | 14   | 15   |`
};
async function handler(ctx) {
	if (!ctx.req.param("type")) throw new InvalidParameterError("Bad parameter. See <a href=\"https://docs.rsshub.app/routes/game#wang-yi-da-shen\">https://docs.rsshub.app/routes/game#wang-yi-da-shen</a>");
	const selectedType = Number.parseInt(ctx.req.param("type"));
	let type;
	switch (selectedType) {
		case 1:
			type = "BD21K0DLwangning";
			break;
		case 2:
			type = "CICMICLUwangning";
			break;
		case 3:
			type = "CICMOMBLwangning";
			break;
		case 4:
			type = "CICMPVC5wangning";
			break;
		case 5:
			type = "CICMLCOUwangning";
			break;
		case 6:
			type = "D551V75Cwangning";
			break;
		case 7:
			type = "D55253RHwangning";
			break;
		case 8:
			type = "D553A53Lwangning";
			break;
		case 9:
			type = "D553PGHQwangning";
			break;
		case 10:
			type = "CICMS5BIwangning";
			break;
		case 11:
			type = "CQ9UDVKOwangning";
			break;
		case 12:
			type = "CQ9UJIJNwangning";
			break;
		case 13:
			type = "BD284UM8wangning";
			break;
		case 14:
			type = "CICMMGBHwangning";
			break;
		case 15:
			type = "D5543R68wangning";
			break;
		default: break;
	}
	const articlelist0 = (await got_default(`https://3g.163.com/touch/reconstruct/article/list/${type}/0-20.html`)).data.replaceAll(/\s/g, "").match(/artiList\((.*?)\]\}\)/)[1].replace(/".*?wangning/, "\"articles") + "]}";
	const articles = JSON.parse(articlelist0).articles;
	const items = await Promise.all(articles.map((article) => {
		let url = article.url;
		if (url === null || article.skipType === "video") {
			const vid = article.skipURL.match(/vid=(.*)$/);
			if (vid !== null) url = `https://3g.163.com/exclusive/video/${vid[1]}.html`;
		}
		return cache_default.tryGet(url, async () => {
			const $ = load((await got_default(url)).data);
			article.link = url;
			article.description = $(".article-body").html() || $("div[class=\"video\"]").html();
			article.pubDate = parseDate(article.ptime);
			return article;
		});
	}));
	const selectedTypeName = typeMap[selectedType];
	return {
		title: selectedTypeName ? `${selectedTypeName} - 网易专栏` : "网易专栏",
		link: "https://3g.163.com/touch/exclusive/?referFrom=163",
		item: items
	};
}
//#endregion
export { route };
