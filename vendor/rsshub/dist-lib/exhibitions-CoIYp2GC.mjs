import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/dpm/namespace.ts
const namespace = {
	name: "The Palace Museum",
	url: "www.dpm.org.cn",
	zh: { name: "故宫博物院" }
};
//#endregion
//#region lib/routes/dpm/exhibitions.tsx
const TYPE_MAP = {
	temporary_exhibitions: {
		cid: "1",
		name: "特展"
	},
	galleries: {
		cid: "246",
		name: "专馆"
	},
	longterm_exhibitions: {
		cid: "10",
		name: "常设展览"
	},
	period_halls: {
		cid: "163",
		name: "原状陈列"
	}
};
const route = {
	path: "/exhibitions/:type?",
	categories: ["travel"],
	example: "/dpm/exhibitions/temporary_exhibitions",
	parameters: { type: "Exhibition type, supported values: temporary_exhibitions（特展）、galleries（专馆）、longterm_exhibitions（常设展览）、period_halls（原状陈列）. Default: Current Exhibitions." },
	name: "Current Exhibitions",
	maintainers: ["magazian"],
	radar: [{
		source: ["www.dpm.org.cn/classify/exhibition.html"],
		target: "/exhibitions"
	}],
	handler: async (ctx) => {
		const baseUrl = "https://www.dpm.org.cn";
		const apiUrl = `${baseUrl}/searchs/exhibition.html`;
		const typeParam = ctx.req.param("type");
		const currentType = typeParam ? TYPE_MAP[typeParam] : void 0;
		const searchParams = {
			[Math.random().toString()]: "",
			category_id: "169",
			old_year: "1",
			order_datetimes: "1",
			showstype: "301",
			pagesize: "50"
		};
		if (currentType?.cid) searchParams.type_cid = currentType.cid;
		const response = await got_default({
			method: "get",
			url: apiUrl,
			headers: {
				referer: "https://www.dpm.org.cn/classify/exhibition.html",
				"X-Requested-With": "XMLHttpRequest"
			},
			searchParams
		});
		const museumName = namespace.zh?.name || namespace.name;
		const titleTag = currentType ? currentType.name : "正在展览";
		const $ = load(response.data);
		const rawItems = $(".item").toArray().map((item) => {
			const $item = $(item);
			const title = $item.find("a.aa").attr("title") || "";
			const status = $item.find(".label").text().trim();
			if (status.includes("结束") || status.includes("暂闭")) return null;
			const rawImg = $item.find("img").attr("src");
			const imgUrl = `${baseUrl}${rawImg}`;
			const pTags = $item.find(".desc p");
			const location = pTags.eq(0).text().replaceAll("展览地点：", "").trim();
			const duration = pTags.eq(1).contents().filter((_, el) => el.nodeType === 3).text().replaceAll("展览时间：", "").trim();
			const isIncomplete = duration.endsWith("-") || !duration.includes("-");
			const rawLink = $item.find("a.aa").attr("href");
			const hasNoLink = !rawLink;
			const itemLink = hasNoLink ? `https://www.dpm.org.cn/classify/exhibition.html#no-details-${encodeURIComponent(title)}-${duration.replaceAll("-", "")}` : rawLink.startsWith("http") ? rawLink : `${baseUrl}${rawLink}`;
			const cacheKey = hasNoLink ? `dpm-exhibit-${title}-${duration}` : itemLink;
			return cache_default.tryGet(cacheKey, async () => {
				let fullDuration = duration;
				if (!hasNoLink && isIncomplete) {
					const detailTime = load((await got_default({
						method: "get",
						url: itemLink
					})).data)(".time em").text().trim();
					if (detailTime) fullDuration = detailTime.replaceAll(/[\r\n]+/g, " ").replaceAll(/\s+/g, " ");
				}
				if (!/\d{4}/.test(fullDuration)) fullDuration = "未定/常设";
				const dateMatches = fullDuration.replaceAll(/[./]/g, "-").match(/\d{4}-\d{2}-\d{2}/g);
				let startDate;
				let endDate;
				if (dateMatches) {
					startDate = dateMatches[0];
					if (dateMatches.length >= 2) endDate = dateMatches[1];
				}
				const pubDate = startDate ? parseDate(startDate) : void 0;
				const description = renderToString(/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx("img", { src: imgUrl }),
					/* @__PURE__ */ jsx("br", {}),
					/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "地点：" }), location] }),
					/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "开展：" }), startDate ?? "未定/常设"] }),
					/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "闭展：" }), endDate ?? "未定/常设"] }),
					/* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsxs("small", { children: ["原始展期：", fullDuration] }) }),
					hasNoLink && /* @__PURE__ */ jsx("p", {
						style: { color: "#ff4d4f" },
						children: /* @__PURE__ */ jsx("b", { children: "注：该展览暂无详情页，已链接至官网院内展览页" })
					})
				] }));
				return {
					title,
					link: itemLink,
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
		});
		const items = (await Promise.all(rawItems)).filter((item) => item !== null);
		return {
			title: `${museumName} - ${titleTag}`,
			link: `${baseUrl}/classify/exhibition.html`,
			language: "zh-CN",
			item: items
		};
	}
};
//#endregion
export { route };
