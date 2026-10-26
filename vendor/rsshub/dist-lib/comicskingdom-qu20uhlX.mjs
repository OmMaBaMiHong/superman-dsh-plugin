import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/comicskingdom/index.tsx
const route = {
	path: "/:name",
	categories: ["anime"],
	example: "/comicskingdom/pardon-my-planet",
	parameters: { name: "URL path of the strip on comicskingdom.com" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["comicskingdom.com/:name/*", "comicskingdom.com/:name"] }],
	name: "Archive",
	maintainers: ["stjohnjohnson"],
	handler
};
async function handler(ctx) {
	const baseURL = "https://comicskingdom.com";
	const name = ctx.req.param("name");
	const url = `${baseURL}/${name}/archive`;
	const { data } = await got_default(url);
	const $ = load(data);
	const comic = $("title").text().replace("Comics Kingdom - ", "").trim();
	const author = $(".feature-title h2").text();
	const links = $("div.tile").toArray().map((el) => $(el).find("a").first().attr("href"));
	if (links.length === 0) throw new InvalidParameterError(`Comic Not Found - ${name}`);
	const items = await Promise.all(links.map((link) => cache_default.tryGet(link, async () => {
		const content = load((await got_default(link)).data);
		const title = content("meta[property=\"og:description\"]").attr("content");
		const description = renderToString(/* @__PURE__ */ jsx("img", { src: content("meta[property=\"og:image\"]").attr("content") }));
		const pubDate = parseDate(link.slice(link.lastIndexOf("/") + 1), "YYYY-MM-DD");
		return {
			title,
			author,
			category: "comic",
			description,
			pubDate,
			link
		};
	})));
	return {
		title: comic,
		link: url,
		image: $(".feature-logo").attr("src"),
		item: items,
		language: "en-US"
	};
}
//#endregion
export { route };
