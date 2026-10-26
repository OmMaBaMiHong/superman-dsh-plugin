import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/lifeweek/utils.ts
const articleApiRootUrl = "https://www.lifeweek.com.cn/api/article";
const getRssItem = async (item, articleLink) => {
	const { data } = await got_default(`${articleApiRootUrl}/${item.id}`);
	const time = timezone(parseDate(item.pubTime), 8);
	return {
		title: item.title,
		description: data.model.content,
		link: articleLink,
		pubDate: time
	};
};
//#endregion
export { getRssItem as t };
