import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/zjut/da/index.ts
const rootUrl = "http://www.design.zjut.edu.cn/";
const host = "http://www.design.zjut.edu.cn/BigClass.jsp?";
const map = /* @__PURE__ */ new Map([
	[1, {
		id: "bigclassid=16",
		title: "学院新闻 - 浙工大设建学院"
	}],
	[2, {
		id: "bigclassid=18",
		title: "公告通知 - 浙工大设建学院"
	}],
	[3, {
		id: "bigclassid=5&sid=25",
		title: "科研申报 - 浙工大设建学院"
	}],
	[4, {
		id: "bigclassid=5&sid=26",
		title: "科研成果 - 浙工大设建学院"
	}],
	[5, {
		id: "bigclassid=5&sid=27",
		title: "文件与资源 - 浙工大设建学院"
	}],
	[6, {
		id: "bigclassid=20",
		title: "学术交流 - 浙工大设建学院"
	}]
]);
const route = {
	path: "/da/:type",
	categories: ["university"],
	example: "/zjut/da/1",
	parameters: { type: "分类，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "设计与建筑学院",
	maintainers: ["yikZero"],
	url: "www.design.zjut.edu.cn",
	handler,
	description: `| 学院新闻 | 公告通知 | 科研申报 | 科研成果 | 文件与资源 | 学术交流 |
| -------- | -------- | -------- | -------- | ---------- | -------- |
| 1        | 2        | 3        | 4        | 5          | 6        |`
};
async function handler(ctx) {
	const type = Number.parseInt(ctx.req.param("type"));
	const id = map.get(type)?.id;
	const listResponse = await got_default(`${host}${id}`, { responseType: "buffer" });
	listResponse.data = iconv.decode(listResponse.data, "gbk");
	const $ = load(listResponse.data);
	const list = $("td[class='newstd'] .news2").toArray().map((item) => {
		item = $(item);
		const title = item.find("a").text();
		let link = item.find("a").attr("href");
		if (!link) return null;
		if (!link.startsWith("http")) link = rootUrl + link;
		return {
			title,
			description: "",
			pubDate: parseDate(item.next().text().replace("[", "").replace("]", "")),
			link
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default(item.link)).data)("div[style=\"line-height:27px;\"]").html();
		return item;
	})));
	return {
		title: map.get(type)?.title,
		link: `${host}${id}`,
		item: items
	};
}
//#endregion
export { route };
