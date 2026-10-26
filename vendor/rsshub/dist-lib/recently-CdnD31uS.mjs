import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/macmenubar/recently.ts
async function getCategoryId(categories) {
	const { data: response } = await got_default("https://macmenubar.com/wp-json/wp/v2/categories", {
		method: "GET",
		searchParams: { slug: categories }
	});
	return response.map((item) => item.id + ",").join("");
}
const route = {
	path: "/recently/:category?",
	categories: ["blog"],
	example: "/macmenubar/recently/developer-apps,system-tools",
	parameters: { category: "Category path name, seperate by comma, default is all categories. Category path name can be found in url" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Recently",
	maintainers: ["5upernova-heng"],
	handler
};
async function handler(ctx) {
	const baseUrl = "https://macmenubar.com/wp-json/wp/v2/posts";
	const categories = ctx.req.param("category");
	const searchParams = { per_page: 100 };
	if (categories) searchParams.categories = await getCategoryId(categories);
	return {
		title: "Recent Posts | MacMenuBar.com",
		link: "https://macmenubar.com/recently-added/",
		item: (await got_default(baseUrl, {
			method: "GET",
			searchParams
		})).data.map((post) => {
			const title = post.title.rendered;
			const link = post.link;
			const pubDate = post.date_gmt;
			const description = post.content.rendered;
			const tags = post.tag_info.map((tag) => tag.name);
			const categories = post.category_info.map((category) => category.name);
			return {
				title,
				link,
				pubDate,
				description,
				category: [...tags, ...categories]
			};
		})
	};
}
//#endregion
export { route };
