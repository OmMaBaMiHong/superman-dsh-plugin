import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/hnu/careers.ts
const route = {
	path: "/careers",
	categories: ["university"],
	example: "/hnu/careers",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["scc.hnu.edu.cnundefined"] }],
	name: "校园招聘",
	maintainers: ["ningyougan"],
	handler,
	url: "scc.hnu.edu.cnundefined"
};
async function handler() {
	const rootUrl = "http://scc.hnu.edu.cn/";
	const currentRoute = `${rootUrl}module/getcareers`;
	return {
		title: "校园招聘",
		link: currentRoute,
		item: (await got_default({
			method: "get",
			url: `${currentRoute}?start_page=1&type=inner&day=&count=20&start=1`
		})).data.data.map((company_info) => {
			return {
				title: company_info.company_name,
				link: `${rootUrl}detail/career?id=${company_info.career_talk_id}`,
				description: company_info.address + " - " + company_info.meet_time + " - " + company_info.professionals,
				category: company_info.company_property + " - " + company_info.city_name
			};
		})
	};
}
//#endregion
export { route };
