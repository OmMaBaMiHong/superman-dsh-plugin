import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/sspai/column.ts
const route = {
	path: "/column/:id",
	categories: ["new-media"],
	example: "/sspai/column/262",
	parameters: { id: "专栏 id" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["sspai.com/column/:id"] }],
	name: "专栏",
	maintainers: ["LogicJake"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const link = `https://sspai.com/column/${id}`;
	let response = await got_default({
		method: "get",
		url: `https://sspai.com/api/v1/special_columns/${id}`,
		headers: { Referer: link }
	});
	const result = response.data;
	const title = result.title;
	const description = result.intro;
	response = await got_default({
		method: "get",
		url: `https://sspai.com/api/v1/articles?offset=0&limit=10&special_column_ids=${id}&include_total=false`,
		headers: { Referer: link }
	});
	const list = response.data.list;
	const out = await Promise.all(list.map((item) => {
		const title = item.title;
		const date = item.created_at;
		const link = `https://sspai.com/api/v1/article/info/get?id=${item.id}&view=second&support_webp=true`;
		const itemUrl = `https://sspai.com/post/${item.id}`;
		const author = item.author.nickname;
		return cache_default.tryGet(`sspai: ${item.id}`, async () => {
			const description = (await got_default(link)).data.data.body;
			return {
				title,
				link: itemUrl,
				author,
				description,
				pubDate: parseDate(date * 1e3)
			};
		});
	}));
	return {
		title: `少数派专栏-${title}`,
		link,
		description,
		item: out
	};
}
//#endregion
export { route };
