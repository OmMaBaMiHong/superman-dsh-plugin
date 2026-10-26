import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/chaping/banner.ts
const route = {
	path: "/banner",
	categories: ["new-media"],
	example: "/chaping/banner",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["chaping.cn/"] }],
	name: "图片墙",
	maintainers: ["nczitzk"],
	handler,
	url: "chaping.cn/"
};
async function handler() {
	const rootUrl = "https://chaping.cn/";
	const response = await got_default({
		method: "get",
		url: rootUrl
	});
	const bannerList = JSON.parse(response.data.match(/"bannerList":(.*?),"menu":/)[1]).map((item) => ({
		title: item.news_title,
		link: `https://chaping.cn/news/${item.news_id}`
	}));
	return {
		title: "差评 - 首页图片墙",
		link: rootUrl,
		item: await Promise.all(bannerList.map((item) => cache_default.tryGet(item.link, async () => {
			const detailResponse = await got_default({
				method: "get",
				url: item.link
			});
			const content = JSON.parse(detailResponse.data.match(/"current":(.*?),"optionsList":/)[1]);
			item.description = content.content;
			item.author = content.article_author.name;
			item.pubDate = parseDate(content.time_publish_timestamp * 1e3);
			return item;
		})))
	};
}
//#endregion
export { route };
