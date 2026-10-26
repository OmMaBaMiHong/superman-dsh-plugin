import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import dayjs from "dayjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/iknowwhatyoudownload/daily.tsx
const route = {
	path: "/stats/daily/:country",
	categories: ["other"],
	example: "/iknowwhatyoudownload/stats/daily/CN",
	url: "iknowwhatyoudownload.com",
	name: "Daily Torrents Statistics",
	maintainers: ["p3psi-boo"],
	parameters: { country: "the country of the stats. ISO 3166-1 alpha-2 code." },
	handler
};
async function handler(ctx) {
	const { country } = ctx.req.param();
	const baseUrl = `https://iknowwhatyoudownload.com/en/stat/${country}/daily/q?statDate=`;
	const dates = Array.from({ length: 7 }, (_, i) => dayjs().subtract(i, "day"));
	const items = (await Promise.all(dates.map((dateObj) => {
		const dateFormatted = dateObj.format("YYYY-MM-DD");
		const url = `${baseUrl}${dateFormatted}`;
		return cache_default.tryGet(url, async () => {
			const response = await got_default({
				method: "get",
				url
			});
			if (!response) return {};
			const $ = load(response.data);
			const numStats = [];
			$(".usePercent").each((_, elem) => {
				numStats.push({
					percent: $(elem).text(),
					desc: $(elem).parent().find("span").last().text()
				});
			});
			const tableData = [];
			const dataMatch = response.data.match(/data:\s*\[([\d",\s]+)\]/);
			const labelsMatch = response.data.match(/labels:\s*\[(.*?)\]/);
			if (dataMatch?.[1] && labelsMatch?.[1]) {
				const dataList = dataMatch[1].split(",").map((s) => s.trim().replaceAll("\"", ""));
				const labelsList = labelsMatch[1].split(",").map((s) => s.replaceAll("\"", "").trim()).filter((i) => i !== "");
				for (const index in labelsList) {
					const label = labelsList[index];
					const count = dataList[index];
					const [key, percent] = label.split(" ");
					tableData.push({
						key,
						count,
						percent
					});
				}
			}
			const topList = $(".tab-pane").toArray().map((item) => ({
				title: $(item).attr("id")?.toUpperCase(),
				content: $(item).find("ul").toString()
			}));
			const content = renderToString(/* @__PURE__ */ jsxs("article", { children: [
				/* @__PURE__ */ jsxs("div", {
					class: "stats",
					children: [/* @__PURE__ */ jsx("h1", { children: "Torrent download statistics" }), /* @__PURE__ */ jsx("ul", { children: numStats.map((stat) => /* @__PURE__ */ jsxs("li", { children: [
						/* @__PURE__ */ jsx("span", { children: stat.percent }),
						" ",
						stat.desc
					] })) })]
				}),
				/* @__PURE__ */ jsxs("div", {
					class: "table-view",
					children: [/* @__PURE__ */ jsx("h1", { children: "Table View" }), tableData ? /* @__PURE__ */ jsxs("table", { children: [/* @__PURE__ */ jsxs("tr", { children: [
						/* @__PURE__ */ jsx("th", { children: "Category" }),
						/* @__PURE__ */ jsx("th", { children: "Count" }),
						/* @__PURE__ */ jsx("th", { children: "Percent" })
					] }), tableData.map((row) => /* @__PURE__ */ jsxs("tr", { children: [
						/* @__PURE__ */ jsx("td", { children: row.key }),
						/* @__PURE__ */ jsx("td", { children: row.count }),
						/* @__PURE__ */ jsx("td", { children: row.percent })
					] }))] }) : null]
				}),
				/* @__PURE__ */ jsxs("div", {
					class: "top-list",
					children: [/* @__PURE__ */ jsx("h1", { children: "Top List" }), topList.map((entry) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("h2", { children: entry.title }), raw(entry.content)] }))]
				})
			] }));
			return {
				title: `Daily Torrents Statistics in ${country} for ${dateFormatted}`,
				link: url,
				description: content,
				pubDate: dateObj.toDate()
			};
		});
	}))).filter((item) => Object.keys(item).length > 0);
	return {
		title: `Daily Torrents Statistics in ${country} - iknownwhatyoudownload`,
		link: "https://iknowwhatyoudownload.com",
		item: items
	};
}
//#endregion
export { route };
