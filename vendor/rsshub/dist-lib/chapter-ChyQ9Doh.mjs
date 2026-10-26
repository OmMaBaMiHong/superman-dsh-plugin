import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/hameln/chapter.ts
const route = {
	path: "/chapter/:id",
	categories: ["reading"],
	example: "/hameln/chapter/264928",
	parameters: { id: "Novel id, can be found in URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["syosetu.org/novel/:id"] }],
	name: "chapter",
	maintainers: ["huangliangshusheng"],
	handler,
	description: "Eg: <https://syosetu.org/novel/264928>"
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const limit = Number.parseInt(ctx.req.query("limit")) || 5;
	const link = `https://syosetu.org/novel/${id}`;
	const $ = load(await get(link));
	const title = $("span[itemprop=\"name\"]").text();
	const description = $("div.ss:nth-child(2)").text();
	const chapter_list = $("tr[bgcolor]").toArray().map((chapter) => {
		const $_chapter = $(chapter);
		const chapter_link = $_chapter.find("a");
		return {
			title: chapter_link.text(),
			link: chapter_link.attr("href"),
			pubDate: timezone(parseDate($_chapter.find("nobr").text(), "YYYYMMDD HH:mm"), 9)
		};
	}).toSorted((a, b) => b.pubDate - a.pubDate).slice(0, limit);
	return {
		title,
		description,
		link,
		language: "ja",
		item: await Promise.all(chapter_list.map((chapter) => {
			chapter.link = `${link}/${chapter.link}`;
			return cache_default.tryGet(chapter.link, async () => {
				chapter.description = load(await get(chapter.link))("#honbun").html();
				return chapter;
			});
		}))
	};
}
const get = async (url) => {
	return (await got_default({
		method: "get",
		url,
		headers: { cookie: "over18=off" }
	})).data;
};
//#endregion
export { route };
