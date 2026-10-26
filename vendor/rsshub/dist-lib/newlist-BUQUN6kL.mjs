import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ncpssd/newlist.ts
const route = {
	path: "/newlist",
	categories: ["study"],
	example: "/ncpssd/newlist",
	radar: [{ source: ["ncpssd.cn/", "ncpssd.cn/newlist"] }],
	name: "最新文献",
	maintainers: ["LyleLee"],
	handler,
	url: "ncpssd.cn/"
};
async function handler() {
	const baseUrl = "https://www.ncpssd.cn";
	const data = (await got_default({
		method: "get",
		url: "https://www.ncpssd.cn/newlist?type=0"
	})).data;
	const $ = load(data);
	const list = $(".news-list > li").toArray().map((p) => {
		const title = $(p).find("a").text().replaceAll(/(\r\n|\n|\r)/g, "").trim();
		const articleUrl = baseUrl + $(p).find("a").attr("onclick")?.match(/\('(.*?)'\)/)?.[1];
		const parseUrl = new URL(articleUrl);
		return {
			title,
			link: articleUrl,
			lngid: parseUrl.searchParams.get("id"),
			type: parseUrl.searchParams.get("typename"),
			pageType: parseUrl.searchParams.get("nav")
		};
	});
	return {
		title: "国家哲学社会科学文献中心",
		link: "https://www.ncpssd.cn/newlist?type=0",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const url = "https://www.ncpssd.cn/articleinfoHandler/getjournalarticletable";
			const headers = {
				Accept: "application/json, text/javascript, */*; q=0.01",
				"Content-Type": "application/json; charset=UTF-8"
			};
			const requestBody = {
				lngid: item.lngid,
				type: item.type,
				pageType: item.pageType
			};
			const response = await got_default.post(url, {
				headers,
				json: requestBody,
				responseType: "json"
			});
			return {
				title: item.title,
				link: item.link,
				author: response.data.data.showwriter,
				description: response.data.data.remarkc,
				pubDate: parseDate(response.data.data.publishDateTime)
			};
		})))
	};
}
//#endregion
export { route };
