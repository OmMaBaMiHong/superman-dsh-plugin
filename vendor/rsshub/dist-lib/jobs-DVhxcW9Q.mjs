import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/eleduck/jobs.ts
const route = {
	path: "/jobs",
	categories: ["bbs"],
	example: "/eleduck/jobs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["eleduck.com/categories/5", "eleduck.com/"] }],
	name: "工作机会",
	maintainers: ["sfyumi"],
	handler,
	url: "eleduck.com/categories/5"
};
async function handler() {
	const { data: response } = await got_default("https://svc.eleduck.com/api/v1/posts", { searchParams: { category: 5 } });
	const data = response.posts.map((item) => ({
		id: item.id,
		title: item.title,
		link: `https://eleduck.com/posts/${item.id}`,
		author: item.user.nickname,
		description: item.summary,
		pubDate: parseDate(item.published_at),
		category: item.tags.map((tag) => tag.name)
	}));
	return {
		title: "招聘 | 电鸭社区",
		link: "https://eleduck.com/category/5",
		item: await Promise.all(data.map((job) => cache_default.tryGet(job.link, async () => {
			const { data: jobDetail } = await got_default(`https://svc.eleduck.com/api/v1/posts/${job.id}`);
			job.description = jobDetail.post.content;
			return job;
		})))
	};
}
//#endregion
export { route };
