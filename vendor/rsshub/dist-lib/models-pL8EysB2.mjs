import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import markdownit from "markdown-it";
//#region lib/routes/modelscope/models.ts
const md = markdownit({
	html: true,
	linkify: true
});
const route = {
	path: "/models",
	categories: ["programming"],
	example: "/modelscope/models",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["modelscope.cn/models"] }],
	name: "模型库",
	maintainers: ["TonyRL"],
	handler,
	url: "modelscope.cn/models"
};
async function handler(ctx) {
	const baseUrl = "https://modelscope.cn";
	const link = `${baseUrl}/models`;
	const { data } = await got_default.put(`${baseUrl}/api/v1/dolphin/models`, { json: {
		PageSize: ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 36,
		PageNumber: 1,
		SortBy: "GmtModified",
		Target: "",
		SingleCriterion: []
	} });
	const models = data.Data.Model.Models.map((model) => ({
		title: model.ChineseName,
		description: model.Description,
		author: model.Organization.FullName,
		link: `${link}/${model.Path}/${model.Name}`,
		pubDate: parseDate(model.CreatedTime, "X"),
		category: [.../* @__PURE__ */ new Set([...model.Tasks.map((task) => task.ChineseName), ...model.Tags])],
		slug: `/${model.Path}/${model.Name}`
	}));
	return {
		title: "模型库首页 · 魔搭社区",
		description: "ModelScope——汇聚各领域先进的机器学习模型，提供模型探索体验、推理、训练、部署和应用的一站式服务。在这里，共建模型开源社区，发现、学习、定制和分享心仪的模型。",
		image: "https://g.alicdn.com/sail-web/maas/0.8.10/favicon/128.ico",
		link,
		item: await Promise.all(models.map((item) => cache_default.tryGet(item.link, async () => {
			const { data } = await got_default(`${baseUrl}/api/v1/models${item.slug}`);
			const content = data.Data.ReadMeContent.replaceAll(/img src="(?!http)(.*?)"/g, (_match, p1) => `img src="${baseUrl}/api/v1/models${item.slug}/repo?Revision=master&FilePath=${p1}&View=true"`);
			item.description = md.render(content);
			return item;
		})))
	};
}
//#endregion
export { route };
