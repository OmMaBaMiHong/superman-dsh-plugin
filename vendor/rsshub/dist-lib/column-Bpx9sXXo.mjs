import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as renderDescription, t as parseArticle } from "./utils-DWSqCN1G.mjs";
//#region lib/routes/southcn/nfapp/column.ts
const route = {
	path: "/nfapp/column/:column?",
	categories: ["traditional-media"],
	example: "/southcn/nfapp/column/38",
	parameters: { column: "栏目或南方号 ID" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "南方 +（按栏目 ID）",
	maintainers: ["TimWu007"],
	handler,
	description: `::: tip
若此处输入的是栏目 ID（而非南方号 ID），则该接口会返回与输入栏目相关联栏目的文章。例如，输入栏目 ID \`38\`（广州），则返回的结果还会包含 ID 为 \`3547\`（市长报道集）的文章。
:::

1. \`pc.nfapp.southcn.com\` 下的文章页面，可通过 url 查看，例：\`http://pc.nfapp.southcn.com/13707/7491109.html\` 的栏目 ID 为 \`13707\`。
2. \`static.nfapp.southcn.com\` 下的文章页面，可查看网页源代码，搜索 \`columnid\`。
3. <https://m.nfapp.southcn.com/column/all> 列出了部分栏目，\`id\` 即为栏目 ID。`
};
async function handler(ctx) {
	const columnId = ctx.req.param("column") ?? 38;
	const { data: responseColumn } = await got_default(`https://api.nfapp.southcn.com/nanfang_if/getColumn?columnId=${columnId}`);
	const columnName = responseColumn.columnName === "" ? "南方+" : `南方+ - ${responseColumn.columnName}`;
	const columnLink = responseColumn.linkUrl === "" ? `https://m.nfapp.southcn.com/${columnId}` : responseColumn.linkUrl;
	const { data: responseArticle } = await got_default(`https://api.nfapp.southcn.com/nfplus-manuscript-web/article/list?columnId=${columnId}&nfhSubCount=1&pageNum=1&pageSize=20`);
	const list = responseArticle.data.list.filter((i) => i.articleType === 0).map((item) => ({
		title: "【" + item.columnName + "】" + item.title,
		description: renderDescription({
			thumb: item.picMiddle,
			description: item.summary === "详见内文" ? "" : item.summary
		}),
		pubDate: timezone(parseDate(item.updateTime), 8),
		link: `http://pc.nfapp.southcn.com/${item.columnId}/${item.articleId}.html`,
		articleId: item.articleId,
		shareUrl: item.shareUrl
	}));
	return {
		title: columnName,
		link: columnLink,
		item: await Promise.all(list.map((item) => parseArticle(item)))
	};
}
//#endregion
export { route };
