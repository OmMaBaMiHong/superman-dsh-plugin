import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/inceptionlabs/blog.ts
const ROOT_URL = "https://www.inceptionlabs.ai";
const route = {
	path: "/blog",
	categories: ["programming"],
	example: "/inceptionlabs/blog",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.inceptionlabs.ai/blog"] }],
	name: "Blog",
	maintainers: ["zdenek-stursa"],
	handler,
	url: "inceptionlabs.ai/blog"
};
async function handler() {
	const $ = load(await rofetch(`${ROOT_URL}/blog`));
	const posts = $("a[href^=\"./blog/\"][data-framer-name=\"Desktop\"]").toArray().map((el) => {
		const $el = $(el);
		const href = $el.attr("href") ?? "";
		if (href.includes("categories") || href.includes("#")) return null;
		const title = $el.find("h6.framer-text").toArray().map((h6) => $(h6).text().trim()).find((text) => text && text !== "Read story");
		if (!title) return null;
		const slug = href.replace("./blog/", "");
		const link = `${ROOT_URL}/blog/${slug}`;
		const dateBlocks = $el.find("[data-framer-name=\"Date\"] p.framer-text").toArray().map((p) => $(p).text().trim());
		const categoryEl = $el.find("[data-framer-name=\"Category\"]");
		const category = categoryEl.length > 0 ? categoryEl.first().text().trim() : dateBlocks[0] ?? "";
		const pubDate = dateBlocks.length >= 2 ? dateBlocks[1] : dateBlocks[0] ?? "";
		return {
			title,
			link,
			category: category ? [category] : [],
			pubDate
		};
	}).filter((post) => post !== null);
	const items = await Promise.all(posts.map((post) => cache_default.tryGet(post.link, async () => {
		const $post = load(await rofetch(post.link));
		const contentHtml = $post("[data-framer-name=\"Content\"]").first().html() ?? "";
		const author = $post("[data-framer-name=\"Author\"] p.framer-text").first().text().trim();
		return {
			...post,
			description: contentHtml,
			author,
			pubDate: parseDate(post.pubDate)
		};
	})));
	return {
		title: "Inception Labs Blog",
		link: `${ROOT_URL}/blog`,
		description: "Latest posts from the Inception Labs blog about diffusion LLMs and AI research",
		item: items
	};
}
//#endregion
export { route };
