import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/jump/discount.tsx
const discountUrl = "https://switch.jumpvg.com/jump/discount/find4Discount/5/v2";
const platformObject = {
	switch: 1,
	steam: 4,
	ps4: 51,
	ps5: 52
};
const filterObject = {
	switch: {
		jx: 16,
		all: 17,
		sd: 18
	},
	steam: {
		jx: 26,
		all: 27,
		dl: 28,
		sd: 29
	},
	ps4: {
		jx: 19,
		all: 20,
		sd: 21,
		vip: 22
	},
	ps5: {
		all: 23,
		sd: 24,
		vip: 25
	}
};
const filterName = {
	jx: "精选",
	sd: "史低",
	all: "全部",
	vip: "会员",
	dl: "独立"
};
const renderDescription = (item) => renderToString(/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("img", { src: item.banner }), /* @__PURE__ */ jsxs("table", {
	style: "font-family: verdana,arial,sans-serif;font-size:11px;color:#333333;border-width: 1px;border-color: #999999;border-collapse: collapse;",
	children: [
		/* @__PURE__ */ jsxs("tr", {
			style: "background-color:#d4e3e5;",
			children: [/* @__PURE__ */ jsx("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: "名称"
			}), /* @__PURE__ */ jsx("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: item.name
			})]
		}),
		item.subName ? /* @__PURE__ */ jsxs("tr", {
			style: "background-color:#d4e3e5;",
			children: [/* @__PURE__ */ jsx("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: "别名"
			}), /* @__PURE__ */ jsx("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: item.subName
			})]
		}) : null,
		/* @__PURE__ */ jsxs("tr", {
			style: "background-color:#d4e3e5;",
			children: [/* @__PURE__ */ jsx("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: "中文支持"
			}), /* @__PURE__ */ jsx("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: item.chinese
			})]
		}),
		item.lowestPriceCountry ? /* @__PURE__ */ jsxs("tr", {
			style: "background-color:#d4e3e5;",
			children: [/* @__PURE__ */ jsx("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: "史低地区"
			}), /* @__PURE__ */ jsx("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: item.lowestPriceCountry
			})]
		}) : null,
		/* @__PURE__ */ jsxs("tr", {
			style: "background-color:#d4e3e5;",
			children: [/* @__PURE__ */ jsx("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: "史低"
			}), /* @__PURE__ */ jsx("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: item.isLowest ? "是" : "否"
			})]
		}),
		item.pubDate ? /* @__PURE__ */ jsxs("tr", {
			style: "background-color:#d4e3e5;",
			children: [/* @__PURE__ */ jsx("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: "发布日期"
			}), /* @__PURE__ */ jsx("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: item.pubDate
			})]
		}) : null,
		/* @__PURE__ */ jsxs("tr", {
			style: "background-color:#d4e3e5;",
			children: [/* @__PURE__ */ jsx("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: "当前价格"
			}), /* @__PURE__ */ jsxs("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: ["￥", item.price]
			})]
		}),
		/* @__PURE__ */ jsxs("tr", {
			style: "background-color:#d4e3e5;",
			children: [/* @__PURE__ */ jsx("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: "原价"
			}), /* @__PURE__ */ jsxs("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: ["￥", item.originPrice]
			})]
		}),
		/* @__PURE__ */ jsxs("tr", {
			style: "background-color:#d4e3e5;",
			children: [/* @__PURE__ */ jsx("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: "折扣地区"
			}), /* @__PURE__ */ jsx("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: item.priceCountry
			})]
		}),
		/* @__PURE__ */ jsxs("tr", {
			style: "background-color:#d4e3e5;",
			children: [/* @__PURE__ */ jsx("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: "折扣"
			}), /* @__PURE__ */ jsxs("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: [item.cutOff, "%"]
			})]
		}),
		item.mcScore ? /* @__PURE__ */ jsxs("tr", {
			style: "background-color:#d4e3e5;",
			children: [/* @__PURE__ */ jsx("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: "metacritic评分"
			}), /* @__PURE__ */ jsx("td", {
				style: " border-width: 1px;padding: 8px;border-style: solid;border-color: #a9c6c9;",
				children: item.mcScore
			})]
		}) : null
	]
})] }));
const getDiscountNum = async (platform) => {
	const data = (await got_default.get("https://switch.jumpvg.com/jump/platform/order/v2?needCount=1&needFilter=1&version=3")).data.data;
	let totalNum = 0;
	for (const index in data) {
		if (data[index].platformAlias.toLocaleLowerCase() !== platform.toLocaleLowerCase()) continue;
		totalNum = data[index].gameNum;
		break;
	}
	return totalNum;
};
const getSinglePageDiscountItem = async (countries, offset, platform, termsId) => {
	return (await got_default.get(`${discountUrl}?countries=${countries}&offset=${offset}&platform=${platform}&size=10&termsId=${termsId}&version=3`)).data.data;
};
const getAllPageDiscountItem = async (countries, platform, termsId, totalNum) => {
	let allDiscountItem = [];
	for (let idx = 0; idx <= Math.round(totalNum / 10); idx++) {
		const itemList = await getSinglePageDiscountItem(countries, idx * 10, platform, termsId);
		allDiscountItem = [...allDiscountItem, ...itemList];
	}
	return allDiscountItem;
};
const route = {
	path: "/discount/:platform/:filter?/:countries?",
	categories: ["game"],
	example: "/jump/discount/ps5/all",
	parameters: {
		platform: "平台:switch,ps4,ps5,xbox,steam,epic",
		filter: "过滤参数,all-全部，jx-精选，sd-史低，dl-独立，vip-会员",
		countries: "地区，具体支持较多，可自信查看地区简写"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "游戏折扣",
	maintainers: ["zytomorrow"],
	handler,
	description: `| switch | ps4  | ps5  | xbox   | steam | epic   |
| ------ | ---- | ---- | ------ | ----- | ------ |
| 可用   | 可用 | 可用 | 不可用 | 可用  | 不可用 |

| filter | switch | ps4 | ps5 | steam |
| ------ | ------ | --- | --- | ----- |
| all    | ✔      | ✔   | ✔   | ✔     |
| jx     | ✔      | ✔   | ❌  | ✔     |
| sd     | ✔      | ✔   | ✔   | ✔     |
| dl     | ❌     | ✔   | ❌  | ✔     |
| vip    | ❌     | ❌  | ✔   | ❌    |

| 北美 | 欧洲（英语） | 法国 | 德国 | 日本 |
| ---- | ------------ | ---- | ---- | ---- |
| na   | eu           | fr   | de   | jp   |`
};
async function handler(ctx) {
	const platform = ctx.req.param("platform");
	const filter = ctx.req.param("filter") || "all";
	const countries = ctx.req.param("countries") || "";
	const discountNum = await getDiscountNum(platform);
	const allDiscountItem = await getAllPageDiscountItem(countries, platformObject[platform.toLocaleLowerCase()], filterObject[platform.toLocaleLowerCase()][filter], discountNum);
	return {
		title: `jump 折扣-${platform}-${filterName[filter]}${countries ? `-${countries}` : ""}`,
		link: "https://jumpvg.com/",
		description: "jump 发现游戏",
		item: allDiscountItem.map((item) => ({
			title: `${item.name}-${item.cutOff}%-￥${item.price}`,
			description: renderDescription(item),
			link: item.banner,
			guid: `${platform}-${item.oldGameId}-${item.cutOff}`
		}))
	};
}
//#endregion
export { route };
