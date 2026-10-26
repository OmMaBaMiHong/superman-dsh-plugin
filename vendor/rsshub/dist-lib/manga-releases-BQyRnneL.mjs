import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/nautiljon/manga-releases.ts
const host = "https://www.nautiljon.com";
const route = {
	path: "/releases/manga",
	categories: ["reading"],
	example: "/nautiljon/releases/manga",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["nautiljon.com/"] }],
	name: "France manga releases",
	maintainers: ["Fafnor"],
	handler,
	url: "nautiljon.com"
};
const isVolumeReleased = (releaseDate) => {
	const releaseDateToCheck = parseDate(releaseDate, "DD/MM/YYYY");
	const todayDate = /* @__PURE__ */ new Date();
	todayDate.setHours(0, 0, 0, 0);
	return releaseDateToCheck <= todayDate;
};
async function handler() {
	const $ = load(await rofetch(`${host}/planning/manga/`, { headers: { "User-Agent": config.trueUA } }));
	const items = $("table#planning tbody tr").toArray().filter((item) => isVolumeReleased($(item).find("td").first().text())).map((item) => {
		item = $(item);
		const releaseDate = item.find("td").first().text();
		const a = item.find("td.p_titre").find("a.sim").first();
		const img = item.find("td:nth-child(2) a").first();
		return {
			title: a.text(),
			link: `${host}${a.attr("href")}`,
			pubDate: parseDate(releaseDate, "DD/MM/YYYY"),
			image: `${host}${img.attr("im")}`,
			category: item.find("td.p_titre div.fl").first().text()
		};
	});
	return {
		title: "Nautiljon France Manga Releases",
		link: `${host}/planning/manga/`,
		item: items
	};
}
//#endregion
export { route };
