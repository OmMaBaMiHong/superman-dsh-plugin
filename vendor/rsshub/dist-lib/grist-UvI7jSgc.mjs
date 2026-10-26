import { n as getList, t as getData } from "./utils-BSlXfjD0.mjs";
//#region lib/routes/grist/index.ts
const route = {
	path: "/",
	radar: [{ source: ["grist.org/articles/"] }],
	name: "Latest Articles",
	maintainers: ["Rjnishant530"],
	categories: ["new-media"],
	example: "/grist",
	parameters: {},
	handler,
	url: "grist.org/articles/"
};
async function handler() {
	const baseUrl = "https://grist.org";
	const items = await getList(await getData(`${baseUrl}/wp-json/wp/v2/posts?_embed`));
	return {
		title: "Gist Latest Articles",
		link: `${baseUrl}/articles`,
		item: items,
		description: "Latest Articles on grist.org",
		logo: "https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=192",
		icon: "https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=32",
		language: "en-us"
	};
}
//#endregion
export { route };
