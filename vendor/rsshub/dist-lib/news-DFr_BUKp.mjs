import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/hafu/utils.tsx
const typeMap = {
	ggtz: {
		url: "https://www.hafu.edu.cn/index/ggtz.htm",
		root: "https://www.hafu.edu.cn/",
		title: "河南财院 - 公告通知",
		parseFn: ggtzParse
	},
	jwc: {
		url: "https://jwc.hafu.edu.cn/tzgg.htm",
		root: "https://jwc.hafu.edu.cn/",
		title: "河南财院 教务处 - 公告通知",
		parseFn: jwcParse
	},
	zsjyc: {
		url: "https://zsjyc.hafu.edu.cn/tztg.htm",
		root: "https://zsjyc.hafu.edu.cn/",
		title: "河南财院 招生就业处 - 公告通知",
		parseFn: zsjycParse
	}
};
let limit = 10;
const parseList = async (ctx, type) => {
	const link = typeMap[type].url;
	const title = typeMap[type].title;
	const $ = load((await got_default(link)).data);
	limit = ctx.req.query("limit") || limit;
	return {
		title,
		link,
		resultList: await typeMap[type].parseFn(ctx, $)
	};
};
async function tryGetFullText(href, link, type) {
	let articleData = "";
	let description;
	try {
		articleData = load((await got_default(link)).data);
		let articleBody = articleData("div[class=v_news_content]").html();
		if (articleData("[id^=nattach]").length !== 0) articleBody = tryGetAttachments(articleData, articleBody, type);
		description = articleBody ? renderToString(/* @__PURE__ */ jsx(Fragment, { children: raw(articleBody) })) : "";
	} catch {
		description = href;
	}
	return {
		articleData,
		description
	};
}
function tryGetAttachments(articleData, articleBody, type) {
	return articleBody + (type === "ggtz" ? articleData("[id^=nattach]").prev().toArray().map((item) => {
		const href = articleData(item).attr("href").slice(1);
		return `<br/><a href=${typeMap.ggtz.root + href}>${articleData(item).text()}</a>`;
	}).join("") : articleData("[id^=nattach]").parent().prev().toArray().map((item) => {
		const href = articleData(item).find("a").attr("href").slice(1);
		return `<br/><a href=${typeMap[type].root + href}> ${articleData(item).find("a").find("span").text()} </a>`;
	}).join(""));
}
async function ggtzParse(ctx, $) {
	const data = $("a[class=c269582]").parent().slice(0, limit);
	return await Promise.all(data.toArray().map(async (item) => {
		const href = $(item).find("a[class=c269582]").attr("href").slice(3);
		const link = typeMap.ggtz.root + href;
		const title = $(item).find("a[class=c269582]").attr("title");
		return await cache_default.tryGet(link, async () => {
			const { articleData, description } = await tryGetFullText(href, link, "ggtz");
			let author = "";
			let pubDate;
			if (typeof articleData === "function") {
				const header = articleData("h1").next().text();
				const index = header.indexOf("日期");
				author = header.slice(0, index - 2) || "";
				pubDate = parseDate(header.slice(index + 3, index + 19), "YYYY-MM-DD HH:mm");
			} else pubDate = parseDate($(item).find("a[class=c269582_date]").text(), "YYYY-MM-DD");
			return {
				title,
				description,
				pubDate: timezone(pubDate, 8),
				link,
				author
			};
		});
	}));
}
async function jwcParse(ctx, $) {
	const data = $("a[class=c259713]").parent().parent().slice(0, limit);
	return await Promise.all(data.toArray().map(async (item) => {
		const href = $(item).find("a[class=c259713]").attr("href");
		const link = typeMap.jwc.root + href;
		const title = $(item).find("a[class=c259713]").attr("title");
		const pubDate = parseDate($(item).find("span[class=timestyle259713]").text(), "YYYY/MM/DD");
		return await cache_default.tryGet(link, async () => {
			const { articleData, description } = await tryGetFullText(href, link, "jwc");
			let author = "";
			if (typeof articleData === "function") author = articleData("span[class=authorstyle259690]").text();
			return {
				title,
				description,
				pubDate: timezone(pubDate, 8),
				link,
				author: "供稿单位：" + author
			};
		});
	}));
}
async function zsjycParse(ctx, $) {
	const data = $("a[class=c127701]").parent().parent().slice(0, limit);
	return await Promise.all(data.toArray().map(async (item) => {
		const href = $(item).find("a[class=c127701]").attr("href");
		const link = typeMap.zsjyc.root + href;
		const title = $(item).find("a[class=c127701]").attr("title");
		return await cache_default.tryGet(link, async () => {
			const { articleData, description } = await tryGetFullText(href, link, "zsjyc");
			let pubDate;
			if (typeof articleData === "function") pubDate = parseDate(articleData("span[class=timestyle127702]").text(), "YYYY-MM-DD HH:mm");
			else pubDate = parseDate($(item).find("a[class=c269582_date]").text(), "YYYY-MM-DD");
			return {
				title,
				description,
				pubDate: timezone(pubDate, 8),
				link,
				author: "供稿单位：招生就业处"
			};
		});
	}));
}
//#endregion
//#region lib/routes/hafu/news.ts
const route = {
	path: "/news/:type?",
	categories: ["university"],
	example: "/hafu/news/ggtz",
	parameters: { type: "分类，见下表（默认为 `ggtz`)" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "河南财政金融学院",
	maintainers: [],
	handler,
	description: `| 校内公告通知 | 教务处公告通知 | 招生就业处公告通知 |
| ------------ | -------------- | ------------------ |
| ggtz         | jwc            | zsjyc              |`
};
async function handler(ctx) {
	const { link, title, resultList } = await parseList(ctx, ctx.req.param("type") ?? "ggtz");
	return {
		title,
		link,
		description: "河南财政金融学院 - 公告通知",
		item: resultList
	};
}
//#endregion
export { route };
