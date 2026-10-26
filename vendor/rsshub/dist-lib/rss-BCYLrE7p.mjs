import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/free/rss.ts
const route = {
	path: "/",
	categories: ["blog"],
	example: "/free",
	radar: [{ source: ["free.com.tw/"] }],
	name: "最新文章",
	maintainers: ["cnkmmk"],
	handler,
	url: "free.com.tw/"
};
async function handler() {
	const url = "https://free.com.tw/";
	return {
		title: "免費資源網路社群",
		link: url,
		description: "免費資源網路社群 - 全部文章",
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
