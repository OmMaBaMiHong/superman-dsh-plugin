import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/chnmuseum/namespace.ts
const namespace = {
	name: "National Museum Of China",
	url: "www.chnmuseum.cn",
	description: "中国国家博物馆（National Museum of China）位于北京市中心天安门广场东侧，东长安街南侧，与人民大会堂东西相对称，是一座系统展示中华民族文化历史的综合性博物馆，也是世界上最大的博物馆之一。",
	zh: { name: "中国国家博物馆" }
};
//#endregion
//#region lib/routes/chnmuseum/zl.tsx
const titleTagMap = {
	zhanlanyugao: "正在展出",
	ztzl: "主题展览",
	jbcl: "基本陈列",
	ztcl: "专题展览",
	lszl: "临时展览",
	"lszl/zdztzl": "临时展览 - 主题展览",
	"lszl/dfjpwwxl": "临时展览 - 精品文物展",
	"lszl/lswhxl": "临时展览 - 历史文化展",
	"lszl/kgfjxl": "临时展览 - 考古发现展",
	"lszl/kjcxz": "临时展览 - 科技创新展",
	"lszl/dywhxl": "临时展览 - 地域文化展",
	"lszl/jdmszpxl": "临时展览 - 经典美术展",
	"lszl/gjjlxl": "临时展览 - 国际交流展",
	gbxz: "国博巡展"
};
const formatExhibitionDate = (dateStr) => {
	if (!dateStr) return;
	const parts = dateStr.replaceAll(/年|月/g, "-").replaceAll("日", "").replaceAll(/[/.]/g, "-").split("-").filter(Boolean);
	if (parts.length === 3) return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
};
const parseExhibitionDuration = (duration) => {
	if (!duration) return {
		startDate: void 0,
		endDate: void 0
	};
	const cleanStr = duration.replaceAll(/\s+/g, "").replaceAll(/（[^）]*）/g, "");
	const allDates = cleanStr.match(/(\d{4}[./年-]\d{1,2}[./月-]\d{1,2}日?)|(\d{1,2}[./月-]\d{1,2}日?)/g) || [];
	let startDateRaw;
	let endDateRaw;
	if (cleanStr.startsWith("展至") && allDates.length > 0) endDateRaw = allDates[0];
	else if (allDates.length >= 2) {
		startDateRaw = allDates[0];
		let rawEnd = allDates[1];
		if (!/\d{4}/.test(rawEnd) && startDateRaw) {
			const startYear = startDateRaw.match(/^\d{4}/);
			if (startYear) {
				const sep = startDateRaw.includes("年") ? "年" : startDateRaw.includes("/") ? "/" : "-";
				rawEnd = `${startYear[0]}${sep}${rawEnd}`;
			}
		}
		endDateRaw = rawEnd;
	} else if (allDates.length === 1) if (cleanStr.includes("展至")) endDateRaw = allDates[0];
	else startDateRaw = allDates[0];
	return {
		startDate: formatExhibitionDate(startDateRaw),
		endDate: formatExhibitionDate(endDateRaw)
	};
};
const resolveRouteConfig = (type, subtype, baseUrl) => {
	let url = `${baseUrl}/zl/`;
	let cleanType = "";
	if (type) {
		cleanType = subtype ? `${type}/${subtype}` : type;
		url = `${baseUrl}/zl/${cleanType}/`;
	}
	return {
		cleanType,
		url,
		titleTag: titleTagMap[cleanType] || "展览"
	};
};
const fetchTargetElements = async (cleanType, subtype, url, baseUrl) => {
	const items = [];
	const seenLinks = /* @__PURE__ */ new Set();
	const extractItems = (html, contextUrl) => {
		const $ = load(html);
		const pageElements = $("ul[id=\"div\"] a.recurl, ul.cj_hb_list a.recurl").toArray();
		for (const el of pageElements) {
			const $item = $(el).closest("li");
			if ($item.length > 0) {
				const href = $(el).attr("href") || "";
				if (href && !seenLinks.has(href)) {
					seenLinks.add(href);
					items.push({
						$item,
						contextUrl
					});
				}
			}
		}
	};
	if (cleanType === "lszl") {
		const subKeys = Object.keys(titleTagMap).filter((key) => key.startsWith("lszl/"));
		const pagesData = await Promise.all(subKeys.map(async (subKey) => {
			const targetSubUrl = `${baseUrl}/zl/${subKey}/`;
			return {
				html: (await got_default(targetSubUrl)).data,
				targetSubUrl
			};
		}));
		for (const page of pagesData) extractItems(page.html, page.targetSubUrl);
	} else extractItems((await got_default(url)).data, url);
	return items;
};
const buildItemLink = (rawLink, contextUrl, baseUrl) => rawLink ? new URL(rawLink, contextUrl).href : baseUrl;
const buildExhibitionLink = (rawZtzl, itemLink, baseUrl) => rawZtzl ? new URL(rawZtzl, baseUrl).href : itemLink;
const route = {
	path: "/zl/:type?/:subType?",
	categories: ["travel"],
	example: "/chnmuseum/zl/lszl/zdztzl",
	parameters: {
		type: "Exhibition type, supported values: zhanlanyugao（正在展出）、ztzl（主题展览）、jbcl（基本陈列）、ztcl（专题展览）、lszl（临时展览）、gbxz（国博巡展）. Default: All exhibitions.",
		subType: "subtype only works under type lszl（临时展览）, supported values: zdztzl（主题展览）、dfjpwwxl（精品文物展）、lswhxl（历史文化展）、kgfjxl（考古发现展）、kjcxz（科技创新展）、dywhxl（地域文化展）、jdmszpxl（经典美术展）、gjjlxl（国际交流展）"
	},
	name: "Exhibitions",
	maintainers: ["magazian"],
	radar: [{
		source: ["www.chnmuseum.cn/zl/"],
		target: "/zl"
	}],
	handler: async (ctx) => {
		const type = ctx.req.param("type")?.trim();
		const subtype = ctx.req.param("subType")?.trim();
		const museumName = namespace.zh?.name || namespace.name;
		const baseUrl = "https://www.chnmuseum.cn";
		const { cleanType, url, titleTag } = resolveRouteConfig(type, subtype, baseUrl);
		const itemsToParse = await fetchTargetElements(cleanType, subtype, url, baseUrl);
		const list = (await Promise.all(itemsToParse.map(({ $item, contextUrl }) => {
			const aTag = $item.find("a.recurl");
			if (!aTag.length) return null;
			const rawLink = aTag.attr("href") || "";
			const itemLink = buildItemLink(rawLink, contextUrl, baseUrl);
			return cache_default.tryGet(itemLink, async () => {
				const rawZtzl = aTag.attr("ztzlurl")?.trim() || "";
				const exhibitionLink = buildExhibitionLink(rawZtzl, itemLink, baseUrl);
				const imgTag = $item.find("img");
				const title = imgTag.attr("alt") || "";
				const rawSrc = imgTag.attr("src");
				const imgUrl = new URL(rawSrc, contextUrl).href;
				const location = $item.find("div.cj_zxx1").text().trim();
				let fullDuration = $item.find("div.cj_zxx2 p").text().trim();
				if (fullDuration.endsWith("...")) {
					const match = (await got_default(itemLink)).data.match(/var\s+qtxszq\s*=\s*"(.*?)";/);
					if (match && match[1]) fullDuration = match[1];
				}
				const { startDate, endDate } = parseExhibitionDuration(fullDuration);
				const pubDate = startDate ? parseDate(startDate) : void 0;
				const description = renderToString(/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: imgUrl }), /* @__PURE__ */ jsx("br", {})] }),
					/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "地点：" }), location] }),
					/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "开展：" }), startDate ?? "未定/常设"] }),
					/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "闭展：" }), endDate ?? "未定/常设"] }),
					fullDuration && /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsxs("small", { children: ["原始展期：", fullDuration] }) })
				] }));
				return {
					title,
					link: exhibitionLink,
					guid: itemLink,
					pubDate,
					description,
					_extra: {
						museumName,
						title,
						location,
						startDate,
						endDate,
						itemLink
					}
				};
			});
		}))).filter((i) => i !== null);
		return {
			title: `${museumName} - ${titleTag}`,
			link: url,
			language: "zh-CN",
			item: list
		};
	}
};
//#endregion
export { route };
