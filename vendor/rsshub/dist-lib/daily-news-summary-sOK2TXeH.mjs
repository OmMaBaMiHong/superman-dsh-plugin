import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as baseUrl } from "./utils-Cxt2ik80.mjs";
import { load } from "cheerio";
//#region lib/routes/visionias/daily-news-summary.ts
const route = {
	path: "/dailySummary",
	example: "/visionias/dailySummary",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["visionias.in/current-affairs/upsc-daily-news-summary"],
		target: "/dailySummary"
	}],
	name: "Daily News Summary",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler() {
	const items = processNews(await rofetch(`${baseUrl}/current-affairs/upsc-daily-news-summary`));
	return {
		title: "Daily News Summary | Vision IAS",
		link: `${baseUrl}/current-affairs/upsc-daily-news-summary`,
		description: "Get concise and efficient summaries of key articles from prominent newspapers. Our daily news digest ensures quick reading and easy understanding, helping you stay informed about important events and developments without spending hours going through full articles. Perfect for focused and timely updates.",
		language: "en",
		item: items,
		image: `${baseUrl}/current-affairs/images/news-today-logo.svg`,
		icon: "https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png",
		logo: "https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png",
		allowEmpty: true
	};
}
function processNews(page) {
	const $ = load(page);
	return $("#quiz-start div[x-data=\"{ isExpanded: false }\"]").toArray().map((item) => {
		const title = $(item).find("a>h5").text().trim();
		const content = $(item).find("a>div").html() ?? "";
		const link = $(item).find("div>p>a").attr("href") || "";
		return {
			title,
			link,
			guid: link,
			description: content
		};
	});
}
//#endregion
export { route };
