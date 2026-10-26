import { t as fetchItems } from "./utils-brsou0Y92.mjs";
//#region lib/routes/web/articles.ts
const route = {
	path: "/articles",
	categories: ["programming"],
	example: "/web/articles",
	radar: [{ source: ["web.dev/articles"] }],
	name: "Articles",
	maintainers: ["KarasuShin"],
	handler
};
async function handler() {
	return {
		title: "Articles",
		link: "https://web.dev/articles",
		image: "https://web.dev/_pwa/web/icons/icon-144x144.png",
		item: await fetchItems("family_url:/articles")
	};
}
//#endregion
export { route };
