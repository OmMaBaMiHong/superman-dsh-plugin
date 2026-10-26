import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { n as appDetail, r as getRootUrl, t as X_UA } from "./utils-CtGz4QWg.mjs";
//#region lib/routes/taptap/common/changelog.ts
async function handler(ctx) {
	const isIntl = ctx.req.path.replace("/taptap", "").startsWith("/intl/");
	const id = ctx.req.param("id");
	const lang = ctx.req.param("lang") ?? (isIntl ? "en_US" : "zh_CN");
	const url = `${getRootUrl(isIntl)}/app/${id}`;
	const detail = await appDetail(id, lang, isIntl);
	const appImg = detail.app.icon.original_url;
	const appName = detail.app.title;
	const appDescription = `${appName}${detail.app.developers ? " by" + detail.app.developers.map((item) => item.name).join(" & ") : ""}`;
	const list = (await rofetch(`${getRootUrl(isIntl)}/webapiv2/apk/v1/list-by-app?app_id=${id}&from=0&limit=10&${X_UA(lang)}`, { headers: { Referer: url } })).data.list;
	return {
		title: `TapTap 更新记录 ${appName}`,
		description: appDescription,
		link: url,
		image: appImg,
		item: list.map((item) => ({
			title: `${appName} / ${item.version_label}`,
			description: item.whatsnew.text,
			pubDate: parseDate(item.update_date, "X"),
			link: url,
			guid: item.version_label
		}))
	};
}
//#endregion
export { handler as t };
