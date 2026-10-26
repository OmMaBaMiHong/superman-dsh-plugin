import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/storm/index.ts
const route = {
	path: "/:category?/:id?",
	categories: ["new-media"],
	example: "/storm",
	parameters: {
		category: "分类，见下表，默认为新聞總覽",
		id: "子分类 ID，可在 URL 中找到"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["storm.mg/:category/:id"] }],
	name: "分类",
	maintainers: ["nczitzk"],
	handler,
	description: `| 新聞總覽 | 地方新聞      | 歷史頻道 | 評論總覽    |
| -------- | ------------- | -------- | ----------- |
| articles | localarticles | history  | all-comment |

::: tip
支持形如 \`https://www.storm.mg/category/118\` 的路由，即 [\`/storm/category/118\`](https://rsshub.app/storm/category/118)

支持形如 \`https://www.storm.mg/localarticle-category/s149845\` 的路由，即 [\`/storm/localarticle-category/s149845\`](https://rsshub.app/storm/localarticle-category/s149845)
:::`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "articles";
	const id = ctx.req.param("id") ?? "";
	const currentUrl = `https://www.storm.mg/${category}${id ? `/${id}` : ""}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(".link_title").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content(".notify_wordings").remove();
		content("#premium_block").remove();
		item.description = content("#CMS_wrapper").html();
		item.author = content("meta[property=\"dable:author\"]").attr("content");
		item.pubDate = parseDate(content("meta[itemprop=\"datePublished\"]").attr("content"));
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
