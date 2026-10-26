import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/pianyivps/rss.ts
const route = {
	path: "/",
	categories: ["blog"],
	example: "/pianyivps",
	radar: [{ source: ["pianyivps.com/"] }],
	name: "最新发布",
	maintainers: ["cnkmmk"],
	handler,
	url: "pianyivps.com/"
};
async function handler() {
	const url = "https://www.pianyivps.com";
	return {
		title: "便宜VPS网",
		link: url,
		description: "便宜VPS网 - 最新发布",
		item: (await got_default(`${url}/wp-json/wp/v2/posts`)).data.map((item) => ({
			title: item.title.rendered,
			link: item.link,
			pubDate: parseDate(item.date_gmt),
			description: item.content.rendered
		}))
	};
}
//#endregion
export { route };
