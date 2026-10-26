import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/go/jihs/idwr.ts
const handler = async (ctx) => {
	const { year = (/* @__PURE__ */ new Date()).getFullYear() } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const baseUrl = "https://id-info.jihs.go.jp";
	const targetUrl = new URL(`surveillance/idwr/jp/idwr/${year}/`, baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "ja";
	const author = $("span.drawer-branding__subtitle").text();
	const items = $("a.sizeview").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $pEl = $el.parent("p");
		const title = $pEl.prev("h2").text();
		const description = $pEl.html() ?? void 0;
		const pubDateStr = $pEl.text().match(/〔(\d{4}年\d{1,2}月\d{1,2}日)発行〕/)?.[1];
		const linkUrl = $el.attr("href");
		const upDatedStr = pubDateStr;
		let processedItem = {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr, "YYYY年M月D日") : void 0,
			link: linkUrl ? new URL(linkUrl, targetUrl).href : void 0,
			author,
			content: {
				html: description,
				text: description
			},
			updated: upDatedStr ? parseDate(upDatedStr, "YYYY年M月D日") : void 0,
			language
		};
		const $enclosureEl = $el;
		const enclosureUrl = linkUrl ? new URL(linkUrl, targetUrl).href : void 0;
		if (enclosureUrl) {
			const enclosureType = `application/${enclosureUrl.split(/\./).pop()}`;
			const enclosureTitle = $enclosureEl.text();
			processedItem = {
				...processedItem,
				enclosure_url: enclosureUrl,
				enclosure_type: enclosureType,
				enclosure_title: enclosureTitle || title,
				enclosure_length: void 0
			};
		}
		return processedItem;
	});
	return {
		title: $("title").text(),
		description: $("meta[name=\"keywords\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("img.common-branding__logo-image").attr("src") ? new URL($("img.common-branding__logo-image").attr("src"), baseUrl).href : void 0,
		author,
		language,
		id: targetUrl
	};
};
const route = {
	path: "/jihs/idwr/:year?",
	name: "感染症発生動向調査週報",
	url: "id-info.jihs.go.jp",
	maintainers: ["nczitzk"],
	handler,
	example: "/go/jihs/idwr/2025",
	parameters: { year: { description: "Year, current year by default" } },
	description: `::: tip
To subscribe to [感染症発生動向調査週報](https://id-info.jihs.go.jp/surveillance/idwr/jp/idwr/2025/), where the source URL is \`https://id-info.jihs.go.jp/surveillance/idwr/jp/idwr/2025/\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/go/jihs/idwr/2025\`](https://rsshub.app/go/jihs/idwr/2025).
:::`,
	categories: ["government"],
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
		source: ["id-info.jihs.go.jp/surveillance/idwr/jp/idwr/:year"],
		target: (params) => {
			const year = params.year;
			return `/go/jihs/idwr${year ? `/${year}` : ""}`;
		}
	}],
	view: 0,
	zh: {
		path: "/jihs/idwr/:year?",
		name: "传染病发生动向调查周报",
		url: "id-info.jihs.go.jp",
		maintainers: ["nczitzk"],
		handler,
		example: "/go/jihs/idwr/2025",
		parameters: { year: { description: "年份，默认为当前年份，可在对应页 URL 中找到" } },
		description: `::: tip
若订阅 [传染病发生动向调查周报](https://id-info.jihs.go.jp/surveillance/idwr/jp/idwr/2025/)，网址为 \`https://id-info.jihs.go.jp/surveillance/idwr/jp/idwr/2025/\`，请截取 \`https://id-info.jihs.go.jp/surveillance/idwr/jp/idwr/\` 到末尾 \`/\` 的部分 \`2025\` 作为 \`year\` 参数填入，此时目标路由为 [\`/go/jihs/idwr/2025\`](https://rsshub.app/go/jihs/idwr/2025)。
:::`
	}
};
//#endregion
export { handler, route };
