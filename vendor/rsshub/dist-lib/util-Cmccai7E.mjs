import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/aibase/util.tsx
const defaultSrc = "_static/ee6af7e.js";
const defaultToken = "djflkdsoisknfoklsyhownfrlewfknoiaewf";
const rootUrl = "https://top.aibase.com";
const apiRootUrl = "https://app.chinaz.com";
/**
* Converts a string to an array.
* If the string starts with '[', it is assumed to be a JSON array and is parsed accordingly.
* Otherwise, the string is wrapped in an array.
*
* @param str - The input string to convert to an array.
* @returns An array created from the input string.
*/
const strToArray = (str) => {
	if (str.startsWith("[")) return JSON.parse(str);
	return [str];
};
/**
* Retrieve a token asynchronously using a CheerioAPI instance.
* @param $ - The CheerioAPI instance.
* @returns A Promise that resolves to a string representing the token.
*/
const getToken = async ($) => {
	const scriptUrl = new URL($("script[src]").last()?.prop("src") ?? defaultSrc, rootUrl).href;
	return (await rofetch(scriptUrl, { responseType: "text" })).match(/"\/(\w+)\/ai\/.*?\.aspx"/)?.[1] ?? defaultToken;
};
/**
* Build API URLs asynchronously using a CheerioAPI instance.
* @param $ - The CheerioAPI instance.
* @returns An object containing API URLs.
*/
const buildApiUrl = async ($) => {
	const token = await getToken($);
	return {
		apiRecommListUrl: new URL(`${token}/ai/GetAIProcRecommList.aspx`, apiRootUrl).href,
		apiRecommProcUrl: new URL(`${token}/ai/GetAIProcListByRecomm.aspx`, apiRootUrl).href,
		apiTagProcUrl: new URL(`${token}/ai/GetAiProductOfTag.aspx`, apiRootUrl).href,
		apiInfoListUrl: new URL(`${token}/ai/GetAiInfoList.aspx`, apiRootUrl).href,
		aILogListUrl: new URL(`${token}/ai/v2/GetAILogList.aspx`, apiRootUrl).href
	};
};
/**
* Process an array of items to generate a new array of processed items for RSS.
* @param items - An array of items to process.
* @returns An array of processed items.
*/
const processItems = (items) => items.map((item) => {
	const title = item.name;
	const image = item.imgurl;
	const description = renderDescription({
		images: image ? [{
			src: image,
			alt: title
		}] : void 0,
		item
	});
	const guid = `aibase-${item.zurl}`;
	return {
		title,
		description,
		pubDate: timezone(parseDate(item.addtime), 8),
		link: new URL(`tool/${item.zurl}`, rootUrl).href,
		category: [.../* @__PURE__ */ new Set([
			...strToArray(item.categories),
			...strToArray(item.tags),
			item.catname,
			item.procattrname,
			item.procformname,
			item.proctypename
		])].filter(Boolean),
		guid,
		id: guid,
		content: {
			html: description,
			text: item.desc
		},
		image,
		banner: image,
		updated: parseDate(item.UpdTime),
		enclosure_url: item.logo,
		enclosure_type: item.logo ? `image/${item.logo.split(/\./).pop()}` : void 0,
		enclosure_title: title
	};
});
const renderDescription = ({ images, item }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [images?.map((image, index) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
	src: image.src,
	alt: image.alt
}) }, `${image.src}-${index}`) : null), item ? /* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "名称" }), /* @__PURE__ */ jsx("td", { children: item.name })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "标签" }), /* @__PURE__ */ jsx("td", { children: strToArray(item.tags).map((tag) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("a", {
		href: `/topic/${tag}`,
		children: tag
	}), "\xA0"] })) })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "类型" }), /* @__PURE__ */ jsx("td", { children: item.proctypename || "无" })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "描述" }), /* @__PURE__ */ jsx("td", { children: item.desc || "无" })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "需求人群" }), /* @__PURE__ */ jsx("td", { children: renderListText(item.use) })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "使用场景示例" }), /* @__PURE__ */ jsx("td", { children: renderListText(item.example) })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "产品特色" }), /* @__PURE__ */ jsx("td", { children: renderListText(item.functions) })] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "站点" }), /* @__PURE__ */ jsx("td", { children: item.url ? /* @__PURE__ */ jsx("a", {
		href: item.url,
		children: item.url
	}) : "无" })] })
] }) }) : null] }));
const renderListText = (value) => {
	if (!value) return "无";
	const list = strToArray(value);
	if (list.length === 1) return list[0];
	return list.map((entry, index) => /* @__PURE__ */ jsx("li", { children: entry }, `${entry}-${index}`));
};
//#endregion
export { processItems as n, rootUrl as r, buildApiUrl as t };
