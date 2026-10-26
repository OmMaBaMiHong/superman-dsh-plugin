import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/kelownacapnews/news.ts
const route = {
	path: "/:type",
	categories: ["new-media"],
	example: "/kelownacapnews/local-news",
	parameters: { type: "Type of news" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.kelownacapnews.com/:type"],
		target: "/:type"
	}],
	name: "News",
	maintainers: ["hualiong"],
	url: "www.kelownacapnews.com",
	description: `\`type\` is as follows:

| News type     | Value         | News type    | Value        |
| ------------- | ------------- | ------------ | ------------ |
| News          | news          | Sports       | sports       |
| Local News    | local-news    | Business     | business     |
| Canadian News | national-news | Trending Now | trending-now |
| World News    | world-news    | Opinion      | opinion      |
| Entertainment | entertainment |              |              |`,
	handler: async (ctx) => {
		const type = ctx.req.param("type");
		const baseURL = "https://www.kelownacapnews.com";
		const $ = load(await rofetch(`${baseURL}/${type}`));
		const list = $(".media").toArray().map((item) => {
			const a = $(item);
			return {
				title: a.find(".media-heading").text(),
				pubDate: parseDate(a.find(".media-links time").attr("datetime")),
				link: baseURL + a.attr("href")
			};
		});
		const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load(await rofetch(item.link));
			let image = $(".details-file");
			if (!image.length) image = $("#sliderImgs .tablist-item .galleryWrap");
			const profileTitle = $(".details-byline").find(".profile-title");
			if (profileTitle.length) item.author = profileTitle.find("a").text();
			let label = "";
			if (image.length > 1) for (const e of image.toArray()) {
				const img = $(e);
				label += `<figure style="margin: 10px 0 0 0"><img src='${img.data("src")}' /><figcaption>${img.attr("title")}</figcaption></figure>`;
			}
			else label = `<figure style="margin: 0">${image.html()}</figure>`;
			item.description = label + $(".details-body").html();
			return item;
		})));
		return {
			title: `${$(".body-title").text()} - Kelowna Capital News`,
			link: `${baseURL}/${type}`,
			item: items
		};
	}
};
//#endregion
export { route };
