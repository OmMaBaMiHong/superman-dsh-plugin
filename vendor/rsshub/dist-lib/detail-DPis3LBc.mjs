import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { i as getUrlType, n as decodeCipherText, r as ensureDomain, t as composeMagnetUrl } from "./utils-CyCATJ2_.mjs";
import { load } from "cheerio";
//#region lib/routes/domp4/detail.ts
function getDomList($, detailUrl) {
	return $(".down-list li").toArray().map((item) => {
		item = $(item);
		const title = item.find("a").attr("title");
		const downurl = item.find("a").attr("href");
		const urlType = getUrlType(downurl);
		return {
			enclosure_url: urlType === "magnet" ? composeMagnetUrl(downurl) : downurl,
			enclosure_length: "",
			enclosure_type: "application/x-bittorrent",
			title,
			link: detailUrl,
			guid: `${title}-${urlType}`
		};
	});
}
function getItemList($, detailUrl, second) {
	const encoded = $(".article script[type]").text().match(/return p\}\('(.*)',(\d+),(\d+),'(.*)'.split\(/);
	if (!encoded) return getDomList($, detailUrl);
	const data = JSON.parse(decodeCipherText(encoded[1], encoded[2], encoded[3], encoded[4].split("|"), 0, {}).match(/var down_urls=\\'(.*)\\'/)[1].replaceAll(String.raw`\\"`, "\"").replaceAll(/\\{3}/g, ""));
	const { downurls } = second && data.Data.length > 1 ? data.Data[1] : data.Data[0];
	return downurls.map((item) => {
		const [title, downurl] = item.split("$");
		const urlType = getUrlType(downurl);
		return {
			enclosure_url: urlType === "magnet" ? composeMagnetUrl(downurl) : downurl,
			enclosure_length: "",
			enclosure_type: "application/x-bittorrent",
			title,
			link: detailUrl,
			guid: `${title}-${urlType}`
		};
	});
}
function getMetaInfo($) {
	return {
		title: $(".article-header .text p").first().find("span").text(),
		cover: $(".article-header .pic img").attr("src"),
		description: $(".article-related.info p").text()
	};
}
const route = {
	path: "/detail/:id",
	categories: ["multimedia"],
	example: "/domp4/detail/LBTANI22222I",
	parameters: { id: "从剧集详情页 URL 处获取，如：`https://www.xlmp4.com/html/LBTANI22222I.html`，取 `.html` 前面部分" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: true,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.xlmp4.com/detail/:id"] }],
	name: "剧集订阅",
	maintainers: ["savokiss", "pseudoyu"],
	handler,
	description: `::: tip
由于大部分详情页是 \`/html/xxx.html\`，还有部分是 \`/detail/123.html\`，所以此处做了兼容，id 取 \`xxx\` 或者 \`123\` 都可以。

新增 \`second\` 参数，用于选择下载地址二（地址二不可用或者不填都默认地址一），用法: \`/domp4/detail/LBTANI22222I?second=1\`。

域名频繁更换，目前使用 [www.xlmp4.com](http://www.xlmp4.com)
:::`
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const { domain, second } = ctx.req.query();
	let pureId = id;
	let detailType = "html";
	if (id.endsWith(".html")) pureId = id.replace(".html", "");
	if (/^\d+$/.test(pureId)) detailType = "detail";
	const detailUrl = `${ensureDomain(ctx, domain)}/${detailType}/${pureId}.html`;
	const $ = load(await rofetch(detailUrl));
	const list = getItemList($, detailUrl, second);
	const meta = getMetaInfo($);
	return {
		link: detailUrl,
		title: meta.title || "domp4电影 - 详情",
		image: meta.cover,
		description: meta.description,
		item: list
	};
}
//#endregion
export { route as n, getItemList as t };
