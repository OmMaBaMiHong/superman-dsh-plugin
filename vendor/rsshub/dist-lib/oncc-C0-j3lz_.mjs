import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/oncc/index.tsx
const rootUrl = "https://hk.on.cc";
const languageMap = {
	"zh-hans": "_cn",
	"zh-hant": ""
};
const channelMap = {
	news: {
		"zh-hans": "港澳",
		"zh-hant": "港澳"
	},
	cnnews: {
		"zh-hans": "两岸",
		"zh-hant": "兩岸"
	},
	intnews: {
		"zh-hans": "国际",
		"zh-hant": "國際"
	},
	commentary: {
		"zh-hans": "评论",
		"zh-hant": "評論"
	},
	finance: {
		"zh-hans": "产经",
		"zh-hant": "產經"
	}
};
const route = {
	path: "/:language/:channel?",
	categories: ["traditional-media"],
	example: "/oncc/zh-hant/news",
	parameters: {
		language: "`zh-hans` 为简体，`zh-hant` 为繁体",
		channel: "频道，默认为港澳"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "即時新聞",
	maintainers: ["Fatpandac"],
	handler,
	description: `频道参数可以从官网的地址中获取，如：

\`https://hk.on.cc/hk/finance/index_cn.html\` 对应 \`/oncc/zh-hans/finance\`

\`https://hk.on.cc/hk/finance/index.html\` 对应 \`/oncc/zh-hant/finance\``
};
async function handler(ctx) {
	const language = ctx.req.param("language");
	const channel = ctx.req.param("channel") ?? "news";
	const newsUrl = `${rootUrl}/hk/${channel}/index${languageMap[language]}.html`;
	const $ = load((await got_default.get(newsUrl)).data);
	const list = $("#focusNews > div.focusItem[type=article]").toArray().map((item) => {
		return {
			title: $(item).find("div.focusTitle > span").text(),
			link: rootUrl + $(item).find("a:nth-child(1)").attr("href"),
			pubDate: parseDate($(item).attr("edittime"), "YYYYMMDDHHmmss")
		};
	});
	const items = await Promise.all(list.map(async (item) => {
		item.description = await cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default.get(item.link)).data);
			const imageUrl = rootUrl + $("img").eq(0).attr("src");
			const content = $("div.breakingNewsContent").html();
			return renderArticleDescription({
				imageUrl,
				content
			});
		});
		return item;
	}));
	return {
		title: `東網 - ${channelMap[channel][language]}`,
		link: newsUrl,
		item: items
	};
}
const renderArticleDescription = ({ imageUrl, content }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: imageUrl }), content ? raw(content) : null] }));
//#endregion
export { route };
