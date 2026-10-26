import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hellogithub/index.ts
const sorts = {
	featured: "精选",
	all: "全部"
};
const route = {
	path: "/home/:sort?/:id?",
	categories: ["programming"],
	example: "/hellogithub/home",
	parameters: {
		sort: "排序方式，见下表，默认为 `featured`，即精选",
		id: "标签 id，可在对应标签页 URL 中找到，默认为全部标签"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "开源项目",
	maintainers: [
		"moke8",
		"nczitzk",
		"CaoMeiYouRen"
	],
	handler,
	description: `| 精选     | 全部 |
| -------- | ---- |
| featured | all  |`
};
async function handler(ctx) {
	const sort = ctx.req.param("sort") ?? "featured";
	const id = ctx.req.param("id") ?? "";
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 20;
	const rootUrl = "https://hellogithub.com";
	const apiRootUrl = "https://api.hellogithub.com";
	const currentUrl = `${rootUrl}/?sort_by=${sort}${id ? `&tid=${id}` : ""}`;
	const response = await got_default({
		method: "get",
		url: `${apiRootUrl}/v1/?sort_by=${sort}${id ? `&tid=${id}` : ""}&page=1`
	});
	let tag;
	if (id) tag = load((await got_default({
		method: "get",
		url: `${rootUrl}/tags/${id}`
	})).data)("meta[property=\"og:title\"]")?.attr("content")?.split(" ").pop();
	const items = response.data.data.slice(0, limit).map((item) => ({
		guid: item.item_id,
		title: `${item.name}: ${item.title}`,
		author: item.author,
		link: `${rootUrl}/repository/${item.item_id}`,
		pubDate: parseDate(item.updated_at),
		name: `${item.author}/${item.name}`,
		description: item.summary,
		language: item.primary_lang
	}));
	return {
		title: `HelloGithub - ${sorts[sort]}${tag || ""}开源项目`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
