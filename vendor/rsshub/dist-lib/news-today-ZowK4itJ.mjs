import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { n as extractNews, t as baseUrl } from "./utils-Cxt2ik80.mjs";
import dayjs from "dayjs";
import { load } from "cheerio";
//#region lib/routes/visionias/news-today.ts
const route = {
	path: "/newsToday/:filter?",
	example: "/visionias/newsToday",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	parameters: { filter: {
		description: "Period to fetch news for the current month. All news for the current month or only the latest",
		default: "latest",
		options: [{
			value: "all",
			label: "All"
		}, {
			value: "latest",
			label: "Latest"
		}]
	} },
	radar: [{
		source: ["visionias.in/current-affairs/news-today"],
		target: "/newsToday"
	}],
	name: "News Today",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler(ctx) {
	const filter = ctx.req.param("filter") ?? "latest";
	const currentYear = dayjs().year();
	const currentMonth = dayjs().month() + 1;
	logger.debug(`Getting news for month ${currentMonth} and year ${currentYear}`);
	const response = await rofetch(`${baseUrl}/current-affairs/news-today/getbymonth?year=${currentYear}&month=${currentMonth}`);
	let items = [];
	if (response.length !== 0) if (filter === "latest") {
		const currentUrl = response[0].url;
		items = await processCurrentNews(currentUrl);
	} else {
		const results = await Promise.all(response.map((element) => processCurrentNews(element.url)));
		items.push(...results.flat());
	}
	return {
		title: "News Today | Current Affairs | Vision IAS",
		link: `${baseUrl}/current-affairs/news-today/archive`,
		description: "News Today is a daily bulletin providing readers with a comprehensive overview of news developments, news types, and technical terms.",
		language: "en",
		item: items,
		image: `${baseUrl}/current-affairs/images/news-today-logo.svg`,
		icon: "https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png",
		logo: "https://cdn.visionias.in/new-system-assets/images/home_page/home/vision-logo-footer.png",
		allowEmpty: true
	};
}
async function processCurrentNews(currentUrl) {
	const $ = load(await rofetch(`${baseUrl}${currentUrl}`));
	const items = $("#table-of-content > ul > li > a").toArray().map((item) => {
		const link = $(item).attr("href");
		const title = $(item).clone().children("span").remove().end().text().trim();
		return {
			title,
			link: title === "Also in News" ? link : `${baseUrl}${link}`,
			guid: link
		};
	});
	return (await Promise.allSettled(items.map((item) => extractNews(item, "main > div > div.mt-6 > div.flex > div.flex.mt-6")))).flatMap((news) => news.status === "fulfilled" ? Array.isArray(news.value) ? news.value : [news.value] : [{ title: "Error Parse News" }]);
}
//#endregion
export { route };
