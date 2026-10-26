import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/uber/blog.ts
const rootURL = "https://www.uber.com";
const route = {
	path: "/blog/:compat?",
	categories: ["blog"],
	example: "/uber/blog",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.uber.com/:language/blog/engineering"],
		target: "/blog"
	}],
	name: "Engineering",
	maintainers: ["hulb"],
	handler,
	url: "www.uber.com/en-HK/blog/engineering",
	description: `The English blog on any of Uber's regional sites (e.g., [www.uber.com/en-JP/blog](http://www.uber.com/en-JP/blog)) is the same engineering blog provided by this route, so language selection is not supported. This route is not for the public news blog on specific regional sites (e.g., [www.uber.com/ja-JP/blog](http://www.uber.com/ja-JP/blog)).`,
	zh: { description: "uber 的任何区域站点的英文 blog（例如 [www.uber.com/en-JP/blog](http://www.uber.com/en-JP/blog)）都是相同的内容，正是本路由提供的 engineering blog，因此本路由不提供语言选择；本路由不是 uber 在特定区域站点的公开新闻 blog（例如 [www.uber.com/ja-JP/blog](http://www.uber.com/ja-JP/blog)）" }
};
async function handler() {
	const $ = load(await rofetch(`${rootURL}/en-HK/blog/engineering/rss/`, {
		headers: { accept: "text/html" },
		parseResponse: (txt) => txt
	}), { xmlMode: true });
	return {
		title: "Uber Engineering Blog",
		link: "https://www.uber.com/blog/engineering",
		description: "The technology behind Uber Engineering",
		item: await Promise.all($("item").toArray().map((el) => cache_default.tryGet($(el).find("link").text(), async () => {
			const scriptText = load(await rofetch($(el).find("link").text(), { headers: { accept: "text/html" } }))("script#__REDUX_STATE__").text().trim();
			const jsonText = decodeURIComponent(JSON.parse(`"${scriptText}"`));
			const contentHtml = findNode(JSON.parse(jsonText), {
				idKey: "id",
				idValue: "BlogArticleContent",
				siblingKey: "props",
				childKey: "content"
			}).replaceAll(String.raw`\n`, "");
			return {
				link: $(el).find("link").text(),
				title: $(el).find("title").text(),
				description: contentHtml,
				pubDate: parseDate($(el).find("pubDate").text()),
				category: $(el).find("category").toArray().map((item) => $(item).text())
			};
		})))
	};
}
function findNode(json, options) {
	const { idKey = "id", idValue, siblingKey, childKey } = options;
	if (Array.isArray(json)) for (const item of json) {
		const result = findNode(item, options);
		if (result !== void 0) return result;
	}
	else if (json && typeof json === "object") {
		if (json[idKey] === idValue) return json[siblingKey]?.[childKey];
		for (const key in json) {
			const result = findNode(json[key], options);
			if (result !== void 0) return result;
		}
	}
}
//#endregion
export { route };
