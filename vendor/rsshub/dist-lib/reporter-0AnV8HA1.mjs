import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as renderDescription, t as parseArticle } from "./utils-DWSqCN1G.mjs";
//#region lib/routes/southcn/nfapp/reporter.ts
const route = {
	path: "/nfapp/reporter/:reporter",
	categories: ["traditional-media"],
	example: "/southcn/nfapp/reporter/969927791",
	parameters: { reporter: "作者 UUID" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "南方 +（按作者）",
	maintainers: ["TimWu007"],
	handler,
	description: "作者的 UUID 只可通过 `static.nfapp.southcn.com` 下的文章页面获取。点击文章下方的作者介绍，进入该作者的个人主页，即可从 url 中获取。"
};
async function handler(ctx) {
	const reporterId = ctx.req.param("reporter");
	const { data: response } = await got_default(`https://api.nfapp.southcn.com/nanfang_if/reporter/list?reporterUuid=${reporterId}&pageSize=20&pageNo=1&origin=0`);
	const list = response.data.reportInfo.articleInfo.map((item) => ({
		title: "【" + item.releaseColName + "】" + item.title,
		description: renderDescription({
			thumb: item.picMiddle,
			description: item.attAbstract
		}),
		pubDate: timezone(parseDate(item.publishtime), 8),
		link: `http://pc.nfapp.southcn.com/${item.colID}/${item.fileId}.html`,
		articleId: item.fileId,
		shareUrl: item.shareUrl
	}));
	const items = await Promise.all(list.map((item) => parseArticle(item)));
	return {
		title: `南方+ - ${response.data.reportInfo.reporterName}`,
		link: `https://static.nfapp.southcn.com/apptpl/reporterWorksList/index.html?reporterUuid=${reporterId}`,
		item: items
	};
}
//#endregion
export { route };
