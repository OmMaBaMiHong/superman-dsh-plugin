import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/outagereport/index.ts
const baseUrl = "https://outage.report/";
const route = {
	path: "/:name/:count?",
	categories: ["forecast"],
	example: "/outagereport/ubisoft/5",
	parameters: {
		name: "Service name, spelling format must be consistent with URL",
		count: "Counting threshold, will only be written in RSS if the number of people who report to stop serving is not less than this number"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Report",
	maintainers: ["cxumol", "nczitzk"],
	handler,
	description: "Please skip the local service area code for `name`, for example `https://outage.report/us/verizon-wireless` to `verizon-wireless`."
};
async function handler(ctx) {
	const serviceName = ctx.req.param("name");
	const watchCount = ctx.req.param("count") || 10;
	const url = `${baseUrl}${serviceName}`;
	const html = (await got_default({
		method: "get",
		url
	})).data;
	const gaugeRegexp = /class="Gauge__Count.*?>(\d+)<\/text>/;
	const gaugeTextRegexp = /class="Gauge__MessageWrapper.*?class="Gauge__Message[^>]*>(.*?)<\/span>/;
	const rssDescribeRegexp = /<p class="PageSubheader[^>]*>(.*?)<\/p>/;
	const gaugeCount = Number(html.match(gaugeRegexp)[1]);
	const gaugeText = html.match(gaugeTextRegexp)[1];
	const rssDescribe = html.match(rssDescribeRegexp)[1];
	const outageHistory = [];
	if (gaugeCount >= watchCount) {
		const outageReportItem = {
			title: `${serviceName} appear to be (partially) down`,
			description: String(gaugeCount) + " " + gaugeText,
			pubDate: (/* @__PURE__ */ new Date()).toUTCString(),
			guid: Date.now(),
			link: url
		};
		outageHistory.push(outageReportItem);
	}
	return {
		title: `Is ${serviceName} Down Right Now?`,
		link: url,
		description: rssDescribe,
		item: outageHistory,
		allowEmpty: true
	};
}
//#endregion
export { route };
