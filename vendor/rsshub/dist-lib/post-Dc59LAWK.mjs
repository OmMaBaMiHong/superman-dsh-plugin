import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/medieval-china/post.ts
const route = {
	path: "/",
	radar: [{
		source: ["medieval-china.club/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["artefaritaKuniklo"],
	handler,
	url: "medieval-china.club/"
};
async function handler(ctx) {
	const baseUrl = "https://medieval-china.club";
	const { data: response } = await got_default(baseUrl);
	const $ = load(response);
	const posts = JSON.parse($("script:contains(\"window.localPosts\")").text().match(/window\.localPosts = JSON\.parse\('(.*)'\);/)[1]).slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 10).map((item) => ({
		title: item.title,
		link: `${baseUrl}${item.path}`,
		pubDate: timezone(parseDate(item.date), 8)
	}));
	return {
		title: "中国的中古",
		link: baseUrl,
		item: await Promise.all(posts.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: response } = await got_default(item.link);
			const $ = load(response);
			const imgSrc = $("img").attr("data-original");
			$("img").attr("src", `${baseUrl}${imgSrc}`);
			$(".head-mask").remove();
			$("div.lover-box").remove();
			item.description = $("article").first().html();
			return item;
		}))),
		image: "https://medieval-china.club/images/icons/favicon-144x144.png",
		description: "世界那么大，你无法去到每一个地方，感受每一处风景；时间那么长，那些逝去的人你也终将无法与之谋面。而通过古人之文字，今人之分享，你可以领略以前风光之奇绝瑰玮，感受逝人之人情冷暖。中古就是这么一个地方，大家来自全球各地，不同时区，不同性别，不同身份，不同职业，但是大家都被中古的绚烂华章聚集在一起，哀其所哀，乐其所乐。这是一个虚拟的世界，但是我们仿佛跨越千里而来，谈一场绝世爱恋，今夕何夕！仅以此网站献给中古club的每一位成员，契阔谈宴，西园不芜！"
	};
}
//#endregion
export { route };
