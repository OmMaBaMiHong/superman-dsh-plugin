import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
import pMap from "p-map";
//#region lib/routes/anthropic/research.ts
const route = {
	path: "/research",
	categories: ["programming"],
	example: "/anthropic/research",
	parameters: {},
	radar: [{ source: ["www.anthropic.com/research", "www.anthropic.com"] }],
	name: "Research",
	maintainers: ["ttttmr"],
	handler,
	url: "www.anthropic.com/research"
};
async function handler() {
	const link = "https://www.anthropic.com/research";
	const $ = load(await rofetch(link));
	const regexp = /self\.__next_f\.push\((.+)\)/;
	const textList = [];
	for (const e of $("script").toArray()) {
		const text = $(e).text();
		const match = regexp.exec(text);
		if (match) try {
			const data = JSON.parse(match[1]);
			if (Array.isArray(data) && data.length === 2 && data[0] === 1) textList.push(data[1]);
		} catch {}
	}
	const partRegex = /^([0-9a-z]+):([0-9a-z]+)?(\[.*)$/i;
	return {
		title: "Anthropic Research",
		link,
		description: "Latest research from Anthropic",
		item: await pMap(textList.join("").split("\n").map((d) => {
			const matchPart = partRegex.exec(d);
			if (matchPart) return {
				id: matchPart[1],
				tag: matchPart[2],
				data: JSON.parse(matchPart[3])
			};
			return {
				id: "",
				tag: "",
				data: d
			};
		}).flatMap((d) => Array.isArray(d.data) ? d.data : []).flatMap((item) => item?.page?.sections ?? []).filter((section) => section?.title === "Publications").flatMap((section) => section?.posts ?? []).map((post) => ({
			title: post.title,
			link: `https://www.anthropic.com/research/${post.slug.current}`,
			pubDate: parseDate(post.publishedOn)
		})), (item) => cache_default.tryGet(item.link, async () => {
			const $ = load(await rofetch(item.link));
			const content = $("#main-content > article");
			content.find("[class$=\"__header\"], [class$=\"__sidebar-container\"], [class$=\"__controls\"], [class$=\"__socialShare\"], [class^=\"LandingPageSection-module-scss-module__\"], [class^=\"SubjectNewsletter-module-scss-module__\"]").remove();
			content.find("img").each((_, e) => {
				const $e = $(e);
				$e.removeAttr("style srcset");
				const src = $e.attr("src");
				const newSrc = new URLSearchParams(src).get("/_next/image?url");
				if (newSrc) $e.attr("src", newSrc);
			});
			item.description = content.html();
			return item;
		}), { concurrency: 5 })
	};
}
//#endregion
export { route };
