import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import CryptoJS from "crypto-js";
//#region lib/routes/ouc/hqsz.ts
const route = {
	path: "/hqsz",
	categories: ["university"],
	example: "/ouc/hqsz",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["hqsz.ouc.edu.cn/news.html"] }],
	name: "后勤公告通知",
	maintainers: ["ladeng07"],
	handler,
	url: "hqsz.ouc.edu.cn/news.html?typeId=02"
};
function Decrypt(word, keyStr = "1974051005060708", ivStr = "1974051005060708") {
	const key = CryptoJS.enc.Utf8.parse(keyStr);
	const iv = CryptoJS.enc.Utf8.parse(ivStr);
	const base64 = CryptoJS.enc.Base64.parse(word);
	const src = CryptoJS.enc.Base64.stringify(base64);
	return CryptoJS.AES.decrypt(src, key, {
		iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7
	}).toString(CryptoJS.enc.Utf8);
}
async function handler() {
	const link = "http://hqsz.ouc.edu.cn/api/website/frontendWebsite/lists";
	const { data } = await got_default.post(link, { form: {
		schoolCode: "10423",
		website: "89e97da117d547128283cf9d12891fa9",
		code: "0202",
		pageSize: "10",
		pageIndex: "1"
	} });
	const list = JSON.parse(Decrypt(data)).data.list.map((item) => ({
		title: item.title,
		id: item.id,
		author: item.author,
		link: "http://hqsz.ouc.edu.cn/news_detail.html?id=" + item.id,
		pubDate: parseDate(item.publishTime)
	}));
	return {
		title: "中国海洋大学后勤公告通知",
		link,
		description: "中国海洋大学后勤公告通知",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const { data } = await got_default.post("http://hqsz.ouc.edu.cn/api/website/frontendWebsite/info", { form: {
				schoolCode: "10423",
				website: "89e97da117d547128283cf9d12891fa9",
				id: item.id
			} });
			item.description = Decrypt(JSON.parse(Decrypt(data)).data.content);
			delete item.id;
			return item;
		})))
	};
}
//#endregion
export { route };
