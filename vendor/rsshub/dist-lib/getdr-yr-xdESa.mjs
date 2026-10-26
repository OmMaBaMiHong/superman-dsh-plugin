import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/getdr/index.ts
const route = {
	path: "/",
	radar: [{
		source: ["getdr.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["nczitzk"],
	handler,
	url: "getdr.com/"
};
async function handler() {
	const rootUrl = "https://getdr.com/最新詐騙情報";
	const list = (await got_default({
		method: "get",
		url: "https://public-api.wordpress.com/rest/v1.1/sites/demogetdr.wordpress.com/posts"
	})).data.posts.map((item) => ({
		link: item.URL,
		title: item.title,
		author: item.author.name,
		pubDate: parseDate(item.date)
	}));
	return {
		title: "最新詐騙情報 - 趨勢科技防詐達人",
		link: rootUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			content(".wp-block-image").each((_, el) => {
				content(el).html(`<img src="${content(el).find("img").attr("data-orig-file")}">`);
			});
			item.description = content("div[data-widget_type=\"theme-post-content.default\"]").html();
			return item;
		})))
	};
}
//#endregion
export { route };
