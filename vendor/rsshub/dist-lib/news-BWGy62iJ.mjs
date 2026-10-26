import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/catti/news.ts
const NEWS_TYPES = {
	ggl: {
		title: "通知公告",
		description: "CATTI 考试通知和公告"
	},
	ywdt: {
		title: "要闻动态",
		description: "CATTI 考试要闻动态"
	},
	zxzc: {
		title: "最新政策",
		description: "CATTI 考试最新政策"
	}
};
const handler = async (ctx) => {
	const category = ctx.req.param("category");
	const BASE_URL = `https://www.catticenter.com/${category}`;
	const { data: listPage } = await got_default(BASE_URL);
	const $ = load(listPage);
	const contentLinkList = $("ul.ui-card.ui-card-a > li").toArray().map((element) => {
		const date = $(element).find("span.ui-right-time").text();
		const title = $(element).find("a").attr("title");
		const absoluteLink = `https://www.catticenter.com${$(element).find("a").attr("href")}`;
		return {
			date: parseDate(date),
			title,
			link: absoluteLink
		};
	});
	return {
		title: NEWS_TYPES[category].title,
		description: NEWS_TYPES[category].description,
		link: BASE_URL,
		image: "https://www.catticenter.com/img/applogo.png",
		item: await Promise.all(contentLinkList.map((item) => cache_default.tryGet(item.link, async () => {
			const CONTENT_SELECTOR = "div.ui-article-cont";
			const { data: contentResponse } = await got_default(item.link);
			const content = load(contentResponse)(CONTENT_SELECTOR).html() || "";
			return {
				title: item.title,
				pubDate: item.date,
				link: item.link,
				description: content,
				category: ["study"],
				guid: item.link,
				id: item.link,
				image: "https://www.catticenter.com/img/applogo.png",
				content,
				updated: item.date,
				language: "zh-cn"
			};
		}))),
		allowEmpty: true,
		language: "zh-cn",
		feedLink: "https://rsshub.app/ruankao/news",
		id: "https://rsshub.app/ruankao/news"
	};
};
const route = {
	path: "/news/:category",
	name: "CATTI 考试消息",
	maintainers: ["PrinOrange"],
	description: `| Category | 标题     | 描述                 |
| -------- | -------- | -------------------- |
| ggl      | 通知公告 | CATTI 考试通知和公告 |
| ywdt     | 要闻动态 | CATTI 考试要闻动态   |
| zxzc     | 最新政策 | CATTI 考试最新政策   |`,
	handler,
	categories: ["study"],
	parameters: { category: "消息分类名，可在下面的描述中找到。" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		supportRadar: true
	},
	example: "/catti/news/zxzc",
	radar: [{ source: ["www.catticenter.com/:category"] }]
};
//#endregion
export { route };
