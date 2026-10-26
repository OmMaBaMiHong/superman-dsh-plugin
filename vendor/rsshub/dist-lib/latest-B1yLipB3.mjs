import { n as processList, r as rootUrl, t as getRelativeUrlList } from "./utils-BtOfZlpH.mjs";
//#region lib/routes/joshwcomeau/latest.ts
const route = {
	path: "/latest/:category?",
	categories: ["programming"],
	example: "/joshwcomeau/latest/css",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	parameters: { category: {
		description: "Category",
		options: [
			{
				value: "css",
				label: "CSS"
			},
			{
				value: "react",
				label: "React"
			},
			{
				value: "animation",
				label: "Animation"
			},
			{
				value: "javascript",
				label: "JavaScript"
			},
			{
				value: "career",
				label: "Career"
			},
			{
				value: "blog",
				label: "Blog"
			}
		]
	} },
	radar: [{
		source: ["joshwcomeau.com/"],
		target: "/latest"
	}, {
		source: ["joshwcomeau.com/:category"],
		target: "/latest/:category"
	}],
	name: "Articles and Tutorials",
	maintainers: ["Rjnishant530"],
	handler
};
async function handler(ctx) {
	const category = ctx.req.param("category") || "";
	const currentUrl = category ? `${rootUrl}/${category}` : rootUrl;
	const { heading, urls } = await getRelativeUrlList(currentUrl, category ? "div > article > a:first-child" : "article[data-include-enter-animation=\"false\"] > a:first-child");
	const items = await processList(urls);
	const title = category ? `${heading} | ` : "";
	return {
		title: `${title}Articles and Tutorials | Josh W. Comeau`,
		description: `Friendly tutorials for developers. Focus on ${category ? title : "React, CSS, Animation, and more!"}`,
		link: currentUrl,
		item: items,
		icon: `${rootUrl}/favicon.png`,
		logo: `${rootUrl}/favicon.png`
	};
}
//#endregion
export { route };
