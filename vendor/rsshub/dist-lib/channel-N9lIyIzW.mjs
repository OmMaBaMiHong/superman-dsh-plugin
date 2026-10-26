import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as renderDescription, t as parseArticle } from "./utils-BM629yme.mjs";
//#region lib/routes/oeeee/app/channel.ts
const route = {
	path: "/app/channel/:id",
	name: "Unknown",
	maintainers: ["TimWu007"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? 50;
	const { data: response } = await got_default(`https://api-ndapp.oeeee.com/friends.php?m=Zone&a=SpaceDoclist&uid=${id}&type=doc`);
	const list = response.data.filter((i) => i.url).map((item) => ({
		title: item.title,
		description: renderDescription({
			thumb: item.titleimg.replaceAll(/\?x-oss-process=.*/g, ""),
			description: item.summary
		}),
		pubDate: timezone(parseDate(item.ptime * 1e3), 8),
		link: item.url,
		channel: item.author
	}));
	const channel = list[1] ? list[1].channel : "";
	const items = await Promise.all(list.map((item) => parseArticle(item)));
	return {
		title: `南方都市报客户端 - ${channel}`,
		link: `https://m.mp.oeeee.com/u/${id}.html`,
		item: items
	};
}
//#endregion
export { route };
