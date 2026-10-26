import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/buaa/lib/space/newbook.tsx
const route = {
	path: String.raw`/lib/space/:path{newbook.*}`,
	name: "图书馆 - 新书速递",
	url: "space.lib.buaa.edu.cn/mspace/newBook",
	maintainers: ["OverflowCat"],
	example: "/buaa/lib/space/newbook/",
	handler,
	description: `可通过参数进行筛选：\`/buaa/lib/space/newbook/key1=value1&key2=value2...\`

- \`dcpCode\`：学科分类代码
  - 例：
    - 工学：\`08\`
    - 工学 > 计算机 > 计算机科学与技术：\`080901\`
  - 默认值：\`nolimit\`
  - 注意事项：不可与 \`clsNo\` 同时使用。
- \`clsNo\`：中图分类号
  - 例：
    - 计算机科学：\`TP3\`
  - 默认值：无
  - 注意事项
    - 不可与 \`dcpCode\` 同时使用。
    - 此模式下获取不到上架日期。
- \`libCode\`：图书馆代码
  - 例：
    - 本馆：\`00000\`
  - 默认值：无
  - 注意事项：只有本馆一个可选值。
- \`locaCode\`：馆藏地代码
  - 例：
    - 五层西 - 中文新书借阅室 (A-Z 类)：\`02503\`
  - 默认值：无
  - 注意事项：必须与 \`libCode\` 同时使用。

示例：

- \`buaa/lib/space/newbook\` 为所有新书
- \`buaa/lib/space/newbook/clsNo=U&libCode=00000&locaCode=60001\` 为沙河教 2 图书馆所有中图分类号为 U（交通运输）的书籍`,
	categories: ["university"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	}
};
async function handler(ctx) {
	const path = ctx.req.param("path");
	const i = path.indexOf("/");
	const params = i === -1 ? "" : path.slice(i + 1);
	const searchParams = new URLSearchParams(params);
	const dcpCode = searchParams.get("dcpCode");
	const clsNo = searchParams.get("clsNo");
	if (dcpCode && clsNo) throw new Error("dcpCode and clsNo cannot be used at the same time");
	searchParams.set("pageSize", "100");
	searchParams.set("page", "1");
	!dcpCode && !clsNo && searchParams.set("dcpCode", "nolimit");
	const { data } = await got_default(`https://space.lib.buaa.edu.cn/meta-local/opac/new/100/${clsNo ? "byclass" : "bysubject"}?${searchParams.toString()}`);
	const list = data?.data?.dataList || [];
	return {
		title: "北航图书馆 - 新书速递",
		item: await Promise.all(list.map(async (item) => await getItem(item))),
		description: "北京航空航天大学图书馆新书速递",
		language: "zh-CN",
		link: "https://space.lib.buaa.edu.cn/space/newBook",
		author: "北京航空航天大学图书馆",
		allowEmpty: true,
		image: "https://lib.buaa.edu.cn/apple-touch-icon.png"
	};
}
async function getItem(item) {
	return await cache_default.tryGet(item.isbn, async () => {
		const info = await getItemInfo(item.isbn);
		const holdings = JSON.parse(item.holdings);
		const link = `https://space.lib.buaa.edu.cn/space/searchDetailLocal/${item.bibId}`;
		const content = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
			info?.imageUrl ? /* @__PURE__ */ jsx("aside", { children: /* @__PURE__ */ jsx("img", {
				src: info.imageUrl,
				alt: "封面"
			}) }) : null,
			/* @__PURE__ */ jsx("h2", { children: "书籍信息" }),
			/* @__PURE__ */ jsxs("div", { children: [
				/* @__PURE__ */ jsx("span", {
					class: "call-no",
					style: "font-family: JetBrainsMono, monospace; font-style: italic; font-weight: 700; color: #458f57;",
					children: item.callno?.at(0) || "无"
				}),
				" ",
				"/ ",
				/* @__PURE__ */ jsx("span", {
					class: "author",
					children: item.author
				}),
				" / ",
				/* @__PURE__ */ jsx("span", {
					class: "publisher",
					children: item.publisher
				}),
				" / ",
				/* @__PURE__ */ jsx("span", {
					class: "pub-year",
					children: item.pub_year
				})
			] }),
			/* @__PURE__ */ jsx("h3", { children: "简介" }),
			/* @__PURE__ */ jsx("div", {
				itemprop: "description",
				children: info?.content
			}),
			/* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
				/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "ISBN" }), /* @__PURE__ */ jsx("td", {
					itemprop: "isbn",
					children: item.isbn
				})] }),
				/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "语言" }), /* @__PURE__ */ jsx("td", {
					itemprop: "language",
					children: item.language
				})] }),
				/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "类型" }), /* @__PURE__ */ jsx("td", {
					itemprop: "docType",
					children: item.docTypeDesc
				})] })
			] }) }),
			info?.authorInfo ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("h3", { children: "作者简介" }), /* @__PURE__ */ jsx("div", {
				itemprop: "authorInfo",
				children: info.authorInfo
			})] }) : null,
			/* @__PURE__ */ jsx("h2", { children: "馆藏信息" }),
			item.onSelfDate ? /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("strong", { children: "上架时间" }),
				"：",
				/* @__PURE__ */ jsx("date", {
					datetime: item.onSelfDate,
					children: item.onSelfDate
				})
			] }) : null,
			/* @__PURE__ */ jsx("br", {}),
			/* @__PURE__ */ jsx("h3", { children: "馆藏地点" }),
			/* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsx("tbody", { children: holdings.map((holding) => /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "所属馆藏地" }), /* @__PURE__ */ jsx("td", { children: holding.location })] }),
				/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "索书号" }), /* @__PURE__ */ jsx("td", { children: holding.callNo })] }),
				/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "条码号" }), /* @__PURE__ */ jsx("td", { children: holding.barCode })] }),
				/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "编号" }), /* @__PURE__ */ jsx("td", { children: holding.itemId })] }),
				/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "书刊状态" }), /* @__PURE__ */ jsx("td", {
					style: `color: ${holding.status === "可借" ? "#458f57" : "#d86d02"}`,
					children: holding.status
				})] })
			] })) }) }),
			info?.catalog ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("h2", { children: "目录" }), /* @__PURE__ */ jsx("div", {
				itemprop: "catalog",
				children: raw(info.catalog)
			})] }) : null
		] }));
		return {
			language: item.language === "eng" ? "en" : "zh-CN",
			title: item.title,
			pubDate: item.onSelfDate ? timezone(parseDate(item.onSelfDate), 8) : void 0,
			description: content,
			link
		};
	});
}
async function getItemInfo(isbn) {
	const response = await got_default(`https://space.lib.buaa.edu.cn/meta-local/opac/third_api/douban/${isbn}/info`);
	return JSON.parse(response.body).data;
}
//#endregion
export { route };
