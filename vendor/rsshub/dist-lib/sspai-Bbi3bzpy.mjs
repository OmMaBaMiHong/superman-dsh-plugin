import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/sspai/index.ts
const route = {
	path: "/index",
	categories: ["new-media"],
	view: 0,
	example: "/sspai/index",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["sspai.com/index"] }],
	name: "首页",
	maintainers: ["HenryQW", "cscnk52"],
	handler,
	url: "sspai.com/index"
};
async function handler() {
	const resp = await got_default({
		method: "get",
		url: "https://sspai.com/api/v1/article/index/page/get?limit=10&offset=0&created_at=0"
	});
	return {
		title: "少数派",
		link: "https://sspai.com",
		description: "少数派首页",
		item: await Promise.all(resp.data.data.map((item) => {
			const link = `https://sspai.com/api/v1/${item.slug ? `member/article/single/info/get?slug=${item.slug}` : `article/info/get?id=${item.id}`}&view=second&support_webp=true`;
			let description = "";
			const key = `sspai: ${item.id}`;
			return cache_default.tryGet(key, async () => {
				const articleData = (await got_default({
					method: "get",
					url: link
				})).data.data;
				const banner = articleData.promote_image;
				if (banner) description = `<img src="${banner}" alt="Article Cover Image" style="display: block; margin: 0 auto;"><br>`;
				if (articleData.body_extends) description += articleData.body_extends.map((bodyExtendsItem) => `<h2>${bodyExtendsItem.title}</h2>${bodyExtendsItem.body}`).join("");
				description += articleData.body;
				return {
					title: item.title.trim(),
					description,
					link: `https://sspai.com/post/${item.id}`,
					pubDate: parseDate(item.released_time * 1e3),
					author: item.author.nickname
				};
			});
		}))
	};
}
//#endregion
export { route };
