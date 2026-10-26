import { n as parseList, t as logo } from "./util-Dj1XsSB_.mjs";
//#region lib/routes/zaobao/other.ts
const baseUrl = "https://www.zaobao.com";
const route = {
	path: "/other/:type?/:section?",
	categories: ["traditional-media"],
	example: "/zaobao/other/lifestyle/health",
	parameters: {
		type: "https://www.zaobao.com/**lifestyle**/health 中的 **lifestyle**",
		section: "https://www.zaobao.com/lifestyle/**health** 中的 **health**"
	},
	name: "其他栏目",
	maintainers: ["shunf4"],
	handler,
	description: "除了上面两个兼容规则之外，联合早报网站里所有页面形如 <https://www.zaobao.com/lifestyle/health> 这样的栏目都能被这个规则解析到，早报的大部分栏目都是这个样式的。你可以测试之后再订阅。"
};
async function handler(ctx) {
	const sectionLink = `/${ctx.req.param("type") ?? "realtime"}/${ctx.req.param("section") ?? "china"}`;
	const { title, resultList } = await parseList(sectionLink);
	return {
		title: `《联合早报》${title}`,
		link: baseUrl + sectionLink,
		description: "新加坡、中国、亚洲和国际的即时、评论、商业、体育、生活、科技与多媒体新闻，尽在联合早报。",
		image: logo,
		item: resultList
	};
}
//#endregion
export { route };
