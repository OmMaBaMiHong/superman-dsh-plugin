import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/hitcon/zeroday.tsx
const route = {
	name: "漏洞",
	categories: ["programming"],
	path: "/zeroday/vulnerability/:status?",
	example: "/hitcon/zeroday/vulnerability",
	parameters: { status: "漏洞状态，见下表" },
	maintainers: ["KarasuShin"],
	radar: [{ source: ["zeroday.hitcon.org/vulnerability/:status?"] }],
	features: { requirePuppeteer: true },
	handler,
	description: `| 缺省   | all  | closed | disclosed | patching |
| ------ | ---- | ------ | --------- | -------- |
| 活動中 | 全部 | 關閉   | 公開      | 修補中   |`
};
const baseUrl = "https://zeroday.hitcon.org/vulnerability";
const titleMap = {
	all: "全部",
	closed: "關閉",
	disclosed: "公開",
	patching: "修補中"
};
async function handler(ctx) {
	let url = baseUrl;
	const status = ctx.req.param("status");
	if (status) url += `/${status}`;
	const context = await outPlaywright();
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		route.request().resourceType() === "document" ? route.continue() : route.abort();
	});
	logger.http(`Requesting ${url}`);
	await page.goto(url, { waitUntil: "domcontentloaded" });
	const response = await page.evaluate(() => document.documentElement.innerHTML);
	await context.close();
	const $ = load(response);
	const items = $(".zdui-strip-list>li").toArray().map((el) => {
		const title = $(el).find(".title a");
		const vulData = $(el).find(".vul-data");
		const code = vulData.find(".code").contents().filter((_, el) => el.nodeType === 3).text();
		const risk = vulData.find(".risk span").eq(1).text();
		const vender = vulData.find(".vender").find(".v-name-full").text();
		const status = vulData.find(".status").text().replace("Status:", "").trim();
		const date = vulData.find(".date").text().replace("Date:", "").trim();
		const reporter = vulData.find(".zdui-author-badge").find("a>span").text();
		const description = renderToString(/* @__PURE__ */ jsxs("ul", { children: [
			/* @__PURE__ */ jsx("li", { children: vender }),
			/* @__PURE__ */ jsxs("li", { children: ["ZDID: ", code] }),
			/* @__PURE__ */ jsxs("li", { children: ["風險: ", risk] }),
			/* @__PURE__ */ jsxs("li", { children: ["處理狀態: ", status] }),
			/* @__PURE__ */ jsxs("li", { children: ["通報者: ", reporter] }),
			/* @__PURE__ */ jsxs("li", { children: ["通報日期: ", date] })
		] }));
		return {
			title: title.text(),
			link: title.attr("href"),
			description,
			pubDate: parseDate(date)
		};
	});
	return {
		title: status ? titleMap[status] ?? "ZeroDay" : "活動中",
		link: url,
		item: items,
		image: "https://zeroday.hitcon.org/images/favicon/favicon.png"
	};
}
//#endregion
export { route };
