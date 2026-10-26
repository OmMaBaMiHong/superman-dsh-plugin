import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/langchain/index.ts
const route = {
	path: "/blog",
	categories: ["blog"],
	example: "/langchain/blog",
	radar: [{ source: ["blog.langchain.dev/"] }],
	url: "blog.langchain.dev/",
	name: "Blog",
	maintainers: ["liyaozhong"],
	handler,
	description: "LangChain Blog Posts"
};
async function handler() {
	const rootUrl = "https://blog.langchain.dev";
	const $ = load((await got_default(rootUrl)).data);
	return {
		title: "LangChain Blog",
		link: rootUrl,
		item: (await Promise.all($(".posts-feed .post-card").toArray().map((item) => {
			const $item = $(item);
			const href = $item.find(".post-card__content-link").first().attr("href");
			const title = $item.find(".post-card__title").text().trim();
			const excerpt = $item.find(".post-card__excerpt").text().trim();
			if (!href || !title) return null;
			return {
				title,
				description: excerpt,
				link: new URL(href, rootUrl).href
			};
		}).filter((item) => item !== null).map((item) => cache_default.tryGet(item.link, async () => {
			try {
				item.description = load((await got_default(item.link)).data)(".article-content").html() || item.description;
				return item;
			} catch {
				return item;
			}
		})))).filter((item) => item !== null)
	};
}
//#endregion
export { route };
