import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/nasa/apod-cn.ts
const route = {
	path: "/apod-cn",
	categories: ["picture"],
	example: "/nasa/apod-cn",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["apod.nasa.govundefined"] }],
	name: "NASA 中文",
	maintainers: ["nczitzk", "williamgateszhao"],
	handler,
	url: "apod.nasa.govundefined",
	description: `::: tip
[NASA 中文](https://www.nasachina.cn/) 提供了每日天文图的中英双语图文说明，但在更新上偶尔略有一两天的延迟。
:::`
};
async function handler(ctx) {
	const { data } = await got_default({
		method: "get",
		url: `https://www.nasachina.cn/wp-json/wp/v2/posts?categories=2&per_page=${ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 10}`
	});
	return {
		title: "NASA中文 - 天文·每日一图",
		link: "https://www.nasachina.cn/nasa-image-of-the-day",
		item: data.map((item) => ({
			title: item.title.rendered,
			description: item.content.rendered,
			pubDate: parseDate(item.date_gmt),
			link: item.link
		}))
	};
}
//#endregion
export { route };
