import { t as utils_default } from "./utils-D9CQ324O2.mjs";
//#region lib/routes/dapenti/subject.ts
const route = {
	path: "/subject/:id",
	categories: ["picture"],
	example: "/dapenti/subject/184",
	parameters: { id: "主题 id" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "主题",
	maintainers: ["xyqfer"],
	handler
};
async function handler(ctx) {
	return await utils_default.parseFeed({ subjectid: ctx.req.param("id") });
}
//#endregion
export { route };
