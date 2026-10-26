import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/cbnweek/index.ts
const route = {
	path: "/",
	radar: [{
		source: ["cbnweek.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["nczitzk"],
	handler,
	url: "cbnweek.com/"
};
async function handler() {
	const rootUrl = "https://www2021.cbnweek.com";
	const apiRootUrl = "https://api2021.cbnweek.com";
	let items = (await got_default({
		method: "get",
		url: `${apiRootUrl}/v4/first_page_infos?per=1`
	})).data.data.map((item) => {
		const post = item.data[0];
		return {
			guid: post.id,
			title: post.title,
			link: `${rootUrl}/#/article_detail/${post.id}`,
			pubDate: parseDate(post.display_time),
			author: post.authors?.map((a) => a.name).join(", "),
			category: post.topics?.map((t) => t.name)
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = (await got_default({
			method: "get",
			url: `${apiRootUrl}/v4/articles/${item.guid}`
		})).data.data.content;
		return item;
	})));
	return {
		title: "第一财经杂志",
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
