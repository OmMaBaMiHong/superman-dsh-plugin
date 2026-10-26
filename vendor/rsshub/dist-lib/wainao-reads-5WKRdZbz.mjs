import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/wainao/wainao-reads.ts
const route = {
	path: "/wainao-reads",
	categories: ["new-media"],
	example: "/wainao/wainao-reads",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	url: "www.wainao.me",
	name: "歪脑读",
	maintainers: ["lucky13820"],
	radar: [{
		source: ["www.wainao.me", "www.wainao.me/wainao-reads"],
		target: "/wainao-reads"
	}],
	handler
};
async function handler() {
	const apiUrl = "https://www.wainao.me/pf/api/v3/content/fetch/content-api-collections?query={\"content_alias\":\"wainao-hero\"}&d=81&_website=wainao";
	const baseUrl = "https://www.wainao.me";
	const response = await got_default(apiUrl);
	return {
		title: "歪脑读 - 歪脑",
		link: baseUrl,
		item: JSON.parse(response.body).content_elements.map((item) => ({
			title: item.headlines.basic,
			description: item.description?.basic || "",
			link: baseUrl + item.canonical_url,
			pubDate: parseDate(item.publish_date),
			image: item.promo_items?.basic?.url || ""
		}))
	};
}
//#endregion
export { route };
