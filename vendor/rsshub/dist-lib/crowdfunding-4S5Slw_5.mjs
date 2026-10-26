import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import dayjs from "dayjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import "dayjs/locale/zh-cn.js";
import timezone from "dayjs/plugin/timezone.js";
import utc from "dayjs/plugin/utc.js";
//#region lib/routes/mi/utils.tsx
dayjs.extend(localizedFormat);
dayjs.extend(timezone);
dayjs.extend(utc);
/**
* Fetch the list of crowdfunding projects.
*
* @returns {Promise<CrowdfundingList[]>} The crowdfunding project list.
*/
const getCrowdfundingList = async () => {
	return (await rofetch("https://m.mi.com/v1/crowd/crowd_home", {
		headers: { referer: "https://m.mi.com/" },
		method: "POST"
	})).data.list;
};
/**
* Fetch and cache crowdfunding project details.
*
* @param {CrowdfundingItem} item - Crowdfunding item.
* @returns {Promise<CrowdfundingDetailInfo>} Crowdfunding item details.
*/
const getCrowdfundingItem = (item) => cache_default.tryGet(`mi:crowdfunding:${item.project_id}`, async () => {
	const response = await rofetch("https://m.mi.com/v1/crowd/crowd_detail", {
		headers: { referer: "https://m.mi.com/crowdfunding/home" },
		method: "POST",
		query: { project_id: item.project_id }
	});
	if (response.data.crowd_funding_info.product_market_price === void 0) response.data.crowd_funding_info.product_market_price = item.product_market_price;
	if (response.data.crowd_funding_info.start_time_desc === void 0) response.data.crowd_funding_info.start_time_desc = formatDate(response.data.crowd_funding_info.start_time);
	if (response.data.crowd_funding_info.end_time_desc === void 0) response.data.crowd_funding_info.end_time_desc = formatDate(response.data.crowd_funding_info.end_time);
	return response.data.crowd_funding_info;
});
const CrowdfundingDescription = ({ item }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("img", { src: item.big_image }),
	/* @__PURE__ */ jsx("br", {}),
	item.project_name,
	/* @__PURE__ */ jsx("br", {}),
	item.project_desc,
	/* @__PURE__ */ jsx("br", {}),
	"众筹价：",
	item.price,
	" 元，建议零售价：",
	item.product_market_price,
	" 元",
	/* @__PURE__ */ jsx("br", {}),
	"众筹开始：",
	item.start_time_desc,
	"，众筹结束：",
	item.end_time_desc,
	/* @__PURE__ */ jsx("br", {}),
	"物流：",
	item.send_info,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [/* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "档位" }),
		/* @__PURE__ */ jsx("th", { children: "价格" }),
		/* @__PURE__ */ jsx("th", { children: "描述" })
	] }), item.support_list.map((support, index) => /* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("td", { children: support.name }),
		/* @__PURE__ */ jsxs("td", { children: [support.price, " 元"] }),
		/* @__PURE__ */ jsx("td", { children: support.support_desc })
	] }, `${support.name}-${index}`))] }) })
] });
/**
* Render the crowdfunding item description.
*
* @param {CrowdfundingDetailInfo} item - Crowdfunding item details.
* @returns {string} Rendered description HTML.
*/
const renderCrowdfunding = (item) => renderToString(/* @__PURE__ */ jsx(CrowdfundingDescription, { item }));
const formatDate = (timestamp) => dayjs.unix(timestamp).tz("Asia/Shanghai").locale("zh-cn").format("lll");
var utils_default = {
	getCrowdfundingList,
	getCrowdfundingItem,
	renderCrowdfunding
};
//#endregion
//#region lib/routes/mi/crowdfunding.ts
const route = {
	path: "/crowdfunding",
	categories: ["shopping"],
	example: "/mi/crowdfunding",
	name: "小米众筹",
	maintainers: ["DIYgod", "nuomi1"],
	handler,
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
		source: ["m.mi.com/crowdfunding/home"],
		target: "/crowdfunding"
	}],
	view: 5
};
const getDetails = async (list) => {
	const result = list.flatMap((section) => section.items.map((item) => utils_default.getCrowdfundingItem(item)));
	return await Promise.all(result);
};
const getDataItem = (item) => ({
	title: item.project_name,
	description: utils_default.renderCrowdfunding(item),
	link: `https://m.mi.com/crowdfunding/proddetail/${item.project_id}`,
	image: item.big_image,
	language: "zh-cn"
});
async function handler() {
	const list = await utils_default.getCrowdfundingList();
	return {
		title: "小米众筹",
		link: "https://m.mi.com/crowdfunding/home",
		item: (await getDetails(list)).map((item) => getDataItem(item)),
		allowEmpty: true,
		image: "https://m.mi.com/static/img/icons/apple-touch-icon-152x152.png",
		language: "zh-cn"
	};
}
//#endregion
export { route };
