import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/52hrtt/symposium.ts
const route = {
	path: "/symposium/:id?/:classId?",
	categories: ["new-media"],
	example: "/52hrtt/symposium/F1626082387819",
	parameters: {
		id: "专题 id",
		classId: "子分类 id"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["52hrtt.com/global/n/w/symposium/:id"],
		target: "/symposium/:id"
	}],
	name: "专题",
	maintainers: ["nczitzk"],
	handler,
	description: `专题 id 和 子分类 id 皆可在浏览器地址栏中找到，下面是一个例子。

访问 “邱毅看平潭” 专题，会跳转到 \`https://www.52hrtt.com/global/n/w/symposium/F1626082387819\`。其中 \`F1626082387819\` 即为 **专题 id** 对应的地区代码。

::: tip
更多的专题可以点击 [这里](https://www.52hrtt.com/global/n/w/symposium)
:::`
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "";
	const classId = ctx.req.param("classId") ?? "";
	const rootUrl = "https://www.52hrtt.com";
	const currentUrl = `${rootUrl}/global/n/w/symposium/${id}`;
	const response = await got_default({
		method: "get",
		url: `${rootUrl}/s/webapi/global/symposium/getInfoList?symposiumId=${id}${classId ? `&symposiumclassId=${classId}` : ""}`
	});
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = response.data.data.filter((item) => item.infoTitle).map((item) => ({
		title: item.infoTitle,
		author: item.quoteFrom,
		pubDate: timezone(parseDate(item.infoStartTime), 8),
		link: `${rootUrl}/global/n/w/info/${item.infoCentreId}`
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)(".info-content").html();
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
