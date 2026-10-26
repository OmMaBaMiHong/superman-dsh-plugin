import { t as config } from "./config-B5Cf_tHS.mjs";
import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
import pMap from "p-map";
//#region lib/routes/guozaoke/index.ts
const route = {
	path: "/default",
	categories: ["bbs"],
	example: "/guozaoke/default",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "过早客",
	maintainers: ["xiaoshame"],
	handler,
	url: "guozaoke.com/"
};
async function handler() {
	const url = "https://www.guozaoke.com/";
	const $ = load((await got_default({
		method: "get",
		url,
		headers: {
			Cookie: config.guozaoke.cookies,
			"User-Agent": config.ua
		}
	})).data);
	return {
		title: "过早客",
		link: url,
		item: await pMap($("div.topic-item").toArray().slice(0, 20).map((item) => {
			const $item = $(item);
			const title = $item.find("h3.title a").text();
			const url = $item.find("h3.title a").attr("href");
			const author = $item.find("span.username a").text();
			const pubDate = parseRelativeDate($item.find("span.last-touched").text());
			const link = url ? url.split("#", 1)[0] : void 0;
			return link ? {
				title,
				link,
				author,
				pubDate
			} : void 0;
		}).filter((item) => item !== void 0), (item) => cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default({
				method: "get",
				url: `https://www.guozaoke.com${item.link}`,
				headers: { Cookie: config.guozaoke.cookies }
			})).data);
			let content = $("div.ui-content").html();
			content = content ? content.trim() : "";
			const comments = $(".reply-item").map((i, el) => {
				const $el = $(el);
				return {
					comment: $el.find("span.content").text().trim(),
					author: $el.find("span.username").text()
				};
			});
			if (comments && comments.length > 0) for (const item of comments) content += "<br>" + item.author + ": " + item.comment;
			item.description = content;
			return item;
		}), { concurrency: 2 })
	};
}
//#endregion
export { route };
