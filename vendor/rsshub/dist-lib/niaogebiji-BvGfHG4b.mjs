import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/niaogebiji/index.ts
const route = {
	path: "/",
	radar: [{
		source: ["niaogebiji.com/", "niaogebiji.com/bulletin"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["WenryXu"],
	handler,
	url: "niaogebiji.com/"
};
async function handler() {
	const baseUrl = "https://www.niaogebiji.com";
	const { data: response } = await got_default(`${baseUrl}/pc/index/getMoreArticle`);
	if (response.return_code !== "200") throw new Error(response.return_msg);
	const postList = response.return_data.map((item) => ({
		title: item.title,
		description: item.summary,
		author: item.author,
		pubDate: parseDate(item.published_at, "X"),
		updated: parseDate(item.updated_at, "X"),
		category: [item.catname, ...item.tag_list],
		link: new URL(item.link, baseUrl).href
	}));
	return {
		title: "鸟哥笔记",
		link: baseUrl,
		item: await Promise.all(postList.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: response } = await got_default(item.link);
			item.description = load(response)(".pc_content").html();
			return item;
		})))
	};
}
//#endregion
export { route };
