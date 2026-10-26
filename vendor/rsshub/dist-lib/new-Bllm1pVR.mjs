import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/dbaplus/templates/description.tsx
const renderDescription = ({ images, intro, description }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	images?.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
		src: image.src,
		alt: image.alt
	}) }) : null),
	intro ? /* @__PURE__ */ jsx("blockquote", { children: intro }) : null,
	description ? raw(description) : null
] }));
//#endregion
//#region lib/routes/dbaplus/new.ts
const handler = async (ctx) => {
	const { id = "9" } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "30");
	const targetUrl = new URL(`news-${id}-1.html`, "https://dbaplus.cn").href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh";
	let items = $("ul.media-list li.media").slice(0, limit).toArray().map((el) => {
		const $el = $(el);
		const $aEl = $el.find("h3.media-heading a");
		const title = $aEl.text();
		const image = $el.find("img.media-object").attr("src");
		const description = renderDescription({
			images: image ? [{
				src: image,
				alt: title
			}] : void 0,
			intro: $el.find("div.mt10").html()
		});
		const pubDateStr = $el.find("span.time").text().replaceAll(/(年|月)/g, "-").replace("日", "");
		const linkUrl = $aEl.attr("href");
		const authors = $el.find("span.user").toArray().map((authorEl) => {
			return {
				name: $(authorEl).text(),
				url: void 0,
				avatar: void 0
			};
		});
		const upDatedStr = pubDateStr;
		return {
			title,
			description,
			pubDate: pubDateStr ? parseDate(pubDateStr) : void 0,
			link: linkUrl,
			author: authors,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: upDatedStr ? parseDate(upDatedStr) : void 0,
			language
		};
	});
	items = await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("h2.title").text();
			const description = item.description + renderDescription({ description: $$("div.new-detailed").html() });
			const pubDateStr = $$("span.time").first().text();
			const categories = $$("meta[name=\"keywords\"]").attr("content")?.split(",") ?? [];
			const authors = $$("span.user").toArray().map((authorEl) => {
				return {
					name: $$(authorEl).text(),
					url: void 0,
					avatar: void 0
				};
			});
			const upDatedStr = pubDateStr;
			const processedItem = {
				title,
				description,
				pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : item.pubDate,
				category: categories,
				author: authors,
				content: {
					html: description,
					text: description
				},
				updated: upDatedStr ? timezone(parseDate(upDatedStr), 8) : item.updated,
				language
			};
			return {
				...item,
				...processedItem
			};
		});
	}));
	const description = $("meta[name=\"description\"]").attr("content") ?? "";
	return {
		title: $("title").text().split(/：/, 1)[0],
		description,
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("div.navbar-header img").attr("src"),
		author: description.split(/：/, 1)[0],
		language,
		id: targetUrl
	};
};
const route = {
	path: "/news/:id?",
	name: "资讯",
	url: "dbaplus.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/dbaplus/news/9",
	parameters: { category: {
		description: "分类，默认为 `9`，即全部，可在对应分类页 URL 中找到",
		options: [
			{
				label: "全部",
				value: "9"
			},
			{
				label: "数据库",
				value: "153"
			},
			{
				label: "国产数据库",
				value: "217"
			},
			{
				label: "ORACLE",
				value: "10"
			},
			{
				label: "MySQL",
				value: "11"
			},
			{
				label: "SQL优化",
				value: "155"
			},
			{
				label: "Newsletter",
				value: "156"
			},
			{
				label: "其它",
				value: "154"
			},
			{
				label: "运维",
				value: "134"
			},
			{
				label: "大数据",
				value: "73"
			},
			{
				label: "架构",
				value: "141"
			},
			{
				label: "PaaS云",
				value: "72"
			},
			{
				label: "职场生涯",
				value: "149"
			},
			{
				label: "标准评估",
				value: "248"
			},
			{
				label: "这里有毒",
				value: "21"
			},
			{
				label: "最新活动",
				value: "152"
			},
			{
				label: "往期干货",
				value: "148"
			},
			{
				label: "特别策划",
				value: "150"
			},
			{
				label: "荐书",
				value: "151"
			}
		]
	} },
	description: `::: tip
订阅 [资讯](https://dbaplus.cn/news-9-1.html)，其源网址为 \`https://dbaplus.cn/news-9-1.html\`，请参考该 URL 指定部分构成参数，此时路由为 [\`/dbaplus/news/9\`](https://rsshub.app/dbaplus/news/9)。
:::

<details>
  <summary>更多分类</summary>

| [全部](https://dbaplus.cn/news-9-1.html) | [数据库](https://dbaplus.cn/news-153-1.html) | [运维](https://dbaplus.cn/news-134-1.html) | [大数据](https://dbaplus.cn/news-73-1.html) | [架构](https://dbaplus.cn/news-141-1.html) |
| ---------------------------------------- | -------------------------------------------- | ------------------------------------------ | ------------------------------------------- | ------------------------------------------ |
| [9](https://rsshub.app/dbaplus/news/9)   | [153](https://rsshub.app/dbaplus/news/153)   | [134](https://rsshub.app/dbaplus/news/134) | [73](https://rsshub.app/dbaplus/news/73)    | [141](https://rsshub.app/dbaplus/news/141) |

| [PaaS 云](https://dbaplus.cn/news-72-1.html) | [职场生涯](https://dbaplus.cn/news-149-1.html) | [标准评估](https://dbaplus.cn/news-248-1.html) | [这里有毒](https://dbaplus.cn/news-21-1.html) |
| -------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- | --------------------------------------------- |
| [72](https://rsshub.app/dbaplus/news/72)     | [149](https://rsshub.app/dbaplus/news/149)     | [248](https://rsshub.app/dbaplus/news/248)     | [21](https://rsshub.app/dbaplus/news/21)      |

#### [数据库](https://dbaplus.cn/news-153-1.html)

| [国产数据库](https://dbaplus.cn/news-217-1.html) | [ORACLE](https://dbaplus.cn/news-10-1.html) | [MySQL](https://dbaplus.cn/news-11-1.html) | [SQL 优化](https://dbaplus.cn/news-155-1.html) | [Newsletter](https://dbaplus.cn/news-156-1.html) |
| ------------------------------------------------ | ------------------------------------------- | ------------------------------------------ | ---------------------------------------------- | ------------------------------------------------ |
| [217](https://rsshub.app/dbaplus/news/217)       | [10](https://rsshub.app/dbaplus/news/10)    | [11](https://rsshub.app/dbaplus/news/11)   | [155](https://rsshub.app/dbaplus/news/155)     | [156](https://rsshub.app/dbaplus/news/156)       |

| [其它](https://dbaplus.cn/news-154-1.html) |
| ------------------------------------------ |
| [154](https://rsshub.app/dbaplus/news/154) |

#### [这里有毒](https://dbaplus.cn/news-21-1.html)

| [最新活动](https://dbaplus.cn/news-152-1.html) | [往期干货](https://dbaplus.cn/news-148-1.html) | [特别策划](https://dbaplus.cn/news-150-1.html) | [荐书](https://dbaplus.cn/news-151-1.html) |
| ---------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- | ------------------------------------------ |
| [152](https://rsshub.app/dbaplus/news/152)     | [148](https://rsshub.app/dbaplus/news/148)     | [150](https://rsshub.app/dbaplus/news/150)     | [151](https://rsshub.app/dbaplus/news/151) |

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
	radar: [
		{
			source: ["dbaplus.cn/news*"],
			target: (_, url) => {
				const id = new URL(url).href.match(/-(\d+)-\.html/)?.[1];
				return `/dbaplus/news${id ? `/${id}` : ""}`;
			}
		},
		{
			title: "全部",
			source: ["dbaplus.cn/news-9-1.html"],
			target: "/news/9"
		},
		{
			title: "数据库",
			source: ["dbaplus.cn/news-153-1.html"],
			target: "/news/153"
		},
		{
			title: "国产数据库",
			source: ["dbaplus.cn/news-217-1.html"],
			target: "/news/217"
		},
		{
			title: "ORACLE",
			source: ["dbaplus.cn/news-10-1.html"],
			target: "/news/10"
		},
		{
			title: "MySQL",
			source: ["dbaplus.cn/news-11-1.html"],
			target: "/news/11"
		},
		{
			title: "SQL优化",
			source: ["dbaplus.cn/news-155-1.html"],
			target: "/news/155"
		},
		{
			title: "Newsletter",
			source: ["dbaplus.cn/news-156-1.html"],
			target: "/news/156"
		},
		{
			title: "其它",
			source: ["dbaplus.cn/news-154-1.html"],
			target: "/news/154"
		},
		{
			title: "运维",
			source: ["dbaplus.cn/news-134-1.html"],
			target: "/news/134"
		},
		{
			title: "大数据",
			source: ["dbaplus.cn/news-73-1.html"],
			target: "/news/73"
		},
		{
			title: "架构",
			source: ["dbaplus.cn/news-141-1.html"],
			target: "/news/141"
		},
		{
			title: "PaaS云",
			source: ["dbaplus.cn/news-72-1.html"],
			target: "/news/72"
		},
		{
			title: "职场生涯",
			source: ["dbaplus.cn/news-149-1.html"],
			target: "/news/149"
		},
		{
			title: "标准评估",
			source: ["dbaplus.cn/news-248-1.html"],
			target: "/news/248"
		},
		{
			title: "这里有毒",
			source: ["dbaplus.cn/news-21-1.html"],
			target: "/news/21"
		},
		{
			title: "最新活动",
			source: ["dbaplus.cn/news-152-1.html"],
			target: "/news/152"
		},
		{
			title: "往期干货",
			source: ["dbaplus.cn/news-148-1.html"],
			target: "/news/148"
		},
		{
			title: "特别策划",
			source: ["dbaplus.cn/news-150-1.html"],
			target: "/news/150"
		},
		{
			title: "荐书",
			source: ["dbaplus.cn/news-151-1.html"],
			target: "/news/151"
		}
	],
	view: 0
};
//#endregion
export { handler, route };
