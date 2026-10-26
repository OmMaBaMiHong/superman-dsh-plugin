import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/sspai/series-update.ts
const route = {
	path: "/series/:id",
	categories: ["new-media"],
	example: "/sspai/series/77",
	parameters: { id: "专栏 id" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: [
		"sspai.com/series/:id",
		"sspai.com/series/:id/list",
		"sspai.com/series/:id/metadata"
	] }],
	name: "付费专栏文章更新",
	maintainers: ["TonyRL"],
	handler,
	url: "sspai.com/series"
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const seriesInfo = await got_default.get(`https://sspai.com/api/v1/series/info/get?id=${id}&view=second`);
	const response = await got_default(`https://sspai.com/api/v1/series/article/search/page/get?series_id=${id}&weight=0&sort=desc&title=&limit=${ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 40}&offset=0`);
	const items = await Promise.all(response.data.data.map(async (item) => {
		let description;
		if (item.probation) description = (await got_default(`https://sspai.com/api/v1/article/info/get?id=${item.id}&view=second&support_webp=true`)).data.data.body;
		else description = `<img src="https://cdn.sspai.com/${item.banner}">`;
		return {
			title: item.title_prefix + " - " + item.title,
			description,
			author: seriesInfo.data.data.author.nickname,
			link: `https://sspai.com/post/${item.id}`,
			pubDate: parseDate(item.created_at * 1e3)
		};
	}));
	return {
		title: `${seriesInfo.data.data.title} - 少数派`,
		description: `${seriesInfo.data.data.description} - 少数派`,
		link: `https://sspai.com/series/${id}`,
		item: items
	};
}
//#endregion
export { route };
