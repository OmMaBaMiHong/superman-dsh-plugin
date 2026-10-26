import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as getEntryDetails, t as extractNextData } from "./utils-v7dZ8LD4.mjs";
//#region lib/routes/hupu/types.ts
/**
* 用于区分不同数据项类型的类型守卫
*/
function isHomePostItem(item) {
	return "url" in item && "isNews" in item;
}
//#endregion
//#region lib/routes/hupu/index.ts
const categories = {
	nba: {
		title: "NBA",
		data: "newsData"
	},
	cba: {
		title: "CBA",
		data: "newsData"
	},
	soccer: {
		title: "足球",
		data: "news"
	},
	"": {
		title: "首页",
		data: "res"
	}
};
const route = {
	path: ["/dept/:category?", "/:category?"],
	name: "手机虎扑网",
	url: "m.hupu.com",
	maintainers: ["nczitzk", "hyoban"],
	example: "/hupu/nba",
	parameters: { category: {
		description: "分类，可选值：nba、cba、soccer，默认为空（首页）",
		default: "",
		options: Object.entries(categories).map(([key, value]) => ({
			label: value.title,
			value: key
		}))
	} },
	description: `::: tip
电竞分类参见 [游戏热帖](https://bbs.hupu.com/all-gg) 的对应路由 [\`/hupu/all/all-gg\`](https://rsshub.app/hupu/all/all-gg)。
:::`,
	categories: ["bbs"],
	radar: [{
		source: ["m.hupu.com/:category", "m.hupu.com/"],
		target: "/:category"
	}],
	handler: async (ctx) => {
		const c = ctx.req.param("category") || "";
		if (!Object.hasOwn(categories, c)) throw new Error("Invalid category. Valid options are: " + Object.keys(categories).filter(Boolean).join(", "));
		const category = c;
		const currentUrl = `https://m.hupu.com/${category}`;
		const { pageProps } = extractNextData((await got_default({
			method: "get",
			url: currentUrl
		})).data, currentUrl).props;
		const dataKey = categories[category].data;
		if (!Object.hasOwn(pageProps, dataKey)) throw new Error(`Expected '${dataKey}' property not found in pageProps for category: ${category || "home"}`);
		let items = (() => {
			const data = pageProps[dataKey];
			return Array.isArray(data) ? data : [];
		})().map((item) => isHomePostItem(item) ? {
			title: item.title,
			link: item.url.replace(/bbs\.hupu.com/, "m.hupu.com/bbs"),
			guid: item.tid,
			category: item.label ? [item.label] : void 0
		} : {
			title: item.title,
			pubDate: timezone(parseDate(item.publishTime), 8),
			link: item.link.replace(/bbs\.hupu.com/, "m.hupu.com/bbs"),
			guid: item.tid
		});
		items = await Promise.all(items.filter((item) => item.link && !/subject/.test(item.link)).map((item) => getEntryDetails(item)));
		return {
			title: `虎扑 - ${categories[category].title}`,
			link: currentUrl,
			item: items
		};
	}
};
//#endregion
export { route };
