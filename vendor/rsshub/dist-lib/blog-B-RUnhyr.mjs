import { t as fetchItems } from "./utils-brsou0Y92.mjs";
//#region lib/routes/web/blog.ts
const route = {
	path: "/blog",
	categories: ["programming"],
	example: "/web/blog",
	radar: [{ source: ["web.dev/blog"] }],
	name: "Blog",
	maintainers: ["KarasuShin"],
	handler
};
async function handler() {
	return {
		title: "Blog",
		link: "https://web.dev/blog",
		image: "https://web.dev/_pwa/web/icons/icon-144x144.png",
		item: await fetchItems("type:blog")
	};
}
//#endregion
export { route };
