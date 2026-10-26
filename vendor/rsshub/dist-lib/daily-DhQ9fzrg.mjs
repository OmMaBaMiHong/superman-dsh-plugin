import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as rootUrl, t as buildApiUrl } from "./util-Cmccai7E.mjs";
import { load } from "cheerio";
//#region lib/routes/aibase/daily.ts
const route = {
	path: "/daily",
	name: "AI日报",
	url: "www.aibase.com",
	maintainers: ["3tuuu"],
	handler: async (ctx) => {
		const limit = Number(ctx.req.query("limit") ?? "30");
		const currentUrl = new URL("discover", rootUrl).href;
		const $ = load(await rofetch(currentUrl));
		const logoSrc = $("img.logo").prop("src");
		const image = logoSrc ? new URL(logoSrc, rootUrl).href : "";
		const author = "AI Base";
		const { aILogListUrl } = await buildApiUrl($);
		const response = await rofetch(aILogListUrl, {
			headers: { accept: "application/json;charset=utf-8" },
			query: {
				pagesize: limit,
				page: 1,
				type: 2,
				isen: 0
			}
		});
		if (!response || !response.data) throw new Error("日报数据不存在或为空");
		return {
			title: "AI日报",
			description: "每天三分钟关注AI行业趋势",
			language: "zh-cn",
			link: "https://www.aibase.com/zh/daily",
			item: await Promise.all(response.data.slice(0, limit).map(async (item) => {
				const articleUrl = `https://www.aibase.com/zh/news/${item.Id}`;
				return await cache_default.tryGet(articleUrl, async () => {
					const description = load(await rofetch(articleUrl))(".post-content").html();
					if (!description) throw new Error(`Empty content: ${articleUrl}`);
					return {
						title: item.title,
						link: articleUrl,
						description,
						pubDate: parseDate(item.addtime),
						author: "AI Base"
					};
				});
			})),
			allowEmpty: true,
			image,
			author
		};
	},
	example: "/aibase/daily",
	description: "获取 AI 日报",
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
		source: ["www.aibase.com/zh/daily"],
		target: "/daily"
	}]
};
//#endregion
export { route };
