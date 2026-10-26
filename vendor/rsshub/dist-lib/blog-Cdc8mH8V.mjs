import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/tokeninsight/blog.ts
const baseURL = "https://www.tokeninsight.com/";
const title = "TokenInsight";
const link = "https://www.tokeninsight.com/";
const route = {
	path: "/blog/:lang?",
	categories: ["finance"],
	example: "/tokeninsight/blog/en",
	parameters: { lang: "Language, see below, Chinese by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["tokeninsight.com/:lang/blogs"],
		target: "/blog/:lang"
	}],
	name: "Blogs",
	maintainers: ["fuergaosi233"],
	handler
};
async function handler(ctx) {
	const lang = ctx.req.param("lang") ?? "zh";
	const getBlogs = async () => {
		const url = `${baseURL}api/user/search/getAllList`;
		return (await got_default.post(url, { form: {
			isRecommend: 2,
			language: lang === "zh" ? "cn" : lang
		} })).data.data.blogsList;
	};
	const getBlogInfomation = async (blog) => {
		const { publishDate, title, id } = blog;
		const blogUrl = `${baseURL}${lang}/blogs/${id}`;
		return {
			title,
			description: await cache_default.tryGet(blogUrl, async () => {
				return load((await got_default(blogUrl)).data)(".detail_html_box").html();
			}),
			pubDate: parseDate(publishDate),
			link: blogUrl
		};
	};
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 30;
	const blogs = (await getBlogs()).slice(0, limit);
	const list = await Promise.all(blogs.map((element) => getBlogInfomation(element)));
	return {
		title: `${lang === "zh" ? "博客" : "Blogs"} | ${title}`,
		link: `${link}${lang}/blogs`,
		item: list
	};
}
//#endregion
export { route };
