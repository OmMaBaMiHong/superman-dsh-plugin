import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as processList } from "./utils-Chd3GrJZ.mjs";
import { load } from "cheerio";
//#region lib/routes/30secondsofcode/category.ts
const route = {
	path: "/category/:category?/:subCategory?",
	categories: ["programming"],
	example: "/30secondsofcode/category/css/interactivity",
	parameters: {
		category: {
			description: "Main Category. For Complete list visit site \"https://www.30secondsofcode.org/collections/p/1/\"",
			options: [
				{
					value: "js",
					label: "Javascript"
				},
				{
					value: "css",
					label: "CSS"
				},
				{
					value: "algorithm",
					label: "JavaScript Algorithms"
				},
				{
					value: "react",
					label: "React"
				}
			]
		},
		subCategory: { description: "Filter within Category. Visit Individual Category site for subCategories" }
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["30secondsofcode.org/:category/:subCategory/", "30secondsofcode.org/:category/"],
		target: "/category/:category/:subCategory"
	}],
	name: "Category and Subcategory",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "";
	const subCategory = ctx.req.param("subCategory") ?? "";
	const rootUrl = "https://www.30secondsofcode.org";
	const $ = load(await rofetch(`${rootUrl}${category ? `/${category}` : ""}${subCategory ? `/${subCategory}` : ""}${category || subCategory ? "/p/1/" : ""}`));
	const heroElement = $("section.hero");
	const heading = heroElement.find("div > h1").text();
	const description = heroElement.find("div > p").text();
	const image = heroElement.find("img").attr("src");
	const items = await processList($("section.preview-list > ul > li").toArray());
	return {
		title: heading,
		description,
		image: `${rootUrl}${image}`,
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
