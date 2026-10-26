import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/6v123/utils.ts
async function loadDetailPage(link) {
	const response = await got_default.get(link, { responseType: "buffer" });
	response.data = iconv.decode(response.data, "gb2312");
	const $ = load(response.data);
	return {
		title: $("title").text().replaceAll(/，免费下载，迅雷下载|，6v电影/g, ""),
		description: $("meta[name=\"description\"]").attr("content"),
		enclosure_urls: $("table td").toArray().map((e) => ({
			title: $(e).text().replace("磁力：", ""),
			magnet: $(e).find("a").attr("href")
		})).filter((item) => item.magnet?.includes("magnet"))
	};
}
async function processItems(ctx, baseURL, exclude) {
	const response = await got_default.get(baseURL, { responseType: "buffer" });
	response.data = iconv.decode(response.data, "gb2312");
	const $ = load(response.data);
	const list = $("ul.list")[0].children;
	return (await Promise.all(list.map((item) => {
		const link = $(item).find("a");
		const href = link.attr("href");
		const pubDate = timezone(parseDate($(item).find("span").text().replaceAll(/[[\]]/g, ""), "MM-DD"), 8);
		const text = link.text();
		if (href === void 0) return;
		if (exclude && exclude.some((e) => e.test(text))) return;
		const itemUrl = "https://www.hao6v.cc" + link.attr("href");
		return cache_default.tryGet(itemUrl, async () => {
			const detailInfo = await loadDetailPage(itemUrl);
			if (detailInfo.enclosure_urls.length > 1) return detailInfo.enclosure_urls.map((url) => ({
				enclosure_url: url.magnet,
				enclosure_type: "application/x-bittorrent",
				title: `${link.text()} ( ${url.title} )`,
				description: detailInfo.description,
				pubDate,
				link: itemUrl,
				guid: `${itemUrl}#${url.title}`
			}));
			return {
				enclosure_url: detailInfo.enclosure_urls.length === 0 ? "" : detailInfo.enclosure_urls[0].magnet,
				enclosure_type: "application/x-bittorrent",
				title: link.text(),
				description: detailInfo.description,
				pubDate,
				link: itemUrl
			};
		});
	}))).filter((item) => item !== void 0).flat();
}
//#endregion
export { processItems as t };
