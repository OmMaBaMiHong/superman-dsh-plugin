import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/literotica/category.ts
const route = {
	path: "/category/:category",
	radar: [{ source: ["literotica.com/c/:category", "literotica.com/"] }],
	name: "Unknown",
	maintainers: ["nczitzk"],
	handler,
	features: { nsfw: true }
};
async function handler(ctx) {
	const currentUrl = `https://www.literotica.com/c/${ctx.req.param("category")}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(".b-slb-item").toArray().map((item) => {
		item = $(item);
		const a = item.find("h3 a");
		return {
			title: a.text(),
			link: a.attr("href"),
			author: item.find(".b-user-info-name").text(),
			pubDate: parseDate(item.find(".b-slib-date").text(), "MM/DD/YY")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)(".aa_ht").html();
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
