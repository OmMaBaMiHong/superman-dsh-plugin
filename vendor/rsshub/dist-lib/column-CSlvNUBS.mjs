import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as renderDescription } from "./description-BH7rFpWG.mjs";
import { load } from "cheerio";
//#region lib/routes/oschina/column.ts
const handler = async (ctx) => {
	const { id } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "10");
	const baseUrl = "https://www.oschina.net";
	const userHostRegex = String.raw`https://my\.oschina\.net`;
	const targetUrl = new URL(`news/column?columnId=${id}`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh-CN";
	let items = $("div.news-item").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const title = $el.find("div.title").text();
		const description = renderDescription({ intro: $el.find("div.description p.line-clamp").text() });
		const pubDateStr = $el.find("inddiv.item").contents().last().text().trim();
		const linkUrl = $el.attr("data-url");
		const authors = $el.find("inddiv.item a").toArray().map((authorEl) => {
			const $authorEl = $(authorEl);
			return {
				name: $authorEl.text(),
				url: $authorEl.attr("href")
			};
		});
		const image = $el.find("img").attr("src");
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : void 0,
			link: linkUrl,
			author: authors,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: upDatedStr ? timezone(parseDate(upDatedStr), 8) : void 0,
			language
		};
	});
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			$$(".ad-wrap").remove();
			const title = $$("h1.article-box__title").text();
			const description = renderDescription({ description: $$("div.content").html() });
			const pubDateEl = $$("div.article-box__meta div.item-list div.item").toArray().find((i) => /\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/.test($$(i).text()));
			const pubDateStr = pubDateEl ? $$(pubDateEl).text() : void 0;
			const linkUrl = $$("val[data-name=\"shareUrl\"]").attr("data-value");
			const categoryEls = [
				...$$("div.breadcrumb-box a.item").toArray().slice(0, -1),
				...$$("div.article-box__meta div.item-list div.item span.label").toArray(),
				...$$("div.tags-box a.tag-item").toArray()
			];
			const categories = [...new Set(categoryEls.map((el) => $$(el).text()).filter(Boolean))];
			const authors = $$("div.article-box__meta div.item-list div.item a").toArray().filter((i) => $$(i).attr("href") ? new RegExp(String.raw`^${userHostRegex}/u/\d+$`).test($$(i).attr("href")) : false).map((authorEl) => {
				const $authorEl = $$(authorEl);
				return {
					name: $authorEl.text(),
					url: $authorEl.attr("href")
				};
			});
			const guid = `oschina-${$$("val[data-name=\"objId\"]").attr("data-value")}`;
			const image = $$("val[data-name=\"sharePic\"]").attr("data-value");
			const upDatedStr = $$("meta[property=\"bytedance:updated_time\"]").attr("content") || pubDateStr;
			let processedItem = {
				title,
				description,
				pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : item.pubDate,
				link: linkUrl ? new URL(linkUrl, baseUrl).href : item.link,
				category: categories,
				author: authors,
				guid,
				id: guid,
				content: {
					html: description,
					text: description
				},
				image,
				banner: image,
				updated: upDatedStr ? parseDate(upDatedStr) : item.updated,
				language
			};
			const extraLinks = $$("div.related-links-box ul.link-list li a").toArray().map((extraLinkEl) => {
				const $$extraLinkEl = $$(extraLinkEl);
				return {
					url: $$extraLinkEl.attr("href"),
					type: "related",
					content_html: $$extraLinkEl.parent().html()
				};
			}).filter((_) => true);
			if (extraLinks) processedItem = {
				...processedItem,
				_extra: { links: extraLinks }
			};
			return {
				...item,
				...processedItem
			};
		});
	}))).filter((_) => true);
	const author = $("a.logo").attr("title");
	return {
		title: `${author} - ${$("div#tabDropdownListOpen a.selected").text()}`,
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("a.logo img").attr("src"),
		author,
		language,
		id: $("val[data-name=\"weixinShareUrl\"]").attr("data-value")
	};
};
const route = {
	path: "/column/:id",
	name: "专栏",
	url: "www.oschina.net",
	maintainers: ["nczitzk"],
	handler,
	example: "/oschina/column/14",
	parameters: { id: "专栏 id，可在对应专栏页 URL 中找到" },
	description: `::: tip
若订阅 [开源安全专栏](https://www.oschina.net/news/column?columnId=14)，网址为 \`https://www.oschina.net/news/column?columnId=14\`，请截取 \`https://www.oschina.net/news/column?columnId=\` 到末尾的部分 \`14\` 作为 \`id\` 参数填入，此时目标路由为 [\`/oschina/column/14\`](https://rsshub.app/oschina/column/14)。
:::

<details>
<summary>更多专栏</summary>

| 名称            | ID |
| --------------- | -- |
| 古典主义 Debian | 4  |
| 自由 & 开源     | 5  |
| 溯源            | 6  |
| 开源先懂协议    | 7  |
| 开源变局        | 8  |
| 创造者说        | 9  |
| 精英主义 BSD    | 10 |
| 苹果有开源      | 11 |
| 开源访谈        | 12 |
| 抱团找组织      | 13 |
| 开源安全        | 14 |
| OSPO            | 15 |
| 创业小辑        | 16 |
| 星推荐          | 17 |
| 单口开源        | 18 |
| 编辑部观察直播  | 19 |
| 开源商业化      | 20 |
| ChatGPT 专题    | 21 |
| 开源新思        | 24 |
| 开源日报        | 25 |
| 大模型思辨      | 26 |
| 家里有个程序员  | 27 |
| 开源漫谈        | 23 |

</details>`,
	categories: ["programming"],
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
		source: ["www.oschina.net"],
		target: (_, url) => {
			return `/oschina/column/${new URL(url).searchParams.get("id") ?? void 0}`;
		}
	}],
	view: 0
};
//#endregion
export { handler, route };
