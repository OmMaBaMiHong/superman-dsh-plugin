import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { load } from "cheerio";
//#region lib/routes/eagle/blog.ts
const cateList = /* @__PURE__ */ new Set([
	"all",
	"design-resources",
	"learn-design",
	"inside-eagle"
]);
const route = {
	path: "/blog/:cate?/:language?",
	categories: ["blog"],
	example: "/eagle/blog/en",
	parameters: {
		cate: "Category, get by URL, `all` by default",
		language: {
			description: "Language",
			options: [
				{
					value: "cn",
					label: "cn"
				},
				{
					value: "tw",
					label: "tw"
				},
				{
					value: "en",
					label: "en"
				}
			],
			default: "en"
		}
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["cn.eagle.cool/blog"],
		target: "/blog"
	}],
	name: "Blog",
	maintainers: ["Fatpandac"],
	handler,
	url: "cn.eagle.cool/blog"
};
async function handler(ctx) {
	let cate = ctx.req.param("cate") ?? "all";
	let language = ctx.req.param("language") ?? "cn";
	if (!isValidHost(cate) || !isValidHost(language)) throw new InvalidParameterError("Invalid host");
	if (!cateList.has(cate)) {
		language = cate;
		cate = "all";
	}
	const host = `https://${language}.eagle.cool`;
	const url = `${host}/blog/${cate === "all" ? "" : cate}`;
	const $ = load((await got_default(url)).data);
	const title = $("div.categories-list > div > div > div > ul > li.active").text();
	const list = $("div.post-item").toArray().map((item) => ({
		title: $(item).find("div.title").text(),
		link: new URL($(item).find("a").attr("href"), host).href,
		pubDate: parseDate($(item).find("div.metas > a > span").text().replace("・", ""))
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default(item.link)).data)("div.post-html").html();
		return item;
	})));
	return {
		title: `eagle - ${title}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
