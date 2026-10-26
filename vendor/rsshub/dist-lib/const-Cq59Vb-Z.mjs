import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/baobua/article.ts
const loadArticle = async (link) => {
	const article = load((await got_default(link)).body);
	const title = article("title").text().replace("BaoBua.Com:", "").replace(/\| Page \d+\/\d+/, "").trim();
	const totalPagesMatch = /Page \d+\/(\d+)/.exec(article("title").text());
	const totalPages = totalPagesMatch ? Number.parseInt(totalPagesMatch[1]) : 1;
	let pubDate;
	const blogPostingScript = article("script:contains(\"BlogPosting\")").first();
	if (blogPostingScript) pubDate = parseDate(JSON.parse(blogPostingScript.text()).datePublished);
	let description = article(".contentme2").html() ?? "";
	if (totalPages > 1) {
		const additionalContents = await Promise.all(Array.from({ length: totalPages - 1 }, async (_, i) => {
			try {
				return load((await got_default(`${link}?page=${i + 2}`)).body)(".contentme2").html() ?? "";
			} catch {
				return "";
			}
		}));
		description += additionalContents.join("");
	}
	return {
		title,
		description,
		pubDate,
		link
	};
};
//#endregion
//#region lib/routes/baobua/const.ts
const SUB_NAME_PREFIX = "BaoBua";
const SUB_URL = "https://baobua.com/";
//#endregion
export { SUB_URL as n, loadArticle as r, SUB_NAME_PREFIX as t };
