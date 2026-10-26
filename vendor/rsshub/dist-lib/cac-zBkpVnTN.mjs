import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/cac/index.ts
const route = {
	path: "/:path{.+}",
	name: "通用",
	example: "/gov/cac/wxzw/xxh",
	parameters: { path: "路径，比如xxh表示信息化" },
	maintainers: ["drgnchan"],
	handler,
	description: `::: tip

路径填写对应页面 URL 中间部分。例如：

首页 > 网信政务 > 网信发布： <https://www.cac.gov.cn/wxzw/wxfb/A093702index_1.htm>
此时，path 参数为：/wxzw/wxfb

:::`
};
async function handler(ctx) {
	const path = `/${ctx.req.param("path")}`;
	const host = "https://www.cac.gov.cn";
	const homepage = `${host}/index.htm`;
	const completeUrl = (await cache_default.tryGet("gov:cac:pathList", async () => {
		const { data: homepageResponse } = await got_default(homepage);
		const $ = load(homepageResponse);
		return $("a").toArray().map((item) => {
			const href = $(item).attr("href");
			if (href && /(?:http:)?\/\/www\.cac\.gov\.cn.*?\/A.*?\.htm/.test(href)) {
				const matchArray = href.match(/(?:http:)?\/\/www\.cac\.gov\.cn(.*?)\/(A.*?\.htm)/);
				if (matchArray && matchArray.length > 2) {
					const path = matchArray[1];
					const htmlName = matchArray[2];
					return {
						path,
						completeUrl: `${host}${path}/${htmlName}`
					};
				}
			}
			return null;
		}).filter(Boolean);
	}, config.cache.routeExpire, false)).find((item) => item && item.path === path)?.completeUrl;
	const { data: channelResponse } = await got_default(completeUrl);
	const $1 = load(channelResponse);
	const items = $1("div#loadingInfoPage li").toArray().map((item) => {
		const c = $1(item);
		const a = c.find("a");
		const articleHref = a.attr("href");
		const title = a.text();
		return {
			link: articleHref,
			pubDate: timezone(parseDate(c.find(".times").text())),
			title,
			description: title
		};
	});
	return {
		title: $1("head title").text(),
		link: completeUrl,
		item: items
	};
}
//#endregion
export { route };
