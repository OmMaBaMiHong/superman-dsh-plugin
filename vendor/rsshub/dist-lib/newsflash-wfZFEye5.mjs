import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as rootUrl } from "./utils-CBgZTdf5.mjs";
//#region lib/routes/odaily/newsflash.ts
const route = {
	path: "/newsflash",
	categories: ["new-media"],
	example: "/odaily/newsflash",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["0daily.com/newsflash", "0daily.com/"] }],
	name: "快讯",
	maintainers: ["nczitzk"],
	handler,
	url: "0daily.com/newsflash"
};
async function handler(ctx) {
	const items = (await got_default({
		method: "get",
		url: `${rootUrl}/api/pp/api/info-flow/newsflash_columns/newsflashes?b_id=&per_page=${ctx.req.query("limit") ?? 100}`
	})).data.data.items.map((item) => ({
		title: item.title,
		link: item.news_url,
		pubDate: timezone(parseDate(item.published_at), 8),
		description: `<p>${item.description}</p>`
	}));
	return {
		title: "快讯 - Odaily星球日报",
		link: `${rootUrl}/newsflash`,
		item: items
	};
}
//#endregion
export { route };
