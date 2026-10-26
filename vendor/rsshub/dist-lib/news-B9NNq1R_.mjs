import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { r as rootUrl, t as buildApiUrl } from "./util-Cmccai7E.mjs";
import { load } from "cheerio";
//#region lib/routes/aibase/news.ts
const route = {
	path: "/news",
	name: "资讯",
	url: "www.aibase.com",
	maintainers: ["zreo0"],
	handler: async (ctx) => {
		const limit = Number(ctx.req.query("limit") ?? "30");
		const currentUrl = new URL("discover", rootUrl).href;
		const $ = load(await rofetch(currentUrl));
		const logoSrc = $("img.logo").prop("src");
		const image = logoSrc ? new URL(logoSrc, rootUrl).href : "";
		const author = $("title").text().split(/_/).pop();
		const { apiInfoListUrl } = await buildApiUrl($);
		return {
			title: "AI新闻资讯",
			description: "AI新闻资讯 - 不错过全球AI革新的每一个时刻",
			language: "zh-cn",
			link: "https://www.aibase.com/zh/news",
			item: (await rofetch(apiInfoListUrl, {
				headers: { accept: "application/json;charset=utf-8" },
				query: {
					pagesize: limit,
					page: 1,
					type: 1,
					isen: 0
				}
			})).map((item) => ({
				title: item.title,
				link: `https://www.aibase.com/zh/news/${item.Id}`,
				description: item.summary,
				pubDate: parseDate(item.addtime),
				author: item.author || "AI Base"
			})),
			allowEmpty: true,
			image,
			author
		};
	},
	example: "/aibase/news",
	description: "获取 AI 资讯列表",
	categories: ["new-media"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.aibase.com/zh/news"],
		target: "/news"
	}]
};
//#endregion
export { route };
