import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as finishArticleItem } from "./wechat-mp-D2I-Y5FJ.mjs";
import dayjs from "dayjs";
import { load } from "cheerio";
//#region lib/routes/wechat/msgalbum.ts
const route = {
	path: "/mp/msgalbum/:biz/:aid",
	categories: ["new-media"],
	example: "/wechat/mp/msgalbum/MzA3MDM3NjE5NQ==/1375870284640911361",
	parameters: {
		biz: "公众号id",
		aid: "Tag id"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "公众号文章话题 Tag",
	maintainers: ["MisteryMonster"],
	handler,
	description: "一些公众号（如看理想）会在微信文章里添加 Tag ，点入 Tag 的链接如 `https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzA3MDM3NjE5NQ==&action=getalbum&album_id=1375870284640911361`，其中`biz` 为 `MzA3MDM3NjE5NQ==`，`aid` 为 `1375870284640911361`。"
};
async function handler(ctx) {
	const { biz, aid } = ctx.req.param();
	const aidurl = `&album_id=${aid}`;
	const $ = load((await got_default({
		method: "get",
		url: `https://mp.weixin.qq.com/mp/appmsgalbum?__biz=${biz}&action=getalbum${aidurl}`
	})).data);
	const list = $("li").toArray();
	const mptitle = $(".album__author-name").text() + "|" + $(".album__label-title").text();
	const articledata = await Promise.all(list.map((item) => {
		const link = $(item).attr("data-link").replace("http://", "https://");
		return finishArticleItem({
			title: $(item).attr("data-title"),
			link,
			guid: link
		});
	}));
	return {
		title: mptitle,
		link: `https://mp.weixin.qq.com/mp/appmsgalbum?__biz=${biz}&action=getalbum${aidurl}`,
		item: list.map((item, index) => ({
			title: articledata[index].title,
			description: $(item).find(".album__item-img").html() + `<br><br>${articledata[index].description}`,
			link: articledata[index].link,
			guid: articledata[index].guid,
			author: articledata[index].author,
			pubDate: dayjs.unix($(item).find(".js_article_create_time").text()).format()
		}))
	};
}
//#endregion
export { route };
