import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/hebeimuseum/namespace.ts
const namespace = {
	name: "Hebei Museum",
	url: "www.hebeimuseum.org.cn",
	zh: { name: "河北博物院" }
};
//#endregion
//#region lib/routes/hebeimuseum/list.tsx
const extractDates = (durationStr) => {
	let startDate;
	let endDate;
	if (!durationStr) return {
		startDate,
		endDate
	};
	const parts = durationStr.split(/[-—~]+/).map((p) => p.trim());
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
	path: "/list/:type?",
	categories: ["travel"],
	example: "/hebeimuseum/list/special",
	parameters: { type: "Exhibition type, supported values: special（临时展览详情）. Default: All." },
	name: "Temporary Exhibitions",
	maintainers: ["magazian"],
	radar: [{
		source: ["www.hebeimuseum.org.cn/list-26-1.html"],
		target: "/list"
	}],
	handler: async (ctx) => {
		const isSpecial = ctx.req.param("type") === "special";
		const baseUrl = "https://www.hebeimuseum.org.cn";
		const apiUrl = `${baseUrl}/list-26-1.html`;
		const museumName = namespace.zh?.name || namespace.name;
		const $ = load((await got_default({
			method: "get",
			url: apiUrl
		})).data);
		const list = $(".main1wrap ul.list li a").toArray().map((item) => {
			const $item = $(item);
			const link = $item.attr("href");
			const imgUrlRaw = $item.find("figure img").attr("src");
			return {
				title: $item.find("p.name").text(),
				itemLink: link,
				imgUrl: `${baseUrl}${imgUrlRaw}`
			};
		});
		const items = await Promise.all(list.map((item) => {
			const cacheKey = isSpecial ? `${item.itemLink}-special` : item.itemLink;
			return cache_default.tryGet(cacheKey, async () => {
				const content = load((await got_default({
					method: "get",
					url: item.itemLink
				})).data);
				const pubDate = parseDate(content(".article .info .infowrap img.icon_time").next("span").text().replaceAll("时间：", "").trim());
				if (!isSpecial) return {
					title: item.title,
					link: item.itemLink,
					pubDate,
					description: renderToString(/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("img", { src: item.imgUrl }) }))
				};
				let rawText = content(".content.f16").text() || "";
				rawText = rawText.replaceAll(/\s+/g, "");
				const texts = rawText.split(/(?=展览名称：|展览时间：|时间：|展览地点：|展出地点：|地点：)/);
				const fullDuration = texts.find((text) => text.includes("时间："))?.replaceAll(/(?:展览)?时间：/g, "")?.trim();
				if (!fullDuration) return {};
				let location = texts.find((text) => text.includes("地点："))?.replaceAll(/(?:展(?:览|出))?地点：/g, "")?.trim() || "";
				location = (location.match(/^.*?展厅/) || [""])[0];
				let title = texts.find((text) => text.includes("展览名称："))?.replaceAll("展览名称：", "");
				if (!title) {
					const quoteMatch = item.title.match(/[“《](.*?)[”》]/);
					if (quoteMatch) title = quoteMatch[1];
					else if (item.title.includes("|")) title = item.title.split("|").at(-1);
				}
				const { startDate, endDate } = extractDates(fullDuration || "");
				const { imgUrl, itemLink } = item;
				const description = renderToString(/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx("img", { src: imgUrl }),
					/* @__PURE__ */ jsx("br", {}),
					/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "地点：" }), location] }),
					/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "开展：" }), startDate ?? "未定/常设"] }),
					/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "闭展：" }), endDate ?? "未定/常设"] }),
					fullDuration && /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsxs("small", { children: ["原始展期：", fullDuration] }) })
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
		}));
		return {
			title: `${museumName} - 临时展览${isSpecial ? " - 特展详情" : ""}`,
			link: apiUrl,
			language: "zh-CN",
			item: items.filter((item) => item.title)
		};
	}
};
//#endregion
export { route };
