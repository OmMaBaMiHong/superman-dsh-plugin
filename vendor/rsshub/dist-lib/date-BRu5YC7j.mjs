import { t as utils } from "./utils-ArOe2Wm7.mjs";
//#region lib/routes/sobooks/date.ts
const route = {
	path: "/date/:date?",
	categories: ["reading"],
	example: "/sobooks/date/2020-11",
	parameters: { date: "日期，见例子，默认为当前年月" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["sobooks.net/:category"],
		target: "/:category"
	}],
	name: "归档",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	return await utils(ctx, `books/date/${(ctx.req.param("date") ?? `${(/* @__PURE__ */ new Date()).getFullYear()}/${(/* @__PURE__ */ new Date()).getMonth()}`).replace("-", "/")}`);
}
//#endregion
export { route };
