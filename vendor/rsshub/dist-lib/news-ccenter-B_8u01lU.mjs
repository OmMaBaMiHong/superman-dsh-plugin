import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/scut/seie/news-ccenter.ts
const route = {
	path: "/seie/news_center",
	categories: ["university"],
	example: "/scut/seie/news_center",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www2.scut.edu.cn/ee/16285/list.htm"] }],
	name: "电子与信息学院 - 新闻速递",
	maintainers: ["auto-bot-ty"],
	handler,
	url: "www2.scut.edu.cn/ee/16285/list.htm",
	description: `::: warning
由于学院官网对非大陆 IP 的访问存在限制，需自行部署。
:::`
};
async function handler() {
	const rootUrl = "https://www2.scut.edu.cn";
	const url = `${rootUrl}/ee/16285/list.htm`;
	const $ = load((await got_default(url)).data);
	const articleList = $(".news_ul li").toArray().map((item) => {
		item = $(item);
		const titleElement = item.find(".news_title a");
		return {
			title: titleElement.attr("title"),
			link: titleElement.attr("href"),
			pubDate: parseDate(item.find(".news_meta").text(), "YYYY-MM-DD")
		};
	});
	return {
		title: "华南理工大学电子与信息学院 - 新闻速递",
		link: url,
		item: await Promise.all(articleList.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load((await got_default(`${rootUrl}${item.link}`)).data);
			content(".wp_articlecontent *").each((_, child) => {
				const childElem = content(child);
				childElem.removeAttr("style");
				childElem.removeAttr("lang");
				childElem.removeAttr("original-src");
				childElem.removeAttr("sudyfile-attr");
				childElem.removeAttr("data-layer");
				if (!childElem.text().replace("\n", "").trim().length && !childElem.has("img") || childElem.attr("name") === "_GoBack" || childElem.is("style")) childElem.remove();
			});
			item.description = content(".wp_articlecontent").html().replaceAll(/^(<br>)+|(<br>)+$/g, "").trim();
			return item;
		})))
	};
}
//#endregion
export { route };
