import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/hunau/utils/category-title.ts
const categoryTitle = (type) => {
	let title;
	type = type.slice(0, 4).toLowerCase();
	switch (type) {
		case "tzgg":
			title = "通知公告";
			break;
		case "ggtz":
			title = "公告通知";
			break;
		case "jwdt":
			title = "教务动态";
			break;
		case "xyxw":
			title = "学院新闻";
			break;
		case "jzxx":
			title = "讲座信息";
			break;
		case "xzzq":
			title = "下载专区";
			break;
		default: title = "";
	}
	return title;
};
//#endregion
//#region lib/routes/hunau/utils/index-page.ts
const indexPage = (page) => {
	return `index${page === "1" ? "" : `_${Number.parseInt(page) - 1}`}.html`;
};
//#endregion
//#region lib/routes/hunau/utils/news-content.ts
const newsContent = async (link, department = "") => {
	try {
		const { data: response } = await got_default(link);
		const $ = load(response);
		let reg = /\d{4}(?:\/\d{2}){2}/;
		let element = ".newscontent";
		if (department === "xky") {
			reg = /\d{4}-\d{2}-\d{2}/;
			element = ".content .edit";
		}
		const extractDate = ($(".info").first().html()?.match(reg) || [])[0];
		const pubDate = timezone(parseDate(extractDate, "YYYY-MM-DD", "zh-cn"), 8);
		const newsContent = $(element).first();
		newsContent.find("table").remove();
		let description = newsContent.text().replaceAll(/\s+/g, "");
		if (department === "gfxy") description = description.replace("点击下载文件:", "");
		return {
			description,
			pubDate
		};
	} catch {
		return {
			description: "",
			pubDate: null
		};
	}
};
//#endregion
//#region lib/routes/hunau/utils/common.ts
const getContent = async (ctx, { baseHost, baseCategory, baseType, baseTitle, baseDescription = "", baseDeparment = "", baseClass = "div.article_list ul li:has(a)" }) => {
	const { category = baseCategory, type = baseType, page = "1" } = ctx.req.param();
	const title = `${baseTitle} - ${categoryTitle(category)}`;
	const description = baseDescription ? `${baseDescription} - ${categoryTitle(category)}` : title;
	const baseURl = `${baseHost}${type ? `/${type}` : ""}/${category}`;
	const url = `${baseURl}/${indexPage(page)}`;
	const { data: response } = await got_default(url);
	const $ = load(response);
	const list = $(baseClass).toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		const href = a.attr("href");
		return {
			title: a.text(),
			link: href.startsWith("./") && !href.endsWith(".pdf") ? `${baseURl}${href.replace("./", "/")}` : href
		};
	});
	return {
		title,
		description,
		link: url,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = await newsContent(item.link, baseDeparment);
			item.pubDate = content.pubDate;
			item.description = content.description;
			return item;
		})))
	};
};
//#endregion
export { getContent as t };
