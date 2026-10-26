import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as parseItem, r as parseList, t as getCategories } from "./utils-CkGHggts.mjs";
//#region lib/routes/4gamers/category.ts
const route = {
	path: ["/", "/category/:category"],
	radar: [{
		source: ["www.4gamers.com.tw/news", "www.4gamers.com.tw/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["TonyRL"],
	handler,
	url: "www.4gamers.com.tw/news"
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 25;
	const isLatest = !category;
	const { data: response } = await got_default(`https://www.4gamers.com.tw/site/api/news/${isLatest ? "latest" : `by-category/${category}`}`, { searchParams: {
		nextStart: 0,
		pageSize: limit
	} });
	const list = parseList(response.data.results);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, () => parseItem(item))));
	let categoryName = "最新消息";
	if (!isLatest) categoryName = (await getCategories()).find((c) => c.id === Number.parseInt(category)).name;
	return {
		title: `4Gamers - ${categoryName}`,
		link: `https://www.4gamers.com.tw/news${isLatest ? "" : `/category/${category}/${categoryName}`}`,
		item: items
	};
}
//#endregion
export { route };
