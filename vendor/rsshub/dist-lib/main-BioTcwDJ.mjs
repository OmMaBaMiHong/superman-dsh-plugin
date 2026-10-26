import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderDescription } from "./description-Cg5sBZFH.mjs";
import { load } from "cheerio";
//#region lib/routes/futunn/main.ts
const route = {
	path: ["/main", "/"],
	categories: ["finance"],
	example: "/futunn/main",
	features: { supportRadar: true },
	radar: [{
		source: ["news.futunn.com/main", "news.futunn.com/:lang/main"],
		target: "/main"
	}],
	name: "要闻",
	maintainers: [
		"Wsine",
		"nczitzk",
		"kennyfong19931"
	],
	handler
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 48;
	const rootUrl = "https://news.futunn.com";
	const currentUrl = `${rootUrl}/main`;
	let items = (await got_default({
		method: "get",
		url: `${rootUrl}/news-site-api/main/get-market-list?size=${limit}`
	})).data.data.list.map((item) => ({
		title: item.title,
		link: item.url.split("?", 1)[0],
		author: item.source,
		pubDate: parseDate(item.timestamp * 1e3),
		description: renderDescription({
			abs: item.abstract,
			pic: item.pic
		})
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		if (/news\.futunn\.com/.test(item.link)) {
			const content = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			content(".futu-news-time-stamp").remove();
			content(".nnstock").each((_, el) => {
				content(el).replaceWith(`<a href="${content(el).attr("href")}">${content(el).text().replaceAll("$", "")}</a>`);
			});
			item.description = content(".origin_content").html();
			item.category = [...content(".news__from-topic__title").toArray().map((a) => content(a).text().trim()), ...content("#relatedStockWeb .stock-name").toArray().map((s) => content(s).text().trim())];
		}
		return item;
	})));
	return {
		title: "富途牛牛 - 要闻",
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
