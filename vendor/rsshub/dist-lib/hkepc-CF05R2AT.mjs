import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/hkepc/data.ts
const baseUrl = "https://www.hkepc.com";
const categoryMap = {
	price: {
		url: `${baseUrl}/news`,
		feedSuffix: " - 腦場新聞",
		selector: "#sidebar > div:nth-child(1) > div.content > ul > li"
	},
	review: {
		url: `${baseUrl}/news`,
		feedSuffix: " - 新品快遞",
		selector: "#sidebar > div:nth-child(2) > div.content > ul > li"
	},
	coverStory: {
		url: `${baseUrl}/news`,
		feedSuffix: " - 專題報導",
		selector: "#sidebar > div:nth-child(3) > div.content > ul > li"
	},
	news: {
		url: `${baseUrl}/news`,
		feedSuffix: " - 新聞中心",
		selector: "#sidebar > div:nth-child(4) > div.content > ul > li"
	},
	press: {
		url: `${baseUrl}/news`,
		feedSuffix: " - 業界資訊",
		selector: "#sidebar > div:nth-child(5) > div.content > ul > li"
	},
	member: {
		url: `${baseUrl}/news`,
		feedSuffix: " - 會員消息",
		selector: "#sidebar > div:nth-child(6) > div.content > ul > li"
	},
	digital: {
		url: baseUrl,
		feedSuffix: " - 流動數碼",
		selector: "#contentR5 > div.left > div.article > div.heading"
	},
	entertainment: {
		url: baseUrl,
		feedSuffix: " - 生活娛樂",
		selector: "#contentR5 > div.right > div.article > div.heading"
	},
	latest: {
		url: baseUrl,
		feedSuffix: " - 最新消息",
		selector: "div .item"
	},
	"": {
		url: baseUrl,
		feedSuffix: " - 最新消息",
		selector: "div .item"
	},
	ocLab: {
		url: `${baseUrl}/ocLab`,
		feedSuffix: " - 超頻領域",
		selector: ".heading"
	}
};
//#endregion
//#region lib/routes/hkepc/index.ts
const route = {
	path: "/:category?",
	categories: ["new-media"],
	example: "/hkepc/news",
	parameters: { category: "分类，见下表，默认为最新消息" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["hkepc.com/"],
		target: ""
	}],
	name: "HKEPC 电脑领域",
	maintainers: ["TonyRL"],
	handler,
	url: "hkepc.com/",
	description: `| 专题报导   | 新闻中心 | 新品快递 | 超频领域 | 流动数码 | 生活娱乐      | 会员消息 | 脑场新闻 | 业界资讯 | 最新消息 |
| ---------- | -------- | -------- | -------- | -------- | ------------- | -------- | -------- | -------- | -------- |
| coverStory | news     | review   | ocLab    | digital  | entertainment | member   | price    | press    | latest   |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "";
	const { data: response } = await got_default(categoryMap[category].url, { headers: { Referer: baseUrl } });
	const $ = load(response);
	const list = $(categoryMap[category].selector).find("a").toArray().map((item) => ({
		title: $(item).text(),
		link: baseUrl + $(item).attr("href")
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link, { headers: { Referer: baseUrl } });
		const $ = load(response);
		const content = $("#view");
		const nextPages = $("#articleFooter .navigation a").toArray().map((a) => `${baseUrl}${a.attribs.href}`).slice(1);
		if (nextPages.length) {
			const pages = await Promise.all(nextPages.map(async (url) => {
				const { data: response } = await got_default(url, { headers: { referer: item.link } });
				return load(response)("#view").html();
			}));
			content.append(pages);
		}
		content.find("#view > div.advertisement").remove();
		content.find("div#comments").remove();
		content.find("div#share_btn").remove();
		content.find("#articleFooter").remove();
		content.find("#view > p").filter((_, e) => e.children[0]?.data === String.fromCodePoint(160)).remove();
		content.find("#view > p > img").each((_, e) => {
			if (e.attribs.rel) e.attribs.src = e.attribs.rel;
		});
		item.author = $(".newsAuthor").text().trim() || $("#articleHead div.author").text().trim();
		item.category = $("div#relatedArticles div.tags a").toArray().map((e) => $(e).text().trim());
		item.description = content.html();
		item.pubDate = timezone(parseDate($(".publishDate").text()), 8);
		item.guid = item.link.slice(0, item.link.lastIndexOf("/"));
		return item;
	})));
	return {
		title: `電腦領域 HKEPC${categoryMap[category].feedSuffix}`,
		link: `https://www.hkepc.com/${category}`,
		description: "電腦領域 HKEPC Hardware - 全港 No.1 PC網站",
		language: "zh-hk",
		item: items
	};
}
//#endregion
export { route };
