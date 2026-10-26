import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/dlsite/new.ts
const host = "https://www.dlsite.com";
const infos = {
	home: {
		type: "home",
		name: "「DLsite 同人」",
		url: "/home/new"
	},
	comic: {
		type: "comic",
		name: "「DLsite コミック」",
		url: "/comic/new"
	},
	soft: {
		type: "soft",
		name: "「DLsite PCソフト」",
		url: "/soft/new"
	},
	maniax: {
		type: "maniax",
		name: "「DLsite 同人 - R18」",
		url: "/maniax/new"
	},
	books: {
		type: "books",
		name: "「DLsite 成年コミック - R18」",
		url: "/books/new"
	},
	pro: {
		type: "pro",
		name: "「DLsite 美少女ゲーム」",
		url: "/pro/new"
	},
	girls: {
		type: "girls",
		name: "「DLsite 乙女」",
		url: "/girls/new"
	},
	bl: {
		type: "bl",
		name: "「DLsite BL」",
		url: "/bl/new"
	}
};
const route = {
	path: "/new/:type",
	categories: ["anime"],
	view: 0,
	example: "/dlsite/new/home",
	parameters: { type: {
		description: "类型",
		options: Object.values(infos).map((info) => ({
			value: info.type,
			label: info.name
		}))
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "Current Release",
	maintainers: ["cssxsh"],
	handler,
	description: `| Doujin | Comics | PC Games | Doujin (R18) | Adult Comics | H Games | Otome | BL |
| ------ | ------ | -------- | ------------ | ------------ | ------- | ----- | -- |
| home   | comic  | soft     | maniax       | books        | pro     | girls | bl |`
};
async function handler(ctx) {
	const info = infos[ctx.req.param("type")];
	if (info === void 0) throw new InvalidParameterError("不支持指定类型！");
	const link = info.url.slice(1);
	const data = (await got_default(new URL(link, host), { method: "GET" })).data;
	const $ = load(data);
	const title = $("title").text();
	const description = $("meta[name=\"description\"]").attr("content");
	const list = $(".n_worklist_item");
	const pubDate = parseDate($(".work_update").text().trim().replaceAll(/（.*）/g, ""), "YYYY年M月D日");
	return {
		title,
		link,
		description,
		language: "ja-jp",
		item: list.toArray().map((element) => {
			const title = $(".work_name", element).text();
			const link = $(".work_name > a", element).attr("href");
			$("a", element).each((_index, element) => {
				$(element).attr("target", "_blank");
			});
			const description = $(element).html();
			const arr = $(".search_tag", element);
			return {
				title,
				link,
				description,
				category: $("a", arr).toArray().map((a) => $(a).text()),
				author: $(".maker_name", element).text(),
				pubDate
			};
		})
	};
}
//#endregion
export { route };
