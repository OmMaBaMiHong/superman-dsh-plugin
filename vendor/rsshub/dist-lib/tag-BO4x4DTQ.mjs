import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-B8jMr_Kb.mjs";
import { load } from "cheerio";
//#region lib/routes/pingwest/tag.ts
const route = {
	path: "/tag/:tag/:type/:option?",
	categories: ["new-media"],
	example: "/pingwest/tag/ChinaJoy/1",
	parameters: {
		tag: "话题名或话题id, 可从话题页url中得到",
		type: "内容类型",
		option: "参数, 默认无"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "话题动态",
	maintainers: ["sanmmm"],
	handler,
	description: `内容类型

| 最新 | 热门 |
| ---- | ---- |
| 1    | 2    |

参数

- \`fulltext\`，全文输出，例如：\`/pingwest/tag/ChinaJoy/1/fulltext\`

::: tip
该路由一次最多显示 30 条文章
:::`
};
async function handler(ctx) {
	const { tag, type, option } = ctx.req.param();
	const needFullText = option === "fulltext";
	const baseUrl = "https://www.pingwest.com";
	const tagUrl = `${baseUrl}/tag/${tag}`;
	const { tagId, tagName } = await cache_default.tryGet(`pingwest:tag:${tag}`, async () => {
		const $ = load((await got_default(tagUrl, { headers: { Referer: baseUrl } })).data);
		return {
			tagId: $(".tag-detail").attr("data-id"),
			tagName: $(".tag-detail .info .title").text()
		};
	});
	const $ = load((await got_default(`${baseUrl}/api/tag_article_list`, {
		searchParams: {
			id: tagId,
			type: type - 1
		},
		headers: { Referer: baseUrl }
	})).data.data.list);
	const items = await utils_default.articleListParser($, needFullText, cache_default);
	return {
		title: `品玩 - ${tagName}`,
		description: `品玩 - ${tagName}`,
		link: tagUrl,
		item: items
	};
}
//#endregion
export { route };
