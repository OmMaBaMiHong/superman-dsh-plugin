import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { r as getUserCatalogMainContentQuery, t as parseArticle } from "./parse-article-0Pn28AQi.mjs";
//#region lib/routes/medium/list.ts
const route = {
	path: "/list/:user/:catalogId",
	categories: ["blog"],
	example: "/medium/list/imsingee/f2d8d48096a9",
	parameters: {
		user: "Username",
		catalogId: "List ID"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "List",
	maintainers: ["ImSingee"],
	handler,
	description: `The List ID is the last part of the URL after \`-\`, for example, the username in <https://medium.com/@imsingee/list/collection-7e67004f23f9> is \`imsingee\`, and the ID is \`7e67004f23f9\`.

::: warning
To access private lists, only self-hosting is supported.
:::`
};
async function handler(ctx) {
	const user = ctx.req.param("user");
	const catalogId = ctx.req.param("catalogId");
	const cookie = config.medium.cookies[user];
	const catalog = await getUserCatalogMainContentQuery(user, catalogId, cookie);
	ctx.set("json", catalog);
	if (catalog && catalog.__typename === "Forbidden") throw new ConfigNotFoundError(`无权访问 id 为 ${catalogId} 的 List（可能是未设置 Cookie 或 Cookie 已过期）`);
	if (!catalog || !catalog.itemsConnection) throw new InvalidParameterError(`id 为 ${catalogId} 的 List 不存在`);
	const name = catalog.name;
	const urls = catalog.itemsConnection.items.map((item) => item.entity.mediumUrl);
	const parsedArticles = await Promise.all(urls.map((url) => parseArticle(ctx, url)));
	return {
		title: `List: ${name}`,
		link: `https://medium.com/@${user}/list/${catalogId}`,
		item: parsedArticles
	};
}
//#endregion
export { route };
