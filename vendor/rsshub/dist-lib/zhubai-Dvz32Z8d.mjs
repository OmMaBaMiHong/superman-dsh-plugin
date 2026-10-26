import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
//#region lib/routes/zhubai/index.ts
const route = {
	path: "/posts/:id",
	categories: ["blog"],
	example: "/zhubai/posts/via",
	parameters: { id: "`id` 为竹白主页 url 中的三级域名，如 via.zhubai.love 的 `id` 为 `via`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "文章",
	maintainers: ["naixy28"],
	handler,
	description: `::: tip
在路由末尾处加上 \`?limit=限制获取数目\` 来限制获取条目数量，默认值为\`20\`
:::`
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 20;
	if (!isValidHost(id)) throw new InvalidParameterError("Invalid id");
	const data = (await got_default({
		method: "get",
		url: `https://${id}.zhubai.love/api/publications/${id}/posts?publication_id_type=token&limit=${limit}`,
		headers: { Referer: `https://${id}.zhubai.love/` }
	})).data.data;
	const { name, description } = data[0].publication;
	return {
		title: name,
		link: `https://${id}.zhubai.love/`,
		description,
		item: data.map((item) => ({
			title: item.title,
			pubDate: parseDate(item.created_at),
			link: `https://${id}.zhubai.love/posts/${item.id}`,
			author: name
		}))
	};
}
//#endregion
export { route };
