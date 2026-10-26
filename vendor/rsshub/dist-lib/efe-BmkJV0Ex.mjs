import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
import pMap from "p-map";
//#region lib/routes/efe/index.ts
const rootUrl = "https://efe.com";
const categories = {
	mundo: "Mundo",
	espana: "España",
	economia: "Economía",
	cultura: "Cultura",
	"ciencia-y-tecnologia": "Ciencia y Tecnología",
	deportes: "Deportes",
	salud: "Salud",
	"medio-ambiente": "Medio Ambiente",
	educacion: "Educación",
	"euro-efe": "EuroEFE"
};
const route = {
	path: "/:category?",
	name: "Category",
	maintainers: ["mlkgrnt"],
	example: "/efe/mundo",
	parameters: { category: {
		description: "Category slug, see table below. Defaults to mundo.",
		default: "mundo"
	} },
	handler,
	categories: ["new-media"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["efe.com/:category"],
		target: "/:category"
	}]
};
async function handler(ctx) {
	const category = ctx.req.param("category") || "mundo";
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20;
	const pageUrl = `${rootUrl}/${category}/`;
	const $ = load(await rofetch(pageUrl));
	const items = await pMap($(".e-loop-item .elementor-widget-theme-post-title a[href]").toArray().map((el) => $(el).attr("href")).filter((href) => !!href && href.startsWith(`${rootUrl}/${category}/`) && /\/\d{4}-\d{2}-\d{2}\//.test(href)).slice(0, limit), (link) => cache_default.tryGet(link, async () => {
		const detail = await rofetch(link);
		const $detail = load(detail);
		const title = $detail("title").text();
		const dateMatch = detail.match(/"datePublished":\s*"([^"]+)"/);
		const pubDate = dateMatch ? parseDate(dateMatch[1]) : void 0;
		const image = $detail("meta[property=\"og:image\"]").attr("content");
		const content = $detail(".elementor-widget-theme-post-content");
		content.find(".auto-banner").remove();
		return {
			title,
			link,
			pubDate,
			description: (image ? `<figure><img src="${image}"></figure>` : "") + (content.html() || "")
		};
	}), { concurrency: 2 });
	return {
		title: `EFE Noticias - ${categories[category] || category}`,
		link: pageUrl,
		item: items
	};
}
//#endregion
export { route };
