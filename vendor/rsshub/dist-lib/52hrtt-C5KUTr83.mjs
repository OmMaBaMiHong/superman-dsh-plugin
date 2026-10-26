import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/52hrtt/index.ts
const route = {
	path: "/:area?/:type?",
	categories: ["new-media"],
	example: "/52hrtt/global",
	parameters: {
		area: "地区，默认为全球",
		type: "分类，默认为新闻"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "新闻",
	maintainers: ["nczitzk"],
	handler,
	description: `地区和分类皆可在浏览器地址栏中找到，下面是一个例子。

访问华人头条全球站的国际分类，会跳转到 \`https://www.52hrtt.com/global/n/w?infoTypeId=A1459145516533\`。其中 \`global\` 即为 **全球** 对应的地区代码，\`A1459145516533\` 即为 **国际** 对应的分类代码。`
};
async function handler(ctx) {
	const area = ctx.req.param("area") ?? "global";
	const type = ctx.req.param("type") ?? "";
	const rootUrl = "https://www.52hrtt.com";
	const currentUrl = `${rootUrl}/${area}/n/w${type ? `?infoTypeId=${type}` : ""}`;
	const response = await got_default({
		method: "get",
		url: `${rootUrl}/s/webapi/${area}/n/w${type ? `?infoTypeId=${type}` : ""}`
	});
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = response.data.data.infosMap.infoList.filter((item) => item.infoTitle).map((item) => ({
		title: item.infoTitle,
		author: item.quoteFrom,
		pubDate: timezone(parseDate(item.infoStartTime), 8),
		link: `${rootUrl}/${area}/n/w/info/${item.infoCentreId}`
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)(".info-content").html();
		return item;
	})));
	return {
		title: `${response.data.data.area.areaName} - ${$(".router-link-active").eq(0).text()} - 华人头条`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
