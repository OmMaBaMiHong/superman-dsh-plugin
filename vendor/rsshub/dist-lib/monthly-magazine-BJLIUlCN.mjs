import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as extractNews, t as baseUrl } from "./utils-Cxt2ik80.mjs";
import { load } from "cheerio";
//#region lib/routes/visionias/monthly-magazine.ts
const route = {
	path: "/monthlyMagazine",
	example: "/visionias/monthlyMagazine",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["visionias.in/current-affairs/monthly-magazine"],
		target: "/monthlyMagazine"
	}],
	name: "Monthly Magazine",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler() {
	const items = await processNews(await rofetch(`${baseUrl}/current-affairs/monthly-magazine`));
	return {
		title: "Monthly Magazine | Vision IAS",
		link: `${baseUrl}/current-affairs/monthly-magazine`,
		description: "Monthly Magazine from Vision IAS provides a comprehensive overview of current affairs, covering significant events and developments across various sectors. It is designed to help aspirants stay updated with the latest happenings, enhancing their preparation for competitive exams.",
		language: "en",
		item: items,
		image: `${baseUrl}/current-affairs/images/news-today-logo.svg`,
		icon: "https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png",
		logo: "https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png",
		allowEmpty: true
	};
}
async function processNews(page) {
	const $ = load(page);
	const linkItems = $("#monthly-table-of-content>div").toArray().flatMap((item) => {
		const maintitle = $(item).find("button>div:nth-child(2) div.text-left").text().trim();
		return $(item).find("div>ul>li").toArray().map((li) => {
			const itemTitle = $(li).find("a").text().trim();
			const link = $(li).find("a").attr("href")?.trim() || "";
			return {
				title: `${itemTitle} - ${maintitle}`,
				link: link.includes("https://") ? link : `${baseUrl}${link}`
			};
		});
	});
	return (await Promise.allSettled(linkItems.map((item) => extractNews(item, "main > div > div.flex.flex-col> div.flex.flex-col.w-full.mt-10")))).flatMap((news) => news.status === "fulfilled" ? Array.isArray(news.value) ? news.value : [news.value] : [{ title: "Error Parse News" }]);
}
//#endregion
export { route };
