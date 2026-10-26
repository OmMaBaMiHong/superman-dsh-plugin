import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/earthquake/index.ts
const route = {
	path: "/:region?",
	categories: ["forecast"],
	example: "/earthquake",
	parameters: { region: "区域，0全部，1国内（默认），2国外" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.cea.gov.cn/cea/xwzx/zqsd/index.html", "www.cea.gov.cn/"],
		target: ""
	}],
	name: "中国地震局",
	maintainers: ["LogicJake"],
	handler,
	url: "www.cea.gov.cn/cea/xwzx/zqsd/index.html",
	description: "可通过全局过滤参数订阅您感兴趣的地区."
};
async function handler(ctx) {
	return {
		title: "中国地震局震情速递",
		link: "https://www.cea.gov.cn/cea/xwzx/zqsd/index.html",
		item: (await got_default({
			method: "post",
			url: "https://www.cea.gov.cn/eportal/ui?struts.portlet.mode=view&struts.portlet.action=/portlet/expressEarthquake!queryExpressEarthquakeList.action&pageId=363409&moduleId=a852ba487b534470a84a30f00e7d6670",
			form: {
				region: ctx.req.param("region") ?? 1,
				dateType: 2,
				magnitude: 0
			}
		})).data.map((item) => {
			const { id, epicenter, latitudes, longitudes, depth, orig_time, num_mag } = item;
			const date = orig_time;
			const num = num_mag;
			const description = `北京时间${date}，${epicenter}（纬度${latitudes}度，经度${longitudes}度）发生${num}级地震，震源深度${depth}千米`;
			return {
				title: `${epicenter}发生${num}级地震`,
				link: `https://www.cea.gov.cn/eportal/ui?struts.portlet.mode=view&struts.portlet.action=/portlet/expressEarthquake!toNewInfoView.action&pageId=366521&id=${id}`,
				pubDate: timezone(parseDate(date, "YYYY-MM-DD HH:mm:ss"), 8),
				description
			};
		})
	};
}
//#endregion
export { route };
