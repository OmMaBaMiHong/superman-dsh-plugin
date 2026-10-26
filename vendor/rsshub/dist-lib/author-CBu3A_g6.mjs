import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-BwCHl05z.mjs";
import markdownit from "markdown-it";
//#region lib/routes/lanqiao/author.ts
async function getUsername(uid) {
	return (await got_default({
		method: "get",
		url: `https://www.lanqiao.cn/api/v2/users/${uid}/`,
		headers: { Referer: `https://www.lanqiao.cn/users/${uid}/` }
	})).data.name;
}
const route = {
	path: "/author/:uid",
	categories: ["programming"],
	example: "/lanqiao/author/1701267",
	parameters: { uid: "作者 `uid` 可在作者主页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["lanqiao.cn/users/:uid"] }],
	name: "作者发布的课程",
	maintainers: ["huhuhang"],
	handler
};
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	const username = await getUsername(uid);
	const data = (await got_default({
		method: "get",
		url: `https://www.lanqiao.cn/api/v2/users/${uid}/courses/?type=published`,
		headers: { Referer: `https://www.lanqiao.cn/users/${uid}/` }
	})).data.results;
	const md = new markdownit();
	const items = await Promise.all(data.map((item) => cache_default.tryGet(`https://www.lanqiao.cn/api/v2/courses/${item.id}/`, async () => {
		const course = (await got_default({
			method: "get",
			url: `https://www.lanqiao.cn/api/v2/courses/${item.id}/`
		})).data;
		item.title = course.name;
		item.description = utils_default.courseDesc(course.picture_url, md.render(course.long_description));
		item.author = course.teacher.name;
		item.link = `https://www.lanqiao.cn/courses/${course.id}/`;
		return item;
	})));
	return {
		title: `${username} 发布的课程`,
		link: `https://www.lanqiao.cn/users/${uid}`,
		description: `${username} 发布的课程`,
		item: items
	};
}
//#endregion
export { route };
