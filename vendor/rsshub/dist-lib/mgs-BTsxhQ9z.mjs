import { t as gdgov } from "./general-3YSJGDfl.mjs";
//#region lib/routes/gov/mgs/mgs.ts
const route = {
	path: "/:path{.+}",
	name: "通用",
	example: "/gov/mgs/www/zwgk/zcjd",
	parameters: { path: "路径，只填写 `www` 默认为 政务公开 > 政策解读" },
	maintainers: ["ShuiHuo"],
	handler,
	description: `::: tip

路径处填写对应页面 URL 中最前面的部分和域名后的字段。下面是一个例子。

若订阅 [政务公开 > 政策解读](http://www.mgs.gov.cn/zwgk/zcjd/) 则将对应页面 URL <http://www.mgs.gov.cn/zwgk/zcjd/> 中 \`http://www.mgs.gov.cn/\` 的字段 \`www\` 和 \`zwgk/zcjd/\` 作为路径填入。此时路由为 [\`/gov/mgs/www/zwgk/zcjd/\`](https://rsshub.app/gov/mgs/www/zwgk/zcjd/)

:::`
};
async function handler(ctx) {
	return await gdgov({
		defaultPath: "zwgk/zcjd/",
		list_element: ".list_con li a",
		list_include: "site",
		title_element: ".title",
		title_match: "(.*)",
		description_element: ".artile_con",
		author_element: void 0,
		author_match: void 0,
		authorisme: "广东茂名滨海新区政务网",
		pubDate_element: ".note > span:nth-child(1)",
		pubDate_match: "时间：(.*)",
		pubDate_format: void 0
	}, ctx);
}
//#endregion
export { route };
