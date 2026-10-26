import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { n as extractWork, t as extractArticle } from "./utils-f0yQ08vb2.mjs";
import { load } from "cheerio";
//#region lib/routes/zcool/user.ts
const route = {
	path: "/user/:uid",
	categories: ["design"],
	view: 2,
	example: "/zcool/user/baiyong",
	parameters: { uid: "个性域名前缀或者用户ID" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.zcool.com.cn/u/:id"],
		target: "/user/:id"
	}],
	name: "用户作品",
	description: `例如:

站酷的个人主页 \`https://baiyong.zcool.com.cn\` 对应 rss 路径 \`/zcool/user/baiyong\`

站酷的个人主页 \`https://www.zcool.com.cn/u/568339\` 对应 rss 路径 \`/zcool/user/568339\``,
	maintainers: ["junbaor"],
	handler
};
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	let pageUrl = `https://www.zcool.com.cn/u/${uid}`;
	if (Number.isNaN(uid)) {
		if (!isValidHost(uid)) throw new InvalidParameterError("Invalid uid");
		pageUrl = `https://${uid}.zcool.com.cn`;
	}
	const { data: response } = await got_default(pageUrl);
	const $ = load(response);
	const data = JSON.parse($("script#__NEXT_DATA__").text());
	const workList = data.props.pageProps.workList.map((item) => ({
		title: item.title,
		link: item.pageUrl,
		pubDate: parseDate(item.publishTime, "x"),
		category: [
			item.objectTypeStr,
			item.cateStr,
			item.subCateStr,
			...item.tags
		]
	}));
	const items = await Promise.all(workList.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		const data = JSON.parse($("script#__NEXT_DATA__").text());
		if (item.link.startsWith("https://www.zcool.com.cn/article/")) item.description = extractArticle(data);
		else if (item.link.startsWith("https://www.zcool.com.cn/work/")) item.description = extractWork(data);
		return item;
	})));
	return {
		title: data.props.pageProps.seo.title,
		description: data.props.pageProps.seo.description,
		image: data.props.pageProps.userInfo.avatar.includes("?x-oss-process") ? data.props.pageProps.userInfo.avatar.split("?", 1)[0] : data.props.pageProps.userInfo.avatar,
		link: pageUrl,
		item: items
	};
}
//#endregion
export { route };
