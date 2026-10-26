import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/gamer520/index.ts
const route = {
	path: "/:category?/:order?",
	categories: ["game"],
	example: "/gamer520/switchyouxi",
	parameters: {
		category: "分类，见下表",
		order: "排序，发布日期: date; 修改日期: modified"
	},
	features: { antiCrawler: true },
	name: "文章",
	maintainers: ["xzzpig"],
	handler,
	url: "www.gamer520.com/",
	description: `分类

| 所有 | Switch 游戏下载 | 金手指     | 3A 巨作 | switch 主题 | PC 游戏 |
| ---- | --------------- | ---------- | ------- | ----------- | ------- |
| all  | switchyouxi     | jinshouzhi | 3ajuzuo | zhuti       | pcgame  |`
};
async function getCategories(baseUrl) {
	return await cache_default.tryGet("gamer520:categories", async () => {
		const { data } = await got_default(`${baseUrl}/wp-json/wp/v2/categories`);
		return data.map((category) => ({
			slug: category.slug,
			id: category.id,
			name: category.name,
			link: category.link
		}));
	});
}
async function handler(ctx) {
	const baseUrl = "https://www.gamer520.com";
	const categories = await getCategories(baseUrl);
	const category = ctx.req.param("category") ?? "all";
	const order = ctx.req.param("order");
	const categoryId = categories.find((c) => c.slug === category)?.id;
	const { data } = await got_default(`${baseUrl}/wp-json/wp/v2/posts`, { searchParams: {
		categories: categoryId,
		orderby: order,
		per_page: ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : void 0
	} });
	const items = data.map((item) => ({
		guid: `gamer520:${item.id}`,
		title: item.title.rendered,
		link: item.guid.rendered,
		pubDate: parseDate(item.date_gmt),
		updated: parseDate(item.modified_gmt),
		category: item.categories?.map((c) => categories.find((ca) => ca.id === c)?.name ?? "").filter((c) => c !== "") ?? [],
		description: item.content.rendered
	}));
	return {
		title: "全球游戏交流中心-" + (categories.find((c) => c.slug === category)?.name ?? "所有"),
		link: categories.find((c) => c.slug === category)?.link ?? baseUrl,
		item: items
	};
}
//#endregion
export { route };
