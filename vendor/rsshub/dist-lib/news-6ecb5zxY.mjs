import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/ecust/e/news.ts
const baseUrl = "https://e.ecust.edu.cn";
const route = {
	path: "/jxjy/news",
	categories: ["university"],
	example: "/ecust/jxjy/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["e.ecust.edu.cn/engine2/m/38F638B77773ADD3", "e.ecust.edu.cn/"] }],
	name: "继续教育学院 - 学院公告",
	maintainers: ["jialinghui"],
	handler,
	url: "e.ecust.edu.cn/engine2/m/38F638B77773ADD3"
};
async function handler() {
	const { data: response } = await got_default.post(`${baseUrl}/engine2/general/1301/type/more-datas`, { form: {
		engineInstanceId: 1732458,
		pageNum: 1,
		pageSize: 20,
		typeId: 4562497,
		topTypeId: "",
		sw: ""
	} });
	const list = response.data.datas.datas.map((item) => ({
		title: item["1"].value,
		link: item.url.startsWith("http") ? item.url : `${baseUrl}/engine2/d/${item.id}/${item.engineInstanceId}/0`,
		pubDate: timezone(parseDate(item["6"].value), 8)
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		if (item.link.includes("toPhoneSign")) return item;
		const { data: response } = await got_default(item.link);
		item.description = JSON.parse(response.match(/"content":(".*")(?:,"sequence":\d+)?,"typePath"/)[1]);
		return item;
	})));
	return {
		title: "华东理工继续教育学院",
		description: "学院公告",
		link: `${baseUrl}/engine2/m/38F638B77773ADD3`,
		item: items
	};
}
//#endregion
export { route };
