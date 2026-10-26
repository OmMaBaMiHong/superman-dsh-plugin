import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/dlsite/ci-en/article.ts
const route = {
	path: "/ci-en/:id/article",
	categories: ["anime"],
	view: 0,
	example: "/dlsite/ci-en/7400/article",
	parameters: { id: "Creator id, can be found in URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["ci-en.dlsite.com/creator/:id/article/843558", "ci-en.dlsite.com/"] }],
	name: "Ci-en Creators' Article",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "7400";
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 10;
	const currentUrl = `https://ci-en.dlsite.com/creator/${id}/article?mode=list`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".c-postedArticle-info a").slice(0, limit).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content(".article-title").remove();
		content(".file-player-image").each((_, el) => {
			content(el).replaceWith(`<img src="${content(el).attr("data-actual")}">`);
		});
		item.description = content("article").html();
		item.pubDate = timezone(parseDate(content(".e-date").first().text()), 9);
		item.category = content(".c-hashTagList-item").toArray().map((t) => content(t).text().split("#").pop().trim());
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
