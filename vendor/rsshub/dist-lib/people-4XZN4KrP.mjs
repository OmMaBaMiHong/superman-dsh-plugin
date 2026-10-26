import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { n as rootUrl, t as processItems } from "./util-C0fjIWVZ.mjs";
import { load } from "cheerio";
//#region lib/routes/jisilu/people.ts
const actions = {
	questions: "101",
	answers: "201"
};
const handler = async (ctx) => {
	const { id, type = "questions" } = ctx.req.param();
	if (type && type !== "answers" && type !== "questions") throw new InvalidParameterError("请填入合法的类型 id，可选值为 `questions` 即 `主题` 或 `answer` 即 `回复`，默认为空，即全部");
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL(`/people/${id}`, rootUrl).href;
	const response = await rofetch(targetUrl);
	const $ = load(response);
	const language = $("html").prop("lang") ?? "zh";
	const userId = response.match(/var\sPEOPLE_USER_ID\s=\s'(\d+)';/)?.[1];
	if (!userId) throw new InvalidParameterError("请填入合法的用户 id，参见用户排名 https://www.jisilu.cn/users/");
	const apiUrl = new URL(`people/ajax/user_actions/uid-${userId}__actions-${actions[type]}__page-1`, rootUrl).href;
	const $$ = load(await rofetch(apiUrl));
	const items = await processItems($$, $$("*"), limit);
	const author = $("meta[name=\"keywords\"]").prop("content").split(/,/, 1)[0];
	const feedImage = $("div.aw-logo img").prop("src");
	return {
		title: `${$("title").text()}${type ? ` - ${$(`div#${type} h3`).text()}` : ""}`,
		description: $("meta[name=\"description\"]").prop("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: feedImage,
		author,
		language,
		id: targetUrl
	};
};
const route = {
	path: "/people/:id/:type?",
	name: "用户",
	url: "www.jisilu.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/jisilu/people/天书",
	parameters: {
		id: "用户 id，可在对应用户页 URL 中找到",
		type: "类型，可选值为 `questions` 即 `主题` 或 `answer` 即 `回复`，默认为 `questions` 即 `主题`"
	},
	description: `::: tip
若订阅 [天书的主题](https://www.jisilu.cn/people/天书)，网址为 \`https://www.jisilu.cn/people/天书\`，请截取 \`https://www.jisilu.cn/people/\` 到末尾的部分 \`天书\` 作为 \`id\` 参数填入，此时目标路由为 [\`/jisilu/people/天书\`](https://rsshub.app/jisilu/people/天书)。
:::

::: tip
前往 [用户排名](https://www.jisilu.cn/users/) 查看更多用户。
:::`,
	categories: ["finance"],
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
		source: ["www.jisilu.cn/people/:id"],
		target: "/people/:id"
	}],
	view: 0
};
//#endregion
export { handler, route };
