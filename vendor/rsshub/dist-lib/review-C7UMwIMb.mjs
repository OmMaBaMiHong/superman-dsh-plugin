import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { n as appDetail, r as getRootUrl, t as X_UA } from "./utils-CtGz4QWg.mjs";
//#region lib/routes/taptap/common/review.ts
const makeSortParam = (isIntl, order) => {
	if (isIntl) {
		if (order === "helpful" || order === "recent") return `type=${order}`;
		return "type=helpful";
	}
	if (order === "new" || order === "hot") return `sort=${order}`;
	return "sort=hot";
};
const fetchMainlandItems = async (params) => {
	const id = params.id;
	const order = params.order ?? "hot";
	const lang = params.lang ?? "zh_CN";
	let url = `${getRootUrl(false)}/webapiv2/review/v2/list-by-app?app_id=${id}&limit=10`;
	url += `&${makeSortParam(false, order)}`;
	url += `&${X_UA(lang)}`;
	return (await rofetch(url)).data.list.map((review) => {
		const author = review.moment.author.user.name;
		return {
			title: `${author} - ${review.moment.review.score}星`,
			author,
			description: review.moment.review.contents.text + (review.moment.review.contents.images ? review.moment.review.contents.images.map((img) => `<img src="${img.original_url}">`).join("") : ""),
			link: `${getRootUrl(false)}/review/${review.moment.review.id}`,
			pubDate: parseDate(review.moment.publish_time, "X")
		};
	});
};
const fetchIntlItems = async (params) => {
	const id = params.id;
	const order = params.order ?? "helpful";
	const lang = params.lang ?? "en_US";
	let url = `${getRootUrl(true)}/webapiv2/feeds/v3/by-app?app_id=${id}&limit=10`;
	url += `&${makeSortParam(true, order)}`;
	url += `&${X_UA(lang)}`;
	return (await rofetch(url)).data.list.map((review) => {
		const author = review.post.user.name;
		const score = review.post.list_fields.app_ratings[id].score;
		return {
			title: `${author} - ${"★".repeat(score)}`,
			author,
			description: review.post.list_fields.summary || review.post.list_fields.title,
			link: `${getRootUrl(true)}/post/${review.post.id_str}`,
			pubDate: parseDate(review.post.published_time, "X")
		};
	});
};
async function handler(ctx) {
	const isIntl = ctx.req.path.replace("/taptap", "").startsWith("/intl/");
	const id = ctx.req.param("id");
	const order = ctx.req.param("order") ?? "default";
	const lang = ctx.req.param("lang") ?? (isIntl ? "en_US" : "zh_CN");
	const detail = await appDetail(id, lang, isIntl);
	const appImg = detail.app.icon.original_url;
	const appName = detail.app.title;
	const items = isIntl ? await fetchIntlItems({
		id,
		order,
		lang
	}) : await fetchMainlandItems({
		id,
		order,
		lang
	});
	return {
		title: `TapTap 评价 ${appName}`,
		link: `${getRootUrl(isIntl)}/app/${id}/review?${makeSortParam(isIntl, order)}`,
		image: appImg,
		item: items
	};
}
//#endregion
export { handler as t };
