import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderDescription } from "./description-8_6QPeST.mjs";
import { load } from "cheerio";
//#region lib/routes/jimmyspa/books.ts
const route = {
	path: "/books/:language",
	categories: ["design"],
	view: 0,
	example: "/jimmyspa/books/tw",
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
	radar: [{ source: ["www.jimmyspa.com/:language/Books"] }],
	name: "Books",
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
	const baseUrl = "https://www.jimmyspa.com";
	const booksListUrl = new URL(`/${language}/Books/Ajax/changeList?year=&keyword=&categoryId=0&page=1`, baseUrl).href;
	const bookItems = load((await got_default(booksListUrl)).data.view)("ul#appendWork li.work_block").toArray().map(async (bookElement) => {
		const bookContent = load(bookElement);
		const bookTitle = bookContent("p.tit").text();
		const bookImageRelative = bookContent("div.work_img img").prop("src") || "";
		const bookImageUrl = bookImageRelative ? baseUrl + bookImageRelative : "";
		const bookDetailUrl = bookContent("li.work_block").prop("data-route");
		const { renderedDescription, publishDate } = await cache_default.tryGet(bookDetailUrl, async () => {
			const detailPage = load((await got_default(bookDetailUrl)).data);
			const bookDescription = detailPage("article.intro_cont").html() || "";
			const bookInfoWrap = detailPage("div.info_wrap").html() || "";
			const processedDescription = bookDescription.replaceAll(/<img\b[^>]*>/g, (imgTag) => imgTag.replaceAll(/\b(src|data-src)="(?!http|\/\/)([^"]*)"/g, (_, attrName, relativePath) => {
				return `${attrName}="${new URL(relativePath, baseUrl).href}"`;
			}));
			const publishDateMatch = bookInfoWrap.match(/<span>(首次出版|First Published|初版)<\/span>\s*<span class="num">([^<]+)<\/span>/);
			const publishDate = publishDateMatch ? parseDate(publishDateMatch[2] + "-02") : "";
			return {
				renderedDescription: renderDescription({
					images: bookImageUrl ? [{
						src: bookImageUrl,
						alt: bookTitle
					}] : void 0,
					description: processedDescription
				}),
				publishDate
			};
		});
		return {
			title: bookTitle,
			link: bookDetailUrl,
			description: renderedDescription,
			pubDate: publishDate,
			content: {
				html: renderedDescription,
				text: bookTitle
			}
		};
	});
	return {
		title: `幾米 - 幾米創作(${language})`,
		link: `${baseUrl}/${language}/Books`,
		allowEmpty: true,
		item: await Promise.all(bookItems)
	};
}
//#endregion
export { route };
