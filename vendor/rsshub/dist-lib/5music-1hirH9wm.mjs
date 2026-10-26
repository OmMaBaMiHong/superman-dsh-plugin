import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/5music/index.ts
const route = {
	path: "/new-releases/:category?",
	categories: ["shopping"],
	example: "/5music/new-releases",
	parameters: { category: "Category, see below, defaults to all" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.5music.com.tw/New_releases.asp", "www.5music.com.tw/"],
		target: "/new-releases"
	}],
	name: "新貨上架",
	maintainers: ["gideonsenku"],
	handler,
	description: `Categories:

| 華語 | 西洋 | 東洋 | 韓語 | 古典 |
| ---- | ---- | ---- | ---- | ---- |
| A    | B    | F    | M    | D    |`,
	url: "www.5music.com.tw/New_releases.asp"
};
async function handler(ctx) {
	const url = `https://www.5music.com.tw/New_releases.asp?mut=${ctx.req.param("category") ?? "A"}`;
	const { data } = await got_default(url);
	const $ = load(data);
	return {
		title: "五大唱片 - 新货上架",
		link: url,
		item: $(".releases-list .tbody > .box").toArray().map((item) => {
			const cells = $(item).find(".td");
			const artist = $(cells[0]).find("a").toArray().map((el) => $(el).text().trim()).join(" / ");
			const albumCell = $(cells[1]);
			const album = albumCell.find("a").first().text().trim();
			const albumLink = albumCell.find("a").first().attr("href");
			const releaseDate = $(cells[2]).text().trim();
			const company = $(cells[3]).text().trim();
			const format = $(cells[4]).text().trim();
			return {
				title: `${artist} - ${album}`,
				description: `
                    <p>艺人: ${artist}</p>
                    <p>专辑: ${album}</p>
                    <p>发行公司: ${company}</p>
                    <p>格式: ${format}</p>
                    <p>发行日期: ${releaseDate}</p>
                `,
				link: albumLink ? `https://www.5music.com.tw/${albumLink}` : url,
				pubDate: parseDate(releaseDate),
				category: format,
				author: artist
			};
		}),
		language: "zh-tw"
	};
}
//#endregion
export { route };
