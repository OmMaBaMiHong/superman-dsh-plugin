import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/osu/beatmaps/packs.ts
const route = {
	path: "/packs/:type?",
	categories: ["game"],
	example: "/osu/packs",
	parameters: { type: "pack type, default to `standard`, can choose from `featured`, `tournament`, `loved`, `chart`, `theme` and `artist`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Beatmap Packs",
	maintainers: ["JimenezLi"],
	handler
};
async function handler(ctx) {
	const { type = "standard" } = ctx.req.param();
	const link = `https://osu.ppy.sh/beatmaps/packs?type=${type}`;
	const $ = load((await got_default.get(link)).data);
	const itemList = $(".beatmap-pack");
	return {
		title: `osu! Beatmap Pack - ${type}`,
		link,
		item: itemList.toArray().map((element) => {
			const item = $(element);
			return {
				title: item.find(".beatmap-pack__name").text().trim(),
				link: item.find(".beatmap-pack__header").attr("href"),
				description: item.find(".beatmap-pack__body").html(),
				pubDate: parseDate(item.find(".beatmap-pack__date").text(), "YYYY-MM-DD"),
				author: item.find(".beatmap-pack__author--bold").text().trim()
			};
		})
	};
}
//#endregion
export { route };
