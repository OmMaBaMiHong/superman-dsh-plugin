import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/txks/news.ts
const BASE_URL = "https://www.txks.org.cn/index/work.html";
const removeFontPresetting = (html = "") => {
	const $ = load(html);
	$("[style]").each((_, element) => {
		const cleanedStyle = ($(element).attr("style") || "").replaceAll(/font-family:[^;]*;?/gi, "").trim();
		$(element).attr("style", cleanedStyle || null);
	});
	$("style").each((_, styleElement) => {
		const cleanedCssText = ($(styleElement).html() || "").replaceAll(/font-family:[^;]*;?/gi, "");
		$(styleElement).html(cleanedCssText);
	});
	return $.html();
};
const handler = async () => {
	const { data: listResponse } = await got_default(BASE_URL);
	const $ = load(listResponse);
	const contentLinkList = $("ul[class*=\"newsList\"] > li").toArray().map((element) => {
		const date = $(element).find("label.time").text().trim().slice(1, -1);
		const title = $(element).find("a").attr("title");
		const link = $(element).find("a").attr("href");
		return {
			date: parseDate(date),
			title,
			link
		};
	});
	return {
		title: "全国通信专业技术人员职业水平考试",
		description: "全国通信专业技术人员职业水平考试网站最新动态和消息推送",
		link: BASE_URL,
		image: "https://www.txks.org.cn/asset/image/logo/logo.png",
		item: await Promise.all(contentLinkList.map((item) => cache_default.tryGet(item.link, async () => {
			const CONTENT_SELECTOR = "#contentTxt";
			const { data: contentResponse } = await got_default(item.link);
			const contentPage = load(contentResponse);
			const content = removeFontPresetting(contentPage(CONTENT_SELECTOR).html() || "");
			return {
				title: item.title,
				pubDate: item.date,
				link: item.link,
				description: content,
				category: ["study"],
				guid: item.link,
				id: item.link,
				image: "https://www.txks.org.cn/asset/image/logo/logo.png",
				content,
				updated: item.date,
				language: "zh-CN"
			};
		}))),
		allowEmpty: true,
		language: "zh-CN",
		feedLink: "https://rsshub.app/txks/news",
		id: "https://rsshub.app/txks/news"
	};
};
const route = {
	path: "/news",
	name: "通信考试动态",
	description: "**注意：** 官方网站限制了国外网络请求，可能需要通过部署在中国大陆内的 RSSHub 实例访问。",
	maintainers: ["PrinOrange"],
	handler,
	categories: ["study"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		supportRadar: true
	},
	radar: [{
		title: "全国通信专业技术人员职业水平考试动态",
		source: ["www.txks.org.cn/index/work", "www.txks.org.cn"],
		target: "/news"
	}],
	example: "/txks/news"
};
//#endregion
export { route };
