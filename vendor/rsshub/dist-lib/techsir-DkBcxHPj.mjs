import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/techsir/index.ts
const route = {
	path: "/",
	categories: ["new-media"],
	example: "/techsir",
	url: "www.techsir.com",
	name: "最新资讯",
	maintainers: ["p3psi-boo"],
	handler
};
async function handler() {
	const baseUrl = "https://techsir.com";
	const $ = load((await got_default({
		method: "get",
		url: baseUrl
	})).data);
	const list = $("#kt_wrapper > div.main-content-area > div.container.container-fluid > div:nth-child(1) > div.col-xs-12.col-sm-6.col-md-8.post-listing > div.row.flex-row-fluid > div:nth-child(2) > div > div > div.card-body.pt-2 > div.d-flex").toArray().map((item) => {
		const $item = $(item);
		const path = $item.find("a").attr("href");
		const link = `${baseUrl}${path}`;
		return {
			title: $item.find("a").text(),
			link
		};
	});
	return {
		title: "TechSir - 最新资讯",
		link: baseUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			item.description = $(".kg-card-markdown").html();
			item.pubDate = parseDate($("time.time").text());
			item.author = $("a.author").text();
			return item;
		})))
	};
}
//#endregion
export { route };
