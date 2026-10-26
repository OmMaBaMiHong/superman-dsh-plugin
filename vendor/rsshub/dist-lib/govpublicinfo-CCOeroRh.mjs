import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/gov/sichuan/deyang/govpublicinfo.tsx
const basicInfoDict = { 绵竹市: {
	rootUrl: "https://www.mz.gov.cn",
	infoType: {
		fdzdnr: {
			basicUrl: "https://www.mz.gov.cn/info/iList.jsp?node_id=GKmzs&cat_id=15971&cur_page=1",
			name: "法定主动内容"
		},
		gsgg: {
			basicUrl: "https://www.mz.gov.cn/info/iList.jsp?node_id=GKmzs&cat_id=24186&cur_page=1",
			name: "公示公告"
		}
	}
} };
const getInfoUrlList = async (rootUrl, infoBasicUrl) => {
	const $ = load((await got_default(infoBasicUrl)).data);
	return $(".list_div li").toArray().map((item) => ({
		title: $("a", item).attr("title"),
		url: `${rootUrl}${$("a", item).attr("href")}`
	}));
};
const getInfoContent = (rootUrl, item) => cache_default.tryGet(item.url, async () => {
	const response = await got_default(item.url);
	try {
		const $ = load(response.data);
		const fileList = $("#attribute > span.gk.fj > file").toArray().map((item) => ({
			name: $(item).text(),
			url: `${rootUrl}/${$(item).attr("href")}`
		}));
		const rawDate = $("#attribute > span:nth-child(3)").text().split("：", 2)[1].trim();
		return {
			title: $("h1").text().trim(),
			id: $("#attribute > span:nth-child(1)").text().split("：", 2)[1].trim(),
			infoNum: $("#attribute > span:nth-child(2)").text().split("：", 2)[1].trim(),
			pubDate: parseDate(timezone(rawDate, 8)),
			date: rawDate,
			keyWord: $("#attribute > span:nth-child(6)").text().split("：", 2)[1].trim(),
			source: $("#attribute > span:nth-child(5)").text().split("：", 2)[1].trim(),
			content: $("body > section > article").html(),
			file: fileList,
			link: item.url,
			_isCompleteInfo: true
		};
	} catch {
		return {
			title: item.title,
			link: item.url,
			_isCompleteInfo: false
		};
	}
});
const route = {
	path: "/deyang/govpublicinfo/:countyName/:infoType?",
	categories: ["government"],
	example: "/gov/sichuan/deyang/govpublicinfo/绵竹市",
	parameters: {
		countyName: "区县名（**其他区县整改中，暂时只支持`绵竹市`**）。德阳市、绵竹市、广汉市、什邡市、中江县、罗江区、旌阳区、高新区",
		infoType: "信息类型。默认值:fdzdnr-“法定主动内容”"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "政府公开信息",
	maintainers: ["zytomorrow"],
	handler,
	description: `| 法定主动内容 | 公示公告 |
| :----------: | :------: |
|    fdzdnr    |   gsgg   |`
};
async function handler(ctx) {
	const countyName = ctx.req.param("countyName");
	const infoType = ctx.req.param("infoType") || "fdzdnr";
	const infoBasicUrl = basicInfoDict[countyName].infoType[infoType].basicUrl;
	const rootUrl = basicInfoDict[countyName].rootUrl;
	const infoUrlList = await getInfoUrlList(rootUrl, infoBasicUrl);
	const items = await Promise.all(infoUrlList.map((item) => getInfoContent(rootUrl, item)));
	return {
		title: `政府公开信息-${countyName}-${basicInfoDict[countyName].infoType[infoType].name}`,
		link: infoBasicUrl,
		item: items.map((item) => ({
			title: item.title,
			description: renderToString(item._isCompleteInfo ? /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("table", {
					border: "1",
					cellpadding: "2",
					cellspacing: "0",
					align: "center",
					children: /* @__PURE__ */ jsxs("tbody", { children: [
						/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "索引号" }), /* @__PURE__ */ jsx("td", { children: item.id })] }),
						/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "文号" }), /* @__PURE__ */ jsx("td", { children: item.infoNum })] }),
						/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "发文日期" }), /* @__PURE__ */ jsx("td", { children: item.date })] }),
						/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "关键词" }), /* @__PURE__ */ jsx("td", { children: item.keyWord })] }),
						/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "信息来源" }), /* @__PURE__ */ jsx("td", { children: item.source })] }),
						item.file?.length ? /* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "附件" }), /* @__PURE__ */ jsx("td", { children: item.file.map((file) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("a", {
							href: file.url,
							children: file.name
						}), /* @__PURE__ */ jsx("br", {})] })) })] }) : null
					] })
				}),
				/* @__PURE__ */ jsx("hr", {}),
				/* @__PURE__ */ jsx("div", { children: item.content ? raw(item.content) : null })
			] }) : /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("a", {
				href: item.link,
				children: item.title
			}) })),
			link: item.link,
			pubDate: item.pubDate
		}))
	};
}
//#endregion
export { route };
