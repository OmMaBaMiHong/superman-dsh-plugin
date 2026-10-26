import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/mashiro/namespace.ts
const namespace = {
	name: `Mashiro's Baumkuchen`,
	url: "mashiro.best",
	description: `Muen's blog posts`,
	zh: { name: "真白的年轮面包" }
};
//#endregion
//#region lib/routes/mashiro/index.ts
const baseUrl = `https://${namespace.url}`;
const route = {
	path: "/:lang",
	categories: ["blog"],
	example: "/mashiro/en",
	parameters: { lang: "the language of the site. Can be either `en` or `zh-cn`. Default: `en`" },
	radar: [{ source: ["mashiro.best/", "mashiro.best/:lang/"] }],
	name: "Blog",
	maintainers: ["MuenYu"],
	handler: async (ctx) => {
		const { lang = "en" } = ctx.req.param();
		const targetLink = lang === "en" ? `${baseUrl}/archives/` : `${baseUrl}/${lang}/archives/`;
		const $ = load(await rofetch(targetLink));
		const links = $(".archives-group article").toArray().slice(0, 10).map((item) => {
			item = $(item);
			const a = item.find("a").first();
			return {
				title: a.find(".article-title").text(),
				link: `${baseUrl}${a.attr("href")}`,
				pubDate: parseDate(a.find("time").attr("datetime"))
			};
		});
		const items = await Promise.all(links.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = load(await rofetch(item.link))(".article-content").first().html();
			return item;
		})));
		return {
			title: namespace.name,
			link: targetLink,
			item: items
		};
	}
};
//#endregion
export { route };
