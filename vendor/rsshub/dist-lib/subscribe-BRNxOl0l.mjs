import { t as config } from "./config-B5Cf_tHS.mjs";
import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/manhuagui/subscribe.tsx
const web_url = "https://www.manhuagui.com/user/book/shelf/1";
const route = {
	path: "/subscribe",
	categories: ["anime"],
	example: "/manhuagui/subscribe",
	parameters: {},
	features: {
		requireConfig: [{
			name: "MHGUI_COOKIE",
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["www.mhgui.com/user/book/shelf"] }],
	name: "漫画个人订阅",
	maintainers: ["shininome"],
	handler,
	url: "www.mhgui.com/user/book/shelf",
	description: `::: tip
个人订阅需要自建
环境变量需要添加 MHGUI\\_COOKIE
:::`
};
async function handler() {
	if (!config.manhuagui || !config.manhuagui.cookie) throw new ConfigNotFoundError("manhuagui RSS is disabled due to the lack of <a href=\"https://docs.rsshub.app/deploy/config#route-specific-configurations\">relevant config</a>");
	const cookie = config.manhuagui.cookie;
	const $ = load((await got_default({
		method: "get",
		url: web_url,
		headers: { Cookie: cookie }
	})).data);
	const user_name = $(".avatar-box").find("h3").text();
	return {
		title: `${user_name} 的 漫画订阅`,
		link: web_url,
		description: `${user_name} 的 漫画订阅`,
		item: $(".dy_content_li").toArray().map((item) => {
			const img_src = $(item).find("img").attr("src");
			const manga_title = $(item).find(".co_1.c_space").first().text();
			return {
				title: $(item).find("img").attr("alt"),
				link: $(item).find(".co_1.c_space").first().children().attr("href"),
				description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("h1", { children: manga_title }), /* @__PURE__ */ jsx("img", { src: img_src })] })),
				pubDate: parseRelativeDate($(item).find(".co_1.c_space").first().next().text())
			};
		})
	};
}
//#endregion
export { route };
