import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-BwCHl05z.mjs";
import markdownit from "markdown-it";
//#region lib/routes/lanqiao/courses.ts
const route = {
	path: "/courses/:sort/:tag",
	categories: ["programming"],
	example: "/lanqiao/courses/latest/all",
	parameters: {
		sort: "排序规则 sort, 默认(`default`)、最新(`latest`)、最热(`hotest`)",
		tag: "课程标签 `tag`，可在该页面找到：https://www.lanqiao.cn/courses/"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "全站发布的课程",
	maintainers: ["huhuhang"],
	handler
};
async function handler(ctx) {
	const sort = ctx.req.param("sort");
	const tag = ctx.req.param("tag");
	const data = (await got_default({
		method: "get",
		url: `https://www.lanqiao.cn/api/v2/courses/?sort=${sort}&tag=${tag}&include=name,description,picture_url,id`
	})).data.results;
	const md = new markdownit();
	const courseType = {
		free: "免费课",
		member: "会员课",
		limit_free: "限时免费",
		louplus: "楼+",
		bootcamp: "训练营",
		private: "私有课",
		exam: "考试"
	};
	const items = await Promise.all(data.map((item) => cache_default.tryGet(`https://www.lanqiao.cn/api/v2/courses/${item.id}/`, async () => {
		const course = (await got_default({
			method: "get",
			url: `https://www.lanqiao.cn/api/v2/courses/${item.id}/`
		})).data;
		item.title = `${course.name} [${courseType[course.fee_type]}]`;
		item.description = utils_default.courseDesc(course.picture_url, md.render(course.long_description));
		item.author = course.teacher.name;
		item.link = `https://www.lanqiao.cn/courses/${course.id}/`;
		return item;
	})));
	const sortType = {
		latest: "最新",
		hotest: "最热",
		default: "默认"
	};
	return {
		title: `蓝桥云课${sortType[sort]}课程列表【${tag}】`,
		link: `https://www.lanqiao.cn/courses/?sort=${sort}&tag=${tag}`,
		description: `蓝桥云课【${tag}】标签下${sortType[sort]}课程列表`,
		item: items
	};
}
//#endregion
export { route };
