import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/huijin-inv/news.ts
const BASE_URL = "https://www.huijin-inv.cn";
/**
* The client-side entrypoint to redirect to the post index of the latest year.
*/
const ENTRY_URL = `${BASE_URL}/huijin-inv/Corporate_History/index.shtml`;
const DEFAULT_REDIRECT_PATH = "/huijin-inv/SC20252/Information_Center.shtml";
async function handler() {
	const $entry = load(await rofetch(ENTRY_URL));
	const $scripts = $entry("head script");
	let redirectPath = DEFAULT_REDIRECT_PATH;
	$scripts.each((_, el) => {
		const redirectScript = $entry(el).text();
		if (redirectScript !== null) {
			const match = redirectScript.match(/window\.location\.href\s*=\s*["']([^"']+)["']/);
			if (match) redirectPath = match[1];
		}
	});
	const $ = load(await rofetch(`${BASE_URL}${redirectPath}`));
	const title = $("title").text()?.trim();
	const author = $("div.logo a").attr("title")?.trim();
	return {
		item: $("div.infor-list-item").toArray().map((listItem) => {
			const item = $(listItem);
			const title = item.find("h1").text();
			const pubDate = `${item.find("span.year").text()}.${item.find("span.day").text()}`;
			const href = item.find("a").prop("href");
			const link = href ? href.startsWith("http") ? href : new URL(href, BASE_URL).href : BASE_URL;
			const description = item.find("p").text();
			return {
				title,
				link,
				pubDate: timezone(parseDate(pubDate), 8),
				description
			};
		}),
		title,
		link: BASE_URL,
		description: `${author} - ${title}`,
		author,
		language: "zh-CN"
	};
}
const route = {
	path: "/news",
	categories: ["finance"],
	example: "/huijin-inv/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.huijin-inv.cn/"] }],
	name: "资讯中心",
	maintainers: ["la3rence"],
	handler,
	description: "中央汇金投资有限责任公司 - 资讯中心"
};
//#endregion
export { route };
