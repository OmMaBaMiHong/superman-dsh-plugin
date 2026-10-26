import { t as got_default } from "./got-Dnzt41dd.mjs";
import { i as parseList, n as host, r as parseItems, t as acw_sc__v2 } from "./utils-BNdZnnDL.mjs";
//#region lib/routes/segmentfault/blogs.ts
const route = {
	path: "/blogs/:tag",
	categories: ["programming"],
	example: "/segmentfault/blogs/go",
	parameters: { tag: "标签名称，在 [标签](https://segmentfault.com/tags) 中可以找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["segmentfault.com/t/:tag/blogs"] }],
	name: "博客",
	maintainers: ["shiluanzzz"],
	handler
};
async function handler(ctx) {
	const tag = ctx.req.param("tag");
	const data = (await got_default(`${host}/gateway/tag/${tag}/articles?loadMoreType=pagination&initData=true&page=1&sort=newest&pageSize=30`)).data.rows;
	const list = parseList(data);
	const acwScV2Cookie = await acw_sc__v2(list[0].link);
	const items = await Promise.all(list.map((item) => parseItems(acwScV2Cookie, item)));
	return {
		title: `segmentfault-Blogs-${tag}`,
		link: `${host}/t/${tag}/blogs`,
		item: items
	};
}
//#endregion
export { route };
