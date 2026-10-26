import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/shisu/en.ts
const url = "http://en.shisu.edu.cn";
const urlBackup = "https://en.shisu.edu.cn";
const route = {
	path: "/en/:section",
	categories: ["university"],
	example: "/shisu/en/news",
	parameters: { section: "The name of resources" },
	radar: [{
		source: ["en.shisu.edu.cn/resources/:section/"],
		target: "/en/:section"
	}],
	name: "SISU TODAY | FEATURED STORIES",
	maintainers: ["Duuckjing"],
	handler,
	description: `- features: Read a series of in-depth stories about SISU faculty, students, alumni and beyond campus.
  - news: SISU TODAY English site.`
};
async function process(baseUrl, section) {
	const $ = load(await rofetch(`${baseUrl}/resources/${section}/`));
	const itemsoup = $(".tab-con:nth-child(1) ul li").toArray().map((i0) => {
		const i = $(i0);
		const img = i.find("img").attr("src");
		const link = `${baseUrl}${i.find("h3>a").attr("href")}`;
		return {
			title: i.find("h3>a").text().trim(),
			link,
			pubDate: parseDate(i.find("p.time").text()),
			itunes_item_image: `${baseUrl}${img}`
		};
	});
	const items = await Promise.all(itemsoup.map((j) => cache_default.tryGet(j.link, async () => {
		j.description = load(await rofetch(j.link))(".details-con").html().replaceAll(/<o:p>[\s\S]*?<\/o:p>/g, "").replaceAll(/(<p[^>]*>&nbsp;<\/p>\s*)+/g, "<p>&nbsp;</p>");
		return j;
	})));
	return {
		title: String(section) === "features" ? "FEATURED STORIES" : "SISU TODAY",
		link: `${url}/resources/${section}/`,
		item: items
	};
}
async function handler(ctx) {
	const { section } = ctx.req.param();
	let res;
	try {
		await rofetch(url);
		res = process(url, section);
	} catch {
		await rofetch(urlBackup);
		res = process(urlBackup, section);
	}
	return res;
}
//#endregion
export { route };
