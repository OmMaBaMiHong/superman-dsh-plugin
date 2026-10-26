import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/panewslab/topic.ts
const route = {
	path: "/topic/:id",
	categories: ["new-media"],
	example: "/panewslab/topic/1629365774078402",
	parameters: { id: "专题 id，可在地址栏 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["panewslab.com/"] }],
	name: "专题",
	maintainers: ["nczitzk"],
	handler,
	url: "panewslab.com/"
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const rootUrl = "https://panewslab.com";
	const apiUrl = `${rootUrl}/webapi/subject/articles?Rn=${ctx.req.query("limit") ?? 25}&LId=1&sid=${id}&tw=0`;
	const currentUrl = `${rootUrl}/zh/topiclist/${id}.html`;
	let items = (await got_default({
		method: "get",
		url: apiUrl
	})).data.data.map((item) => ({
		title: item.title,
		author: item.author.name,
		pubDate: parseDate(item.publishTime * 1e3),
		link: `${rootUrl}/zh/articledetails/${item.id}.html`,
		description: `<blockquote>${item.desc}</blockquote>`,
		category: item.tags
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description += content("#txtinfo").html();
		return item;
	})));
	return {
		title: `PANews - ${id}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
