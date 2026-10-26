import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import CryptoJS from "crypto-js";
//#region lib/routes/chlinlearn/daily-blog.ts
const route = {
	path: "/daily-blog",
	name: "值得一读技术博客",
	maintainers: ["huyyi"],
	categories: ["programming"],
	example: "/chlinlearn/daily-blog",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["daily-blog.chlinlearn.top/blogs/*"],
		target: "/chlinlearn/daily-blog"
	}],
	handler: async () => {
		const r = CryptoJS.lib.WordArray.random(8).toString(CryptoJS.enc.Hex);
		const n = Date.now();
		return {
			title: "值得一读技术博客",
			link: "https://daily-blog.chlinlearn.top/blogs/1",
			item: (await rofetch("https://daily-blog.chlinlearn.top/api/daily-blog/getBlogs/new?type=new&pageNum=1&pageSize=20", { headers: {
				Referer: "https://daily-blog.chlinlearn.top/blogs/1",
				"x-req-nonce": r,
				"x-req-timestamp": n,
				"x-req-key": CryptoJS.SHA256("pHVp671B0tLkW40KCwyPrb6W1GEMEGyT" + r + n).toString(CryptoJS.enc.Hex)
			} })).rows.map((item) => ({
				title: item.title,
				link: item.url,
				author: item.author,
				img: item.icon,
				pubDate: timezone(parseDate(item.publishTime), 8)
			}))
		};
	}
};
//#endregion
export { route };
