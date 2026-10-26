import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/logrocket/index.ts
const route = {
	path: "/:type",
	categories: ["blog"],
	example: "/logrocket/dev",
	parameters: { type: "dev | product-management | ux-design" },
	radar: [{ source: ["blog.logrocket.com"] }],
	name: "blog.logrocket",
	maintainers: ["findwei"],
	handler,
	url: "blog.logrocket.com/"
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const link = "https://blog.logrocket.com/";
	let title = "Dev";
	if (type === "product-management") title = "Product Management";
	else if (type === "ux-design") title = "UX Design";
	const $ = load(await rofetch(`${link}${type}`));
	const list = $("div.post-list .post-card").toArray().map((item) => {
		item = $(item);
		const a = item.find("a").first();
		return {
			title: item.find(".post-card-title").first().text(),
			link: a.attr("href"),
			pubDate: parseDate(item.find(".post-card-author-name").next().text().split(" ⋅ ", 1)[0], "MMM D, YYYY"),
			author: item.find(".post-card-author-name").text()
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load(await rofetch(item.link));
		$("div.content-max-width .sidebar-container div.code-block").remove();
		item.description = $("div.content-max-width .sidebar-container").html();
		return item;
	})));
	return {
		title: `logrocket-${title}`,
		link,
		description: `logrocket-${title}`,
		item: items
	};
}
//#endregion
export { route };
