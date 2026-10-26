import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { i as rootUrl, n as language, r as processItems, t as author } from "./util-CvPOkvoe.mjs";
//#region lib/routes/ifun/n/tag.ts
const handler = async (ctx) => {
	const { name } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL(`article-list/1?tagName=${name}`, rootUrl).href;
	const apiUrl = new URL("api/articles/tagId", rootUrl).href;
	const items = processItems((await rofetch(apiUrl, { query: {
		datasrc: "tagid",
		tagname: name,
		current: 1,
		size: limit
	} })).data.records, limit);
	return {
		title: `${author} - ${name}`,
		description: name,
		link: targetUrl,
		item: items,
		allowEmpty: true,
		author,
		language
	};
};
const route = {
	path: "/n/tag/:name",
	name: "盐选故事专栏",
	url: "n.ifun.cool",
	maintainers: ["nczitzk"],
	handler,
	example: "/ifun/n/tag/zhihu",
	parameters: { name: "专栏 id，可在对应专栏页 URL 中找到" },
	description: `::: tip
若订阅 [zhihu](https://n.ifun.cool/article-list/2?tagName=zhihu)，网址为 \`https://n.ifun.cool/article-list/2?tagName=zhihu\`，请截取 \`tagName\` 的值 \`zhihu\` 作为 \`name\` 参数填入，此时目标路由为 [\`/ifun/n/tag/zhihu\`](https://rsshub.app/ifun/n/tag/zhihu)。

更多专栏请见 [盐选故事专栏](https://n.ifun.cool/tags)。
:::`,
	categories: ["new-media"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["n.ifun.cool/article-list/1"],
		target: (_, url) => {
			return `/ifun/n/tag/${new URL(url).searchParams.get("tagName")}`;
		}
	}],
	view: 0
};
//#endregion
export { handler, route };
