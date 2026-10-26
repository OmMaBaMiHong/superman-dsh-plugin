import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/ccmn/price-adjustment.tsx
const route = {
	path: "/price-adjustment/:category",
	categories: ["other"],
	example: "/ccmn/price-adjustment/copper",
	parameters: { category: {
		description: "金属类别",
		options: [
			{
				label: "铜",
				value: "copper"
			},
			{
				label: "铝",
				value: "alu"
			},
			{
				label: "锌",
				value: "zn"
			},
			{
				label: "锡",
				value: "sn"
			},
			{
				label: "铅",
				value: "pb"
			},
			{
				label: "镍",
				value: "ni"
			}
		]
	} },
	radar: [
		{
			source: ["copper.ccmn.cn/:suffix", "copper.ccmn.cn/:suffix/:subsuffix?"],
			target: "/price-adjustment/copper"
		},
		{
			source: ["alu.ccmn.cn/:suffix", "alu.ccmn.cn/:suffix/:subsuffix?"],
			target: "/price-adjustment/alu"
		},
		{
			source: ["zn.ccmn.cn/:suffix", "zn.ccmn.cn/:suffix/:subsuffix?"],
			target: "/price-adjustment/zn"
		},
		{
			source: ["sn.ccmn.cn/:suffix", "sn.ccmn.cn/:suffix/:subsuffix?"],
			target: "/price-adjustment/sn"
		},
		{
			source: ["pb.ccmn.cn/:suffix", "pb.ccmn.cn/:suffix/:subsuffix?"],
			target: "/price-adjustment/pb"
		},
		{
			source: ["ni.ccmn.cn/:suffix", "ni.ccmn.cn/:suffix/:subsuffix?"],
			target: "/price-adjustment/ni"
		}
	],
	features: {
		supportRadar: true,
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: false
	},
	name: "调价动态",
	maintainers: ["chrisis58"],
	handler,
	description: "长江有色网的金属调价动态，包括铜、铝、锌、锡、铅、镍等金属。"
};
const SUB_DOMAIN_MAP = {
	copper: "copper.ccmn.cn",
	alu: "alu.ccmn.cn",
	zn: "zn.ccmn.cn",
	sn: "sn.ccmn.cn",
	pb: "pb.ccmn.cn",
	ni: "ni.ccmn.cn"
};
const READABLE_CATEGORIES = {
	copper: "铜",
	alu: "铝",
	zn: "锌",
	sn: "锡",
	pb: "铅",
	ni: "镍"
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const subdomain = SUB_DOMAIN_MAP[category];
	if (!subdomain) throw new Error("未知的金属类型");
	const url = `https://${subdomain}`;
	const $ = load((await got_default({
		method: "get",
		url
	})).data);
	const items = $(".content1-text-div").toArray().map((item) => {
		const $item = $(item);
		const dataId = $item.attr("data-id");
		const $top = $item.find(".top");
		const region = $top.find(".left").first().contents().filter((_, e) => e.type === "text").text().trim();
		const dateStr = $top.find(".time").text().trim();
		const metal = $top.find(".right").first().text().trim();
		const $priceSpan = $top.find("span.clearfloat");
		const minPriceLabel = $priceSpan.find(".left").text().trim();
		const maxPriceLabel = $priceSpan.find(".right").text().trim();
		const $avgSpan = $item.find(".bottom").find(".up_down_span");
		const avgPrice = $avgSpan.contents().filter((_, e) => e.type === "text").text().trim();
		const changeStr = $avgSpan.find(".up_down").text().trim();
		const changeNum = Number(changeStr);
		let icon;
		if (changeNum > 0) icon = "🔴";
		else if (changeNum < 0) icon = "🟢";
		return {
			title: `${icon ? icon + " " : ""}${region} ${metal} 调价: ${changeStr} (均价 ${avgPrice})`,
			description: renderToString(/* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
				/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("strong", { children: "品类" }) }), /* @__PURE__ */ jsx("td", { children: metal })] }),
				/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("strong", { children: "厂商" }) }), /* @__PURE__ */ jsx("td", { children: region })] }),
				/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("strong", { children: "均价" }) }), /* @__PURE__ */ jsx("td", { children: avgPrice })] }),
				/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("strong", { children: "涨跌" }) }), /* @__PURE__ */ jsxs("td", { children: [icon ?? "", changeStr] })] }),
				/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("strong", { children: "价格范围" }) }), /* @__PURE__ */ jsxs("td", { children: [
					minPriceLabel,
					" - ",
					maxPriceLabel
				] })] })
			] }) })),
			link: `${url}/quota/${dataId}.html`,
			guid: dataId,
			pubDate: timezone(parseDate(dateStr, "MM-DD"), 8)
		};
	});
	return {
		title: `长江有色网 - 调价动态 - ${READABLE_CATEGORIES[category]}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
