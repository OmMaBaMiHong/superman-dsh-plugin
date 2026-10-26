import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderDescription } from "./desc-CM6q7uxF.mjs";
import markdownit from "markdown-it";
//#region lib/routes/modelscope/datasets.ts
const md = markdownit({
	html: true,
	linkify: true
});
const route = {
	path: "/datasets",
	categories: ["programming"],
	example: "/modelscope/datasets",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["modelscope.cn/datasets"] }],
	name: "数据集",
	maintainers: ["TonyRL"],
	handler,
	url: "modelscope.cn/datasets"
};
async function handler(ctx) {
	const baseUrl = "https://modelscope.cn";
	const link = `${baseUrl}/datasets`;
	const { data } = await got_default(`${baseUrl}/api/v1/dolphin/datasets`, { searchParams: {
		PageSize: ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 36,
		PageNumber: 1,
		Target: "",
		Sort: "gmt_modified"
	} });
	const datasets = data.Data.map((dataset) => ({
		title: dataset.ChineseName,
		description: dataset.Description,
		author: dataset.CreatedBy,
		link: `${link}/${dataset.Namespace}/${dataset.Name}`,
		pubDate: parseDate(dataset.GmtCreate, "X"),
		category: dataset.UserDefineTags.split(","),
		slug: `/${dataset.Namespace}/${dataset.Name}`
	}));
	return {
		title: "数据集首页 · 魔搭社区",
		description: "ModelScope——汇聚各领域先进的机器学习模型，提供模型探索体验、推理、训练、部署和应用的一站式服务。在这里，共建模型开源社区，发现、学习、定制和分享心仪的模型。",
		image: "https://g.alicdn.com/sail-web/maas/0.8.10/favicon/128.ico",
		link,
		item: await Promise.all(datasets.map((item) => cache_default.tryGet(item.link, async () => {
			const { data } = await got_default(`${baseUrl}/api/v1/datasets${item.slug}`);
			const content = data.Data.ReadmeContent.replaceAll(/img src="(?!http)(.*?)"/g, (_match, p1) => `img src="${baseUrl}/api/v1/datasets${item.slug}/repo?Revision=master&FilePath=${p1}&View=true"`);
			item.description = renderDescription({
				description: item.description,
				md: md.render(content)
			});
			return item;
		})))
	};
}
//#endregion
export { route };
