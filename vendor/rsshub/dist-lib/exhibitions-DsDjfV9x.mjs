import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as namespace } from "./namespace-CuHoQMDK.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/sdmuseum/exhibitions.tsx
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
	path: "/exhibitions",
	categories: ["travel"],
	example: "/sdmuseum/exhibitions",
	parameters: {},
	name: "Temporary Exhibitions",
	maintainers: ["magazian"],
	radar: [{
		source: ["www.sdmuseum.com/col/col271702/index.html"],
		target: "/exhibitions"
	}],
	handler: async () => {
		const baseUrl = "https://www.sdmuseum.com";
		const apiUrl = `${baseUrl}/col/col271702/index.html`;
		const museumName = namespace.zh?.name || namespace.name;
		const $ = load((await got_default({
			method: "get",
			url: apiUrl
		})).data, { xml: true });
		const items = await Promise.all($("record").toArray().map((el) => {
			const $item = load($(el).text());
			const title = $item(".ltit a").attr("title");
			const link = new URL($item(".ltit a").attr("href"), baseUrl).href;
			const imgUrlRaw = $item(".img img").attr("src") || "";
			const imgUrl = new URL(imgUrlRaw, baseUrl).href;
			const location = $item(".item.add").text().trim();
			const fullDuration = $item(".item.time").text().trim();
			const fullDurationDate = fullDuration.replace(/开展时间\s*[:：]\s*/, "").trim();
			const { startDate, endDate } = extractDates(fullDurationDate);
			return cache_default.tryGet(link, async () => {
				const pubDate = parseDate(load((await got_default({
					method: "get",
					url: link
				})).data)("meta[name=\"PubDate\"]").attr("content") || "", "YYYY-MM-DD HH:mm");
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
					link,
					pubDate,
					description,
					_extra: {
						museumName,
						title,
						location,
						startDate,
						endDate,
						itemLink: link
					}
				};
			});
		}));
		return {
			title: `${museumName} - 临时展览`,
			link: apiUrl,
			language: "zh-CN",
			item: items
		};
	}
};
//#endregion
export { route };
