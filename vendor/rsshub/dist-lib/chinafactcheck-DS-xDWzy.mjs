import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/chinafactcheck/utils.ts
const siteLink = "https://chinafactcheck.com";
const cleanDom = (dom) => {
	dom("*[style]").removeAttr("style");
	dom("br").remove();
	dom("span:empty").remove();
	dom("span").each((_, el) => {
		if (dom(el).html().trim() === "&nbsp;") dom(el).remove();
	});
	dom("p:empty").remove();
	dom("p").each((_, el) => {
		if (dom(el).html().trim() === "") dom(el).remove();
	});
	return dom;
};
const getArticleDetail = async (link) => {
	const response = await got_default(link, { headers: { "user-agent": config.trueUA } });
	const $ = cleanDom(load(response.data));
	return new ArticleDetail($(".content-head h2").text().trim(), $(".content-persons p span:last").text().trim(), parseDate($(".content-time").text().trim(), "YYYY-MM-DD"), $("div[class=content-list-box]").html(), $(".content-tags a[rel=\"tag\"]").toArray().map((item) => $(item).text().trim()));
};
var ArticleDetail = class {
	constructor(title, author, pubDate, description, category) {
		this.title = title;
		this.author = author;
		this.pubDate = pubDate;
		this.description = description;
		this.category = category;
	}
};
var utils_default = {
	siteLink,
	cleanDom,
	getArticleDetail,
	ArticleDetail,
	trueUA: config.trueUA
};
//#endregion
//#region lib/routes/chinafactcheck/index.ts
const route = {
	path: "/",
	radar: [{
		source: ["chinafactcheck.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["kdanfly"],
	handler,
	url: "chinafactcheck.com/"
};
async function handler() {
	const $ = load((await got_default(utils_default.siteLink, { headers: { "user-agent": utils_default.trueUA } })).data);
	const articlesLink = $(".post-info-box .post-thumb a").toArray().map((item) => ({ link: $(item).attr("href") }));
	const articles = await Promise.all(articlesLink.map((item) => cache_default.tryGet(item.link, async () => {
		const { title, author, pubDate, description, category } = await utils_default.getArticleDetail(item.link);
		item.title = title;
		item.author = author;
		item.pubDate = pubDate;
		item.description = description;
		item.category = category;
		return item;
	})));
	return {
		title: $("head title").text(),
		link: utils_default.siteLink,
		item: articles
	};
}
//#endregion
export { route };
