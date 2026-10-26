import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/v2ex/tab.ts
const route = {
	path: "/tab/:tabid",
	categories: ["bbs"],
	view: 0,
	example: "/v2ex/tab/hot",
	parameters: { tabid: "tab标签ID,在 URL 可以找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "标签",
	maintainers: ["liyefox"],
	handler
};
async function handler(ctx) {
	const tabid = ctx.req.param("tabid");
	const host = "https://v2ex.com";
	const pageUrl = `${host}/?tab=${tabid}`;
	const $ = load((await got_default({
		method: "get",
		url: pageUrl
	})).data);
	const links = $("span.item_title > a").toArray().slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 10).map((link) => `${host}${$(link).attr("href").replace(/#.*$/, "")}`);
	const items = await Promise.all(links.map((link) => cache_default.tryGet(`v2ex-${link}`, async () => {
		const $ = load((await got_default({
			method: "get",
			url: link
		})).data);
		const replyContent = $("[id^=\"r_\"]").toArray().map((item) => {
			const post = $(item);
			const content = post.find(".reply_content").html();
			const author = post.find(".dark").first().text();
			return `<p><div>#${post.find(".no").text()}: <i>${author}</i></div><div>${content}</div></p>`;
		}).join("");
		return {
			title: $(".header h1").text(),
			link,
			description: `${$("div.topic_content").html()}<div>${replyContent}</div>`,
			author: $("div.header > small > a").text()
		};
	})));
	return {
		title: `V2EX-${tabid}`,
		link: pageUrl,
		description: `V2EX-tab-${tabid}`,
		item: items
	};
}
//#endregion
export { route };
