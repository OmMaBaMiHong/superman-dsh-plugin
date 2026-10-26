import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as renderDescription, t as parseArticle } from "./utils-BM629yme.mjs";
//#region lib/routes/oeeee/app/reporter.ts
const route = {
	path: "/app/reporter/:id",
	categories: ["traditional-media"],
	example: "/oeeee/app/reporter/249",
	parameters: { id: "记者 UID" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "南都客户端（按记者）",
	maintainers: ["TimWu007"],
	handler,
	description: "记者的 UID 可通过 `m.mp.oeeee.com` 下的文章页面获取。点击文章下方的作者头像，进入该作者的个人主页，即可从 url 中获取。"
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? 0;
	const { data: response } = await got_default(`https://m.mp.oeeee.com/show.php?m=Doc&a=getAuthorInfo&id=${id}`);
	const list = response.data.list.map((item) => ({
		title: "【" + item.media_nickname + "】" + item.title,
		description: renderDescription({
			thumb: item.titleimg,
			description: item.summary
		}),
		link: item.url
	}));
	const author = response.data.info ? response.data.info.name : "";
	const items = await Promise.all(list.map((item) => parseArticle(item)));
	return {
		title: `南方都市报奥一网 - ${author}`,
		link: `https://m.mp.oeeee.com/w/${id}.html`,
		item: items
	};
}
//#endregion
export { route };
