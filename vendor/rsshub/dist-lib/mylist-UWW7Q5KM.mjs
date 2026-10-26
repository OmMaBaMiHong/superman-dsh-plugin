import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { i as renderVideo, t as getMylist } from "./utils-f6SbEfjH.mjs";
//#region lib/routes/nicovideo/mylist.ts
const route = {
	name: "Mylist",
	path: "/mylist/:id",
	parameters: { id: "Mylist ID" },
	example: "/nicovideo/mylist/2973737",
	maintainers: ["esperecyan"],
	radar: [{
		source: ["www.nicovideo.jp/user/:user/mylist/:id"],
		target: "/mylist/:id"
	}],
	handler: async (ctx) => {
		const { id } = ctx.req.param();
		const mylist = await getMylist(id);
		return {
			title: `マイリスト ${mylist.name}‐ニコニコ動画`,
			link: `https://www.nicovideo.jp/user/${mylist.owner.id}/mylist/${mylist.id}`,
			language: "ja",
			item: mylist.items.map((item) => ({
				title: item.video.title,
				link: `https://www.nicovideo.jp/watch/${item.video.id}`,
				pubDate: parseDate(item.addedAt),
				author: [{
					name: item.video.owner.name,
					avatar: item.video.owner.iconUrl,
					url: `https://www.nicovideo.jp/user/${item.video.owner.id}`
				}],
				description: renderVideo(item.video, false),
				image: item.video.thumbnail.nHdUrl ?? item.video.thumbnail.largeUrl ?? item.video.thumbnail.middleUrl ?? void 0
			}))
		};
	}
};
//#endregion
export { route };
