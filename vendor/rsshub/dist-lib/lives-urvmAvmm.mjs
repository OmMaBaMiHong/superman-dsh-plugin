import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderDescription } from "./description-CFLn7TIp.mjs";
import { load } from "cheerio";
//#region lib/routes/jinse/lives.ts
const categories = {
	0: "全部",
	1: "精选",
	2: "政策",
	3: "数据",
	4: "NFT",
	5: "项目"
};
const route = {
	path: "/lives/:category?",
	categories: ["finance"],
	view: 5,
	example: "/jinse/lives",
	parameters: { category: {
		description: "分类",
		options: Object.entries(categories).map(([value, label]) => ({
			value,
			label
		})),
		default: "0"
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "快讯",
	maintainers: ["nczitzk", "pseudoyu"],
	handler,
	description: `| 全部 | 精选 | 政策 | 数据 | NFT | 项目 |
| ---- | ---- | ---- | ---- | --- | ---- |
| 0    | 1    | 2    | 3    | 4   | 5    |`
};
async function handler(ctx) {
	const { category = "0" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 100;
	const rootUrl = "https://jinse.com.cn";
	const apiUrl = new URL("noah/v2/lives", "https://api.jinse.com.cn").href;
	const currentUrl = new URL("lives", rootUrl).href;
	const { data: response } = await got_default(apiUrl, { searchParams: {
		limit,
		reading: false,
		source: "web",
		flag: "up",
		id: 0,
		category
	} });
	const items = response.list.flatMap((l) => l.lives).slice(0, limit).map((item) => ({
		title: item.content_prefix,
		link: new URL(`lives/${item.id}.html`, rootUrl).href,
		description: renderDescription({
			images: item.images?.map((i) => ({
				src: i.url.replace(/_[^\W_]+(\.\w+)$/, "_true$1"),
				width: i.width,
				height: i.height
			})) ?? [],
			description: item.content,
			original: item.link ? {
				link: item.link,
				name: item.link_name
			} : void 0
		}),
		author: item.show_source_name,
		guid: `jinse-lives-${item.id}`,
		pubDate: parseDate(item.created_at, "X"),
		upvotes: item.up_counts ?? 0,
		downvotes: item.down_counts ?? 0,
		comments: item.comment_count ?? 0
	})) ?? [];
	const { data: currentResponse } = await got_default(currentUrl);
	const $ = load(currentResponse);
	const author = $("meta[name=\"author\"]").prop("content");
	const image = $("a.js-logoBox img").prop("src");
	const icon = new URL($("link[rel=\"favicon\"]").prop("href"), rootUrl).href;
	return {
		item: items,
		title: `${author} - ${Object.hasOwn(categories, category) ? categories[category] : category}`,
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: $("html").prop("lang"),
		image,
		icon,
		logo: icon,
		subtitle: $("meta[name=\"keywords\"]").prop("content"),
		author,
		allowEmpty: true
	};
}
//#endregion
export { route };
