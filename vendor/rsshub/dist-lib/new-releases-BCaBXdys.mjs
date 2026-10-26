import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/bellroy/new-releases.ts
const route = {
	path: "/new-releases",
	categories: ["shopping"],
	example: "/bellroy/new-releases",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bellroy.com/collection/new-releases", "bellroy.com/"] }],
	name: "New Releases",
	maintainers: ["EthanWng97"],
	handler,
	url: "bellroy.com/collection/new-releases"
};
async function handler() {
	const host = "https://bellroy.com";
	return {
		title: "Bellroy - New Releases",
		link: "https://bellroy.com/collection/new-releases",
		description: "Bellroy - New Releases",
		item: (await got_default({
			method: "get",
			url: "https://production.products.boobook-services.com/products",
			searchParams: {
				currency_identifier: "1abe985632a1392e6a94b885fe193d5943b7c213",
				price_group: "bellroy.com",
				"filter[dimensions][web_new_release]": "new_style"
			}
		})).data.products.map((item) => ({
			title: item.attributes.name + " - " + item.attributes.dimensions.color,
			link: host + item.attributes.canonical_uri
		}))
	};
}
//#endregion
export { route };
