import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/subhd/index.ts
const config = {
	sub: {
		title: "字幕",
		category: "new"
	},
	zu: {
		title: "字幕组",
		category: "14"
	},
	newest: { category: "for backwards compatibility" }
};
const route = {
	path: "/:type?/:category?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "sub";
	const category = ctx.req.param("category") ?? config[type].category;
	const rootUrl = "https://subhd.tv";
	const currentUrl = `${rootUrl}/${type === "newest" ? "sub/new" : `${type}/${category}${type === "zu" ? "/l" : ""}`}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	$(".align-middle").each((_, el) => {
		$(el).removeClass("link-dark");
	});
	let items = $(".link-dark").toArray().map((item) => {
		item = $(item);
		const pubDate = item.parent().parent().find(".align-text-top").last().text();
		const today = `${(/* @__PURE__ */ new Date()).getFullYear()}-${(/* @__PURE__ */ new Date()).getMonth()}-${(/* @__PURE__ */ new Date()).getDate()}`;
		return {
			link: `${rootUrl}${item.attr("href")}`,
			author: item.parent().parent().find(".text-dark").last().text(),
			pubDate: timezone(parseDate(pubDate.includes("-") ? pubDate : `${today} ${pubDate}`), 8),
			title: `${item.parent().parent().find(".align-middle").text()} ${item.text().replace(/ - SubHD/, "")}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content(".rounded-circle").remove();
		content(".view-text").last().remove();
		item.description = content(".view-text").html() + content(".bg-white").first().html();
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
