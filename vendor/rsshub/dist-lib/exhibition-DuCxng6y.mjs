import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/chnmus/namespace.ts
const namespace = {
	name: "Henan Museum",
	url: "www.chnmus.net",
	zh: { name: "河南博物院" }
};
//#endregion
//#region lib/routes/chnmus/exhibition.tsx
const extractDates = (durationStr) => {
	let startDate;
	let endDate;
	if (!durationStr) return {
		startDate,
		endDate
	};
	const parts = durationStr.split(/——|[-—~]/).map((p) => p.trim());
	const startStr = parts[0];
	const endStr = parts[1];
	let startYear;
	let startMonth;
	const startMatch = startStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
	if (startMatch) {
		startYear = startMatch[1];
		startMonth = startMatch[2].padStart(2, "0");
		const startDay = startMatch[3].padStart(2, "0");
		startDate = `${startYear}-${startMonth}-${startDay}`;
	}
	if (endStr && startDate) {
		const endMatch = endStr.match(/(?:(\d{4})年)?(?:(\d{1,2})月)?(\d{1,2})日/);
		if (endMatch) {
			const matchYear = endMatch[1];
			const matchMonth = endMatch[2]?.padStart(2, "0");
			const matchDay = endMatch[3].padStart(2, "0");
			endDate = `${matchYear || startYear}-${matchMonth || startMonth}-${matchDay}`;
		}
	}
	return {
		startDate,
		endDate
	};
};
const route = {
	path: "/information/exhibition/:type?",
	categories: ["travel"],
	example: "/chnmus/information/exhibition/special",
	parameters: { type: "Exhibition type, supported values: special（特展详情）. Default: All." },
	name: "Special Exhibitions",
	maintainers: ["magazian"],
	radar: [{
		source: ["www.chnmus.net/ch/information/exhibition/index.html"],
		target: "/information/exhibition"
	}],
	handler: async (ctx) => {
		const isSpecial = ctx.req.param("type") === "special";
		const apiUrl = `https://www.chnmus.net/ch/information/exhibition/index.html`;
		const museumName = namespace.zh?.name || namespace.name;
		const $ = load((await got_default({
			method: "get",
			url: apiUrl
		})).data);
		const list = $(".col-md-6.d-flex.fadeInBottom").toArray().map((item) => {
			const $item = $(item);
			const link = $item.attr("href");
			const imgUrlRaw = $item.find(".lazyload").attr("data-bg");
			return {
				title: $item.find(".common-component-box-title").text(),
				itemLink: `https:${link}`,
				imgUrl: `https:${imgUrlRaw}`
			};
		});
		const items = await Promise.all(list.map((item) => {
			const cacheKey = isSpecial ? `${item.itemLink}-special` : item.itemLink;
			return cache_default.tryGet(cacheKey, async () => {
				const content = load((await got_default({
					method: "get",
					url: item.itemLink
				})).data);
				const pubDate = parseDate(content(".common-component-content-attribute-item").toArray().map((el) => content(el).text()).find((text) => text.includes("发布日期")).replaceAll("发布日期:", "").trim());
				if (!isSpecial) return {
					title: item.title,
					link: item.itemLink,
					pubDate,
					description: renderToString(/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("img", { src: item.imgUrl }) }))
				};
				const texts = content(".common-component-content-text p").toArray().map((el) => content(el).text());
				const title = texts.find((text) => text.includes("展览名称："))?.replaceAll("展览名称：", "");
				if (!title) return {};
				const location = texts.find((text) => text.includes("展览地点：")).replaceAll("展览地点：", "").trim();
				const fullDuration = texts.find((text) => text.includes("展览时间：") || text.includes("开展时间："))?.replaceAll(/(展览|开展)时间：/g, "")?.trim();
				const { startDate, endDate } = extractDates(fullDuration || "");
				const { imgUrl, itemLink } = item;
				return {
					title,
					link: itemLink,
					pubDate,
					description: renderToString(/* @__PURE__ */ jsxs("div", { children: [
						/* @__PURE__ */ jsx("img", { src: imgUrl }),
						/* @__PURE__ */ jsx("br", {}),
						/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "地点：" }), location] }),
						/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "开展：" }), startDate ?? "未定/常设"] }),
						/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "闭展：" }), endDate ?? "未定/常设"] }),
						fullDuration && /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsxs("small", { children: ["原始展期：", fullDuration] }) })
					] })),
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
		}));
		return {
			title: `${museumName} - 展览资讯${isSpecial ? " - 特展详情" : ""}`,
			link: apiUrl,
			language: "zh-CN",
			item: items.filter((item) => item.title)
		};
	}
};
//#endregion
export { route };
