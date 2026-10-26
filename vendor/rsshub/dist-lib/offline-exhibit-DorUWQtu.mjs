import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/shanghaimuseum/namespace.ts
const namespace = {
	name: "Shanghai Museum",
	url: "www.shanghaimuseum.net",
	zh: { name: "上海博物馆" }
};
//#endregion
//#region lib/routes/shanghaimuseum/offline-exhibit.tsx
const route = {
	path: "/display/offline-exhibit/:type?",
	categories: ["travel"],
	example: "/shanghaimuseum/display/offline-exhibit/PRESENT",
	parameters: { type: "Exhibition type, supported values: PRESENT (当期展览) | PAST (往期展览). Default: All exhibitions (both PRESENT and PAST)." },
	name: "Special Exhibitions",
	maintainers: ["magazian"],
	radar: [{
		source: ["www.shanghaimuseum.net/mu/frontend/pg/display/offline-exhibit"],
		target: "/display/offline-exhibit"
	}],
	handler: async (ctx) => {
		const type = ctx.req.param("type")?.toUpperCase();
		const baseUrl = "https://www.shanghaimuseum.net";
		const apiUrl = `${baseUrl}/mu/frontend/pg/display/search-exhibit`;
		const fetchExhibits = async (status, limit = 20) => {
			return (await got_default.post(apiUrl, { json: {
				limit,
				page: 1,
				params: {
					exhibitTypeCode: "OFFLINE_EXHIBITION",
					langCode: "CHINESE",
					offlineExhibitionType: status
				}
			} })).data?.data || [];
		};
		let rawItems = [];
		let titleTag = "";
		if (type === "PAST" || type === "PRESENT") {
			rawItems = await fetchExhibits(type, 50);
			titleTag = type === "PAST" ? "往期展览" : "当期展览";
		} else {
			const [presentItems, pastItems] = await Promise.all([fetchExhibits("PRESENT", 50), fetchExhibits("PAST", 20)]);
			rawItems = [...presentItems, ...pastItems];
			titleTag = "当期展览&往期展览";
		}
		const museumName = namespace.zh?.name || namespace.name;
		const items = rawItems.map((item) => {
			const title = item.name;
			const itemLink = `${baseUrl}/mu/frontend/pg/article/id/${item.code}`;
			const imgUrl = item.picPath ? `${baseUrl}/${item.picPath}` : "";
			const location = item.exhibitPlace || "上海博物馆";
			const pubDate = parseDate(item.issueTime);
			const fullDuration = item.exhibitDateRange || "";
			const [startDate, endDate] = fullDuration.includes(" - ") ? fullDuration.split(" - ").map((s) => s.trim()) : [fullDuration, ""];
			return {
				title,
				link: itemLink,
				pubDate,
				description: renderToString(/* @__PURE__ */ jsxs("div", { children: [
					imgUrl && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: imgUrl }), /* @__PURE__ */ jsx("br", {})] }),
					/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "地点：" }), location] }),
					/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "开展：" }), startDate ?? "未定/常设"] }),
					/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "闭展：" }), endDate ?? "未定/常设"] }),
					fullDuration && /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsxs("small", { children: ["原始展期：", fullDuration.split("\n").map((line, i) => /* @__PURE__ */ jsxs("span", { children: [line, /* @__PURE__ */ jsx("br", {})] }, i))] }) })
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
		return {
			title: `${museumName} - 特别展览 - ${titleTag}`,
			link: `${baseUrl}/mu/frontend/pg/display/offline-exhibit`,
			language: "zh-CN",
			item: items
		};
	}
};
//#endregion
export { route };
