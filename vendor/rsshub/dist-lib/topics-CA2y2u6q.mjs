import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/sspai/topics.ts
const route = {
	path: "/topics",
	categories: ["new-media"],
	example: "/sspai/topics",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["sspai.com/topics"] }],
	name: "专题",
	maintainers: ["SunShinenny"],
	handler,
	url: "sspai.com/topics",
	description: "此为专题广场更新提示 => 集合型而非单篇文章。与下方 \"专题内文章更新\" 存在明显区别！"
};
async function handler() {
	const data = (await got_default({
		method: "get",
		url: "https://sspai.com/api/v1/topics?offset=0&limit=20&include_total=false"
	})).data.list;
	return {
		title: "少数派专题广场更新推送",
		link: "https://sspai.com/topics",
		description: "仅仅推送新的专题(集合型而非具体文章) ",
		item: await Promise.all(data.map((item) => {
			const link = `https://sspai.com/topic/${item.id}`;
			let description = "";
			const key = `sspai:topics:${item.id}`;
			return cache_default.tryGet(key, () => {
				description = `<br><img src="https://cdnfile.sspai.com/${item.banner}" alt="Article Cover Image" style="display: block; margin: 0 auto;"/>${item.intro}<br>如有兴趣,请复制链接订阅 <br> <h3>https://rsshub.app/sspai/topic/${item.id}</h3>`;
				return {
					title: item.title.trim(),
					description,
					link,
					pubDate: parseDate(item.released_at * 1e3),
					author: item.author.nickname
				};
			});
		}))
	};
}
//#endregion
export { route };
