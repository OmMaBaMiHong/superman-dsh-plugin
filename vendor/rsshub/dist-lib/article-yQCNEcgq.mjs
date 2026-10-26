import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parseArticle } from "./utils-CkN3xr3j.mjs";
//#region lib/routes/caixin/article.ts
const route = {
	path: "/article",
	categories: ["traditional-media"],
	example: "/caixin/article",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: true,
		supportScihub: false
	},
	radar: [{ source: ["caixin.com/"] }],
	name: "首页新闻",
	maintainers: ["EsuRt"],
	handler,
	url: "caixin.com/"
};
async function handler() {
	const { data: response } = await got_default("https://mapiv5.caixin.com/m/api/getWapIndexListByPage");
	const list = response.data.list.map((item) => ({
		title: item.title,
		description: item.summary,
		author: item.author_name,
		pubDate: parseDate(item.time, "X"),
		link: item.web_url,
		pics: item.pics,
		audio: item.cms_audio_url,
		audio_image_url: item.audio_image_url
	}));
	return {
		title: "财新网 - 首页",
		link: "https://www.caixin.com",
		description: "财新网 - 首页",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, () => parseArticle(item))))
	};
}
//#endregion
export { route };
