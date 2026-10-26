import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/jsu/utils/index.ts
/**
* 获取页面内容、标题、日期
* @param selector 正文CSS选择器
* @param pageUrl 页面URL
* @param titleSelector 标题CSS选择器
* @param dateSelector 日期CSS选择器
* @param dateHander 日期处理函数，在CMS系统中会以“日期：点击数”等特殊格式显示日期，需要处理切分出日期
* @returns {Promise<{date, pageInfo: string, title: (*|jQuery|string)}|{date: string, pageInfo: string, title: string}>} 页面内容、标题、日期
*/
async function getPageDetails(selector, pageUrl, titleSelector, dateSelector, dateHander = (date) => date) {
	const $ = load((await got_default(pageUrl)).data);
	const page = $(selector);
	const date = dateHander($(dateSelector).text());
	const title = $(titleSelector).text();
	return page ? {
		pageInfo: page.html(),
		date,
		title
	} : {
		pageInfo: "无法获取内容",
		date: "1970-1-1",
		title: "无法获取标题"
	};
}
const getPageItemAndDate = getPageDetails;
//#endregion
export { getPageItemAndDate as t };
