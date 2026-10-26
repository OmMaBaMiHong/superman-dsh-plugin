import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ndss-symposium/ndss.ts
const url = "https://www.ndss-symposium.org";
const route = {
	path: "/ndss",
	categories: ["journal"],
	example: "/ndss-symposium/ndss",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["ndss-symposium.org/"] }],
	name: "Accepted papers",
	maintainers: ["ZeddYu"],
	handler,
	url: "ndss-symposium.org/",
	description: "Return results from 2020"
};
async function handler() {
	const { data } = await got_default(`${url}/wp-json/wp/v2/pages?slug=accepted-papers`);
	const items = await Promise.all(data.map(async (elem) => {
		const $ = load(elem.content.rendered);
		const link = elem.link;
		const pubDate = parseDate(elem.date);
		const divMatch = $("div h3").toArray().map((item) => {
			item = $(item);
			return {
				title: item.text().trim(),
				author: item.siblings().text().trim().replaceAll("\n", "").replaceAll(/\s+/g, " "),
				link: item.siblings("a").attr("href"),
				pubDate
			};
		});
		if (divMatch.length > 0) return await Promise.all(divMatch.map((item) => {
			if (item.link) return cache_default.tryGet(item.link, async () => {
				const $ = load((await got_default(item.link)).body);
				item.description = $(".paper-data").text().trim().replaceAll("\n", "");
				item.title = $("h1.entry-title").text().trim().replaceAll("\n", "").replaceAll(/\s+/g, " ");
				item.author = $("h1.entry-title").siblings().text().trim().replaceAll("\n", "").replaceAll(/\s+/g, " ");
				return item;
			});
			item.link = `${link}#${item.title}`;
			return item;
		}));
		return $("p strong").toArray().map((item) => {
			item = $(item);
			const title = item.text().trim();
			return {
				title,
				author: item.parent().contents().filter((_, e) => e.nodeType === 3).text().trim().replaceAll("\n", "").replaceAll(/\s+/g, " "),
				link: `${link}#${title}`,
				pubDate
			};
		});
	}));
	return {
		title: "NDSS",
		link: url,
		description: "The Network and Distributed System Security (NDSS) Symposium Accpeted Papers",
		allowEmpty: true,
		item: items.flat()
	};
}
//#endregion
export { route };
