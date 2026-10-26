import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/ifanr/index.ts
const route = {
	path: "/index",
	categories: ["new-media"],
	view: 0,
	example: "/ifanr/index",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.ifanr.com/index"] }],
	name: "首页",
	maintainers: ["donghongfei"],
	handler,
	url: "www.ifanr.com/index"
};
async function handler() {
	const resp = await got_default({
		method: "get",
		url: "https://sso.ifanr.com/api/v5/wp/web-feed/?limit=20&offset=0"
	});
	return {
		title: "爱范儿",
		link: "https://www.ifanr.com",
		description: "爱范儿首页",
		item: await Promise.all(resp.data.objects.map((item) => {
			const link = `https://sso.ifanr.com/api/v5/wp/article/?post_id=${item.post_id}`;
			let description = "";
			const key = `ifanr:${item.id}`;
			return cache_default.tryGet(key, async () => {
				const articleData = (await got_default({
					method: "get",
					url: link
				})).data.objects[0];
				const banner = articleData.post_cover_image;
				if (banner) description = `<img src="${banner}" alt="Article Cover Image" style="display: block; margin: 0 auto;"><br>`;
				description += articleData.post_content;
				return {
					title: item.post_title.trim(),
					description,
					link: item.post_url,
					pubDate: parseDate(item.created_at * 1e3),
					author: item.created_by.name
				};
			});
		}))
	};
}
//#endregion
export { route };
