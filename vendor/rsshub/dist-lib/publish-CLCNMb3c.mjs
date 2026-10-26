import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { n as getTitle } from "./utils-CN6pWN_8.mjs";
import { load } from "cheerio";
//#region lib/routes/obsidian/publish.ts
const route = {
	path: "/publish/:id",
	categories: ["blog"],
	example: "/obsidian/publish/marshallontheroad",
	parameters: { id: "网站 id，由Publish持有者自定义" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["publish.obsidian.md/"] }],
	name: "Publish",
	maintainers: ["Xy2002"],
	handler,
	url: "publish.obsidian.md/"
};
async function handler(ctx) {
	return {
		title: "Obsidian Publish",
		language: "en-us",
		item: await fetchPage(ctx.req.param("id")),
		link: "https://publish.obsidian.md/"
	};
}
async function fetchPage(id) {
	const baseUrl = `https://publish.obsidian.md/${id}`;
	const preloadCacheUrl = load(await rofetch(baseUrl))("script:contains(\"preloadCache\")").text().match(/preloadCache\s*=\s*f\("([^"]+)"\);/)?.[1] || "";
	let preloadCacheResponse;
	try {
		preloadCacheResponse = await rofetch(preloadCacheUrl, { headers: {
			"User-Agent": config.trueUA,
			Referer: "https://publish.obsidian.md/",
			Origin: "https://publish.obsidian.m/"
		} });
	} catch {
		preloadCacheResponse = {};
	}
	return Object.entries(preloadCacheResponse).map(([postKey, post]) => {
		if (!post) return null;
		return {
			title: post.frontmatter?.title || getTitle(postKey),
			link: `${baseUrl}/${postKey.replaceAll(" ", "+").split(".md", 1)[0]}`,
			pubDate: post.frontmatter?.["date created"] ? parseDate(post.frontmatter["date created"]) : void 0,
			...post.frontmatter
		};
	}).filter(Boolean);
}
//#endregion
export { route };
