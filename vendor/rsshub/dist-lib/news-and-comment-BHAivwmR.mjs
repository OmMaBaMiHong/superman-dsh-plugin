import { t as got_default } from "./got-Dnzt41dd.mjs";
import { i as getArticleList, n as cookieJar, r as getArticle, t as baseUrl } from "./utils-8wIE3g81.mjs";
import { load } from "cheerio";
//#region lib/routes/nature/news-and-comment.ts
const route = {
	path: "/news-and-comment/:journal?",
	radar: [{
		source: [
			"nature.com/latest-news",
			"nature.com/news",
			"nature.com/"
		],
		target: "/news"
	}],
	name: "Unknown",
	maintainers: ["y9c", "TonyRL"],
	handler,
	url: "nature.com/latest-news"
};
async function handler(ctx) {
	const pageURL = `${baseUrl}/${ctx.req.param("journal")}/news-and-comment`;
	const pageCapture = load((await got_default(pageURL, { cookieJar })).data);
	const pageDescription = pageCapture("meta[name=description]").attr("content") || "Nature, a nature research journal";
	let items = getArticleList(pageCapture);
	items = await Promise.all(items.map((item) => getArticle(item)));
	return {
		title: pageCapture("title").text(),
		description: pageDescription,
		link: pageURL,
		item: items
	};
}
//#endregion
export { route };
