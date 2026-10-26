import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/v2rayshare/index.ts
const route = {
	path: "/",
	radar: [{
		source: ["v2rayshare.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["77taibai"],
	handler,
	url: "v2rayshare.com/"
};
async function handler() {
	const { data: response } = await got_default("https://v2rayshare.com/wp-json/wp/v2/posts/?per_page=10");
	return {
		title: "V2rayShare",
		link: "https://v2rayshare.com/",
		description: "免费节点分享网站",
		item: response.map((item) => ({
			title: item.title.rendered,
			link: item.link,
			author: "V2rayShare",
			category: ["免费节点"],
			pubDate: parseDate(item.date_gmt),
			description: item.content.rendered
		}))
	};
}
//#endregion
export { route };
