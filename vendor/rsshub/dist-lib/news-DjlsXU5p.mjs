import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderDescription } from "./description-8_6QPeST.mjs";
import { load } from "cheerio";
//#region lib/routes/jimmyspa/news.ts
const route = {
	path: "/news/:language",
	categories: ["design"],
	view: 2,
	example: "/jimmyspa/news/tw",
	parameters: { language: {
		description: "语言",
		options: [
			{
				value: "tw",
				label: "臺灣正體"
			},
			{
				value: "en",
				label: "English"
			},
			{
				value: "jp",
				label: "日本語"
			}
		]
	} },
	radar: [{ source: ["www.jimmyspa.com/:language/News"] }],
	name: "News",
	description: `| language | Description |
| -------- | ----------- |
| tw       | 臺灣正體    |
| en       | English     |
| jp       | 日本語      |`,
	maintainers: ["Cedaric"],
	handler
};
async function handler(ctx) {
	const language = ctx.req.param("language");
	const rootUrl = "https://www.jimmyspa.com";
	const currentUrl = new URL(`/${language}/News/Ajax/changeList?year=&keyword=&categoryId=0&page=1`, rootUrl).href;
	const items = load((await got_default(currentUrl)).data.view)("ul#appendNews li.card_block").toArray().map((item) => {
		const $$ = load(item);
		const title = $$("a.news_card .info_wrap h3").text();
		const image = $$("a.news_card .card_img img").prop("src") || "";
		const link = $$("a.news_card").prop("data-route");
		const pubDate = convertHtmlDateToStandardFormat(($$("a.news_card div.date").html() || "").toString());
		const description = renderDescription({
			images: image ? [{
				src: image,
				alt: title
			}] : void 0,
			description: $$("a.news_card .info_wrap p").text()
		});
		return {
			title,
			link,
			description,
			pubDate,
			content: {
				html: description,
				text: title
			}
		};
	});
	return {
		title: `幾米 - 最新消息(${language})`,
		link: `${rootUrl}/${language}/News`,
		allowEmpty: true,
		item: items
	};
}
function convertHtmlDateToStandardFormat(htmlContent) {
	const match = htmlContent.match(/<p>(\d{1,2})<\/p>\s*<p>(\d{1,2})\s*\.\s*([A-Za-z]{3})<\/p>/);
	if (match) {
		const day = Number.parseInt(match[1]) + 1;
		const year = match[2];
		return parseDate(`20${year}-${{
			Jan: "01",
			Feb: "02",
			Mar: "03",
			Apr: "04",
			May: "05",
			Jun: "06",
			Jul: "07",
			Aug: "08",
			Sep: "09",
			Oct: "10",
			Nov: "11",
			Dec: "12"
		}[match[3]] || ""}-${day}`);
	}
}
//#endregion
export { route };
