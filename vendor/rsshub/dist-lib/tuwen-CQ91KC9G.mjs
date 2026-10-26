import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-DUZ33oTk.mjs";
//#region lib/routes/coolapk/tuwen.ts
const route = {
	path: "/tuwen/:type?",
	categories: ["social-media"],
	example: "/coolapk/tuwen",
	parameters: { type: "默认为hot" },
	features: {
		requireConfig: [{
			name: "ALLOW_USER_HOTLINK_TEMPLATE",
			optional: true,
			description: "设置为`true`并添加`image_hotlink_template`参数来代理图片"
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "图文",
	maintainers: ["xizeyoupan"],
	handler,
	description: `| 参数名称 | 编辑精选 | 最新   |
| -------- | -------- | ------ |
| type     | hot      | latest |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") || "hot";
	let feedTitle;
	const fullUrl = new URL("/v6/page/dataList", utils_default.base_url);
	if (type === "latest") {
		fullUrl.searchParams.append("url", `/feed/digestList?${new URLSearchParams("cacheExpires=300&type=12&message_status=all&is_html_article=1&filterEmptyPicture=1&filterTag=二手交易,酷安自贸区,薅羊毛小分队").toString()}`);
		fullUrl.searchParams.append("title", "新鲜图文");
		fullUrl.searchParams.append("subTitle", "");
		feedTitle = "酷安 - 新鲜图文";
	} else {
		fullUrl.searchParams.append("url", `#/feed/digestList?${new URLSearchParams("type=12&is_html_article=1&recommend=3,4").toString()}`);
		fullUrl.searchParams.append("title", "图文");
		feedTitle = "酷安图文 - 编辑精选";
	}
	fullUrl.searchParams.append("page", "1");
	const data = (await got_default(fullUrl, { headers: utils_default.getHeaders() })).data.data;
	const out = await Promise.all(data.map((item) => utils_default.parseDynamic(item)));
	return {
		title: feedTitle,
		link: "https://www.coolapk.com/",
		description: feedTitle,
		item: out
	};
}
//#endregion
export { route };
