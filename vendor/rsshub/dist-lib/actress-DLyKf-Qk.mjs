import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/projectjav/utils.ts
const rootUrl = "https://projectjav.com";
const processItems = async (currentUrl) => {
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $("div.video-item").toArray().map((element) => {
		const item = $(element);
		const link = item.find("a").attr("href");
		return {
			title: item.find("div.name span").text() || "",
			link: link?.startsWith("http") ? link : `${rootUrl}${link}`
		};
	}).filter((item) => item.link && /\/movie\/.*/.test(item.link));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content("div.top-banner-ads, div.bottom-content-ads").remove();
		const mainContent = content("main");
		const h1Title = mainContent.find("h1").text().trim();
		if (h1Title) item.title = h1Title;
		const categories = mainContent.find("div.badge a").toArray().map((v) => content(v).text().trim()).filter(Boolean);
		if (categories.length > 0) item.category = categories;
		const actresses = mainContent.find("div.actress-item a").toArray().map((v) => content(v).text().trim()).filter(Boolean);
		if (actresses.length > 0) item.author = actresses.join(", ");
		const dateEl = mainContent.find("div.second-main~div.row>div.col-3").toArray().find((el) => content(el).text().includes("Date added"));
		const dateText = dateEl ? content(dateEl).next().text().trim() : null;
		if (dateText) item.pubDate = parseDate(dateText, "DD/MM/YYYY");
		item.description = mainContent.html() || "";
		return item;
	})));
	return {
		title: $("title").text() || "ProjectJAV",
		link: currentUrl,
		item: items
	};
};
//#endregion
//#region lib/routes/projectjav/actress.ts
const route = {
	path: "/actress/:id",
	categories: ["multimedia"],
	example: "/projectjav/actress/rima-arai-22198",
	parameters: { id: "Actress ID or slug, can be found in the actress page URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{
		source: ["projectjav.com/actress/:id"],
		target: "/actress/:id"
	}],
	name: "Actress",
	maintainers: ["Exat1979"],
	handler,
	url: "projectjav.com/",
	description: "Fetches the latest movies from a specific actress page on ProjectJAV."
};
async function handler(ctx) {
	return await processItems(`${rootUrl}/actress/${ctx.req.param("id").replace(/\/$/, "")}`);
}
//#endregion
export { route };
