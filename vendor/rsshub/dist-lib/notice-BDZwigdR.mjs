import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/scut/smae/notice.ts
const categoryMap = {
	gwxx: {
		title: "公务信息",
		tag: "20616"
	},
	djgz: {
		title: "党建工作",
		tag: "20617"
	},
	rsgz: {
		title: "人事工作",
		tag: "20622"
	},
	xsgz: {
		title: "学生工作",
		tag: "xsgz"
	},
	kysys: {
		title: "科研实验室",
		tag: "20618"
	},
	bksjw: {
		title: "本科生教务",
		tag: "20619"
	},
	yjsjw: {
		title: "研究生教务",
		tag: "20620"
	}
};
const route = {
	path: "/smae/:category?",
	categories: ["university"],
	example: "/scut/smae/yjsjw",
	parameters: { category: "通知分类，默认为 `yjsjw`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "机械与汽车工程学院 - 通知公告",
	maintainers: ["Ermaotie"],
	handler,
	description: `| 公务信息 | 党建工作 | 人事工作 | 学生工作 | 科研实验室 | 本科生教务 | 研究生教务 |
| -------- | -------- | -------- | -------- | ---------- | ---------- | ---------- |
| gwxx     | djgz     | rsgz     | xsgz     | kysys      | bksjw      | yjsjw      |`
};
async function handler(ctx) {
	const baseUrl = "http://www2.scut.edu.cn";
	const categoryName = ctx.req.param("category") || "yjsjw";
	const categoryMeta = categoryMap[categoryName];
	const url = `${baseUrl}/smae/${categoryMeta.tag}/list.htm`;
	const { data: response } = await got_default(url);
	const $ = load(response);
	const list = $("#wp_news_w6 ul li.news").toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		const pubDate = item.find("span.news_meta");
		return {
			title: a.attr("title"),
			link: `${baseUrl}${a.attr("href")}`,
			pubDate: parseDate(pubDate.text())
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		item.description = load(response)("div.wp_articlecontent").html();
		return item;
	})));
	return {
		title: `华南理工大学机械与汽车工程学院 - ${categoryMeta.title}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
