import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/sorrycc/index.ts
const WORDPRESS_HASH = "f05fca638390aed897fbe3c2fff03000";
const route = {
	name: "文章",
	categories: ["blog"],
	path: "/",
	example: "/sorrycc",
	radar: [{ source: ["sorrycc.com"] }],
	handler,
	maintainers: ["KarasuShin"],
	view: 0,
	features: {
		supportRadar: true,
		requireConfig: [{
			name: "SORRYCC_COOKIES",
			description: `登录用户的Cookie,获取方式：\n1. 登录sorrycc.com\n2. 打开浏览器开发者工具，切换到 Application 面板\n3. 点击侧边栏中的Storage -> Cookies -> https://sorrycc.com\n4. 复制 Cookie 中的 wordpress_logged_in_${WORDPRESS_HASH} 值`,
			optional: true
		}]
	},
	description: "云谦的博客，部分内容存在权限校验，访问完整内容请部署 RSSHub 私有实例并配置授权信息"
};
async function handler(ctx) {
	const host = "https://sorrycc.com";
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 100;
	const cookie = config.sorrycc.cookie;
	const data = await rofetch(`${host}/wp-json/wp/v2/posts?per_page=${limit}`);
	return {
		title: "文章",
		item: await Promise.all(data.map(async (item) => {
			const title = item.title.rendered;
			const link = item.link;
			const pubDate = parseDate(item.date_gmt);
			const updated = parseDate(item.modified_gmt);
			if (item.categories.includes(7) && cookie) return await cache_default.tryGet(link, async () => {
				const description = load(await rofetch(link, { headers: { Cookie: `wordpress_logged_in_${WORDPRESS_HASH}=${cookie}` } }))(".content").html();
				return {
					title,
					description,
					link,
					pubDate,
					updated
				};
			});
			return {
				title,
				description: item.content.rendered,
				link,
				pubDate,
				updated
			};
		})),
		link: host,
		image: `${host}/wp-content/uploads/2024/01/cropped-CC-1-32x32.png`
	};
}
//#endregion
export { route };
