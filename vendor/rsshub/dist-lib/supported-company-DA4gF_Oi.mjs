import { t as utils_default } from "./utils-QkYwN0Qe.mjs";
//#region lib/routes/kuaidi100/supported-company.ts
const route = {
	path: "/company",
	categories: ["other"],
	example: "/kuaidi100/company",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["kuaidi100.com/"] }],
	name: "支持的快递公司列表",
	maintainers: ["NeverBehave"],
	handler,
	url: "kuaidi100.com/"
};
async function handler() {
	return {
		title: "快递100 快递列表",
		link: "https://www.kuaidi100.com",
		description: "快递100 所支持的快递列表及其查询名称",
		item: (await utils_default.company()).map((item) => ({
			title: item.name,
			description: item.number,
			category: item.comTypeName,
			link: item.siteUrl
		}))
	};
}
//#endregion
export { route };
