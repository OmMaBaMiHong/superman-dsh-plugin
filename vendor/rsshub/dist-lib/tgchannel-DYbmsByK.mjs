import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as finishArticleItem } from "./wechat-mp-D2I-Y5FJ.mjs";
import { load } from "cheerio";
//#region lib/routes/wechat/tgchannel.ts
const route = {
	path: "/tgchannel/:id/:mpName?/:searchQueryType?",
	categories: ["new-media"],
	example: "/wechat/tgchannel/lifeweek",
	parameters: {
		id: "公众号绑定频道 id",
		mpName: "欲筛选的公众号全名（URL-encoded，精确匹配），在频道订阅了多个公众号时可选用",
		searchQueryType: "搜索查询类型，见下表"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "公众号（Telegram 频道来源）",
	maintainers: ["LogicJake", "Rongronggg9"],
	handler,
	description: `| 搜索查询类型 | 将使用的搜索关键字 |            适用于           |
| :----------: | :----------------: | :-------------------------: |
|      \`0\`     |     (禁用搜索)     |       所有情况 (默认)       |
|      \`1\`     |     公众号全名     | 未启用 efb-patch-middleware |
|      \`2\`     |     #公众号全名    | 已启用 efb-patch-middleware |

::: tip
启用搜索有助于在订阅了过多公众号的频道里有效筛选，不易因为大量公众号同时推送导致一些公众号消息被遗漏，但必须正确选择搜索查询类型，否则会搜索失败。
:::

::: warning
该方法需要通过 efb 进行频道绑定，具体操作见 <https://github.com/DIYgod/RSSHub/issues/2172>
:::`
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const mpName = ctx.req.param("mpName") ?? "";
	let searchQueryType = ctx.req.param("searchQueryType") ?? "0";
	if (searchQueryType !== "0" && searchQueryType !== "1" && searchQueryType !== "2") searchQueryType = "0";
	searchQueryType = +searchQueryType;
	const channelUrl = `https://t.me/s/${id}`;
	const searchQuery = mpName && searchQueryType ? searchQueryType === 2 ? `?q=%23${mpName}` : `?q=${mpName}` : "";
	const { data } = await got_default.get(`${channelUrl}${searchQuery}`);
	const $ = load(data);
	const list = $(".tgme_widget_message_wrap").slice(-20);
	const out = await Promise.all(list.toArray().map(async (item) => {
		item = $(item);
		if (searchQuery) {
			const highlightMarks = item.find("mark.highlight").toArray();
			if (highlightMarks) {
				for (let mark of highlightMarks) {
					mark = $(mark);
					const markInnerHtml = mark.html();
					mark.replaceWith(markInnerHtml);
				}
				item = $(item.html());
			}
		}
		let author = "";
		let titleElemIs3thA = false;
		const brNode = item.find(".tgme_widget_message_text > br:nth-of-type(1)").get(0);
		const authorNode = brNode && brNode.prev;
		const authorNodePrev = authorNode && authorNode.prev;
		if (authorNode && authorNode.type === "text") {
			if (authorNodePrev && authorNodePrev.type === "tag" && authorNodePrev.name === "a" && authorNodePrev.attribs.href && authorNodePrev.attribs.href.startsWith("?q=%23")) {
				titleElemIs3thA = true;
				author += $(authorNodePrev).text();
			}
			const spaceIndex = authorNode.data.indexOf(" ");
			const colonIndex = authorNode.data.indexOf(":");
			if (authorNode.data.length > 1 && colonIndex !== -1 && (spaceIndex !== -1 || titleElemIs3thA)) {
				const sliceStart = titleElemIs3thA ? 0 : spaceIndex + 1;
				author += authorNode.data.slice(sliceStart, colonIndex);
			}
			if (author.startsWith("#")) author = author.slice(1);
		}
		const titleElemNth = titleElemIs3thA ? 3 : 2;
		const titleElem = item.find(`.tgme_widget_message_text > a:nth-of-type(${titleElemNth})`);
		if (titleElem.length === 0) return;
		let title = titleElem.text();
		const link = titleElem.attr("href");
		if (mpName && author !== mpName) return;
		if (!mpName && author) title = author + ": " + title;
		const pubDate = new Date(item.find(".tgme_widget_message_date time").attr("datetime")).toUTCString();
		const single = {
			title,
			pubDate,
			link
		};
		if (link !== void 0) try {
			return await finishArticleItem(single);
		} catch {
			single.description = item.find(".tgme_widget_message_text").html();
		}
		return single;
	}));
	out.reverse();
	return {
		title: mpName || $(".tgme_channel_info_header_title").text(),
		link: `https://t.me/s/${id}`,
		item: out.filter(Boolean),
		allowEmpty: !!mpName
	};
}
//#endregion
export { route };
