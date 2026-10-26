import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/eastmoney/gerenzhongxin/trpl.ts
const route = {
	path: "/gerenzhongxin/trpl/:uid",
	categories: ["finance"],
	view: 0,
	example: "/eastmoney/gerenzhongxin/trpl/2922094262312522",
	parameters: { uid: "用户id,即用户主页网址末尾的数字" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [
		{ source: ["guba.eastmoney.com"] },
		{ source: ["caifuhao.eastmoney.com"] },
		{
			source: ["i.eastmoney.com/:uid"],
			target: "/gerenzhongxin/trpl/:uid"
		}
	],
	name: "个人中心评论",
	maintainers: ["AwesomeDog"],
	handler
};
async function handler(ctx) {
	const uid = ctx.req.param("uid");
	const arr = (await got_default(`https://i.eastmoney.com/api/guba/myreply?pageindex=1&uid=${uid}&checkauth=true`)).data.result.list;
	const nickname = arr[0].reply_user.user_nickname;
	const items = arr.map((item) => {
		const linkUrl = `https://guba.eastmoney.com/news,${item.reply_guba.stockbar_code},${item.source_post_id}.html#allReplyList`;
		const descriptionContent = `
        <p>${item.source_post_title}</p>
        <hr/>
        <br/>
        <blockquote cite="${linkUrl}">
          <p>${item.reply_text}</p>
        </blockquote>
        <p style="text-align:right;">—— 评论者：<cite>${item.reply_user.user_nickname}</cite></p>
        `;
		const guid = "guid-" + md5(item.reply_text) + `-${item.source_post_id}`;
		return {
			title: item.post_title || `${nickname} 发布了评论: ${descriptionContent}`,
			description: descriptionContent,
			pubDate: timezone(parseDate(item.reply_publish_time), 8),
			link: linkUrl,
			guid,
			author: item.reply_user.user_nickname
		};
	});
	return {
		title: `${nickname} 的东财评论`,
		link: `https://i.eastmoney.com/${uid}#trpl`,
		image: `https://avator.eastmoney.com/qface/${uid}/360`,
		item: items
	};
}
//#endregion
export { route as n, handler as t };
