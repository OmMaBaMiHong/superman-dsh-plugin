import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/lephoceen/chrono.ts
const route = {
	path: "/chrono",
	categories: ["sport"],
	example: "/lephoceen/chrono",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["lephoceen.fr/chrono"],
		target: "/chrono"
	}],
	name: "Fil Info Le Phocéen (Chrono)",
	maintainers: ["Loopy03"],
	handler: async (_) => {
		const jsonRaw = load(await rofetch("https://www.lephoceen.fr/chrono"))("script[id=\"__NEXT_DATA__\"]").html();
		return {
			title: "Le Phocéen - Fil Info",
			link: "https://www.lephoceen.fr/chrono",
			item: (JSON.parse(jsonRaw)?.props?.pageProps?.data?.datas || []).map((item) => {
				const link = item.slug.startsWith("http") ? item.slug : `https://www.lephoceen.fr${item.slug}`;
				const pubDate = parseDate(item.date.publish_at.timestamp * 1e3);
				return {
					title: item.title,
					link,
					description: item.text || `[${item.category?.name}] ${item.title}`,
					pubDate,
					category: [item.category?.name],
					image: item.images?.["16x9"]?.url
				};
			})
		};
	}
};
//#endregion
export { route };
