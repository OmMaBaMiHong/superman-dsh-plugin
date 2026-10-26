import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
//#region lib/routes/autocentre/index.ts
const route = {
	path: "/",
	name: "Автомобільний сайт N1 в Україні",
	categories: ["new-media"],
	maintainers: ["driversti"],
	example: "/autocentre",
	handler
};
const createItem = (item) => ({
	title: item.title,
	link: item.link,
	description: item.contentSnippet
});
async function handler() {
	const feed = await parser.parseURL("https://www.autocentre.ua/rss");
	return {
		title: feed.title,
		link: feed.link,
		description: feed.description,
		language: "uk",
		item: await Promise.all(feed.items.map((item) => createItem(item)))
	};
}
//#endregion
export { route };
