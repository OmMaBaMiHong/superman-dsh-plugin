import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/finology/utils.ts
const getItems = async (url, extra) => {
	const mainUrl = "https://insider.finology.in";
	const $ = load(await rofetch(url));
	const listItems = $(extra.selector).toArray().map((item) => {
		const $item = $(item);
		const title = $item.find("p.text-m-height").text();
		const link = $item.find("a").attr("href");
		const pubDate = extra.date ? timezone(parseDate($item.find("div.text-light p").first().text()), 0) : "";
		const itunes_item_image = $item.find("img").attr("src");
		const category = [$item.find("p.pt025").text()];
		return {
			title,
			link: `${mainUrl}${link}`,
			pubDate,
			itunes_item_image,
			category
		};
	});
	const items = (await Promise.allSettled(listItems.map((item) => {
		if (item.link === void 0) return item;
		return cache_default.tryGet(item.link, async () => {
			const $ = load(await rofetch(item.link || ""));
			const div = $("div.w60.flex.flex-wrap-badge");
			item.author = div.find("div a p").text();
			item.updated = extra.date ? parseDate(div.find("p:contains(\"Updated on\") span").text()) : "";
			item.description = $("div#main-wrapper div#insiderhead").find("div.flex.flex-col.w100.align-center").children("div.m-position-r").remove().end().find("a[href=\"https://quest.finology.in/\"]").remove().end().find("div.blur-wall-wrap").remove().end().html() ?? "";
			return item;
		});
	}))).map((v, index) => v.status === "fulfilled" ? v.value : {
		...listItems[index],
		description: `Website did not load within Timeout Limits. <a href="${listItems[index].link}">Check with Website if the page is slow</a>`
	});
	const topicName = $("h1.font-heading.fs1875")?.text();
	return {
		items: items.filter((item) => item !== null && typeof item !== "string"),
		topicName
	};
};
//#endregion
//#region lib/routes/finology/category.ts
const route = {
	path: "/category/:category",
	categories: ["finance"],
	url: "insider.finology.in/business",
	example: "/finology/success-stories",
	parameters: { category: "Refer Table below or find in URL" },
	radar: [{ source: ["insider.finology.in/:category"] }],
	name: "Category",
	maintainers: ["Rjnishant530"],
	handler,
	description: `::: info Category

| Category              | Link               |
| --------------------- | ------------------ |
| **Business**          | business           |
| Big Shots             | entrepreneurship   |
| Startups              | startups-india     |
| Brand Games           | success-stories    |
| Juicy Scams           | juicy-scams        |
| **Finance**           | finance            |
| Macro Moves           | economy            |
| News Platter          | market-news        |
| Tax Club              | tax                |
| Your Money            | your-money         |
| **Invest**            | investing          |
| Stock Market          | stock-market       |
| Financial Ratios      | stock-ratios       |
| Investor's Psychology | behavioral-finance |
| Mutual Funds          | mutual-fund        |

:::`
};
async function handler(ctx) {
	const { category } = ctx.req.param();
	return await commonHandler("https://insider.finology.in", `/${category}`, {
		description: (topic) => `Articles for your research and knowledge under ${topic}`,
		date: true,
		selector: "div.card"
	});
}
async function commonHandler(baseUrl, route, extra) {
	const { items, topicName } = await getItems(`${baseUrl}${route}`, extra);
	return {
		title: `${topicName} - Finology Insider`,
		link: `${baseUrl}${route}`,
		item: items,
		description: extra.description(topicName || ""),
		logo: "https://insider.finology.in/Images/favicon/favicon.ico",
		icon: "https://insider.finology.in/Images/favicon/favicon.ico",
		language: "en-us"
	};
}
//#endregion
export { route as n, commonHandler as t };
