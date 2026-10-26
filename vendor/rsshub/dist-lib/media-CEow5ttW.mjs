import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/scut/gzic/media.ts
const route = {
	path: "/gzic/media",
	categories: ["university"],
	example: "/scut/gzic/media",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "广州国际校区 - 媒体报道",
	maintainers: ["gdzhht"],
	handler,
	description: `::: warning
由于学校网站对非大陆 IP 的访问存在限制，可能需自行部署。
:::`
};
async function handler() {
	const url = "https://www2.scut.edu.cn/gzic/30281/list.htm";
	const { data: response } = await got_default(url);
	const $ = load(response);
	const list = $(".right-nr .row .col-lg-4").toArray().map((item) => {
		item = $(item);
		const a = item.find(".thr-box a");
		const pubDate = item.find(".thr-box a span");
		return {
			title: item.find(".thr-box a p").text(),
			link: a.attr("href")?.startsWith("http") ? a.attr("href") : `https://www2.scut.edu.cn${a.attr("href")}`,
			pubDate: parseDate(pubDate.text())
		};
	});
	return {
		title: "华南理工大学广州国际校区 - 媒体报道",
		link: url,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			try {
				item.description = load(await rofetch(item.link))("div.wp_articlecontent").html();
			} catch (error) {
				if (error.response && error.response.status === 404) item.description = "";
				else throw error;
			}
			return item;
		})))
	};
}
//#endregion
export { route };
