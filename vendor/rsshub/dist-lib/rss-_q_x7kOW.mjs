import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/ippa/rss.ts
const route = {
	path: "/",
	categories: ["blog"],
	example: "/ippa",
	radar: [{ source: ["ippa.top/"] }],
	name: "最新文章",
	maintainers: ["cnkmmk"],
	handler,
	url: "ippa.top/"
};
async function handler() {
	const url = "https://www.ippa.top";
	return {
		title: "子方有料",
		link: url,
		description: "子方有料 - 最新文章",
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
