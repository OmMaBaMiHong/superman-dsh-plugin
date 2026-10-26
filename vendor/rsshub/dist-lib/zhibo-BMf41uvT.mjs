import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderDescription } from "./description-DZ6DgX5d.mjs";
import CryptoJS from "crypto-js";
//#region lib/routes/radio/zhibo.ts
const audio_types = {
	m3u8: "x-mpegURL",
	mp3: "mpeg",
	mp4: "mp4",
	m4a: "mp4"
};
const route = {
	path: "/zhibo/:id",
	categories: ["multimedia"],
	example: "/radio/zhibo/1395528",
	parameters: { id: "直播 id，可在对应点播页面的 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: true,
		supportScihub: false
	},
	name: "直播",
	maintainers: ["nczitzk"],
	handler,
	description: `如果订阅 [新闻和报纸摘要](http://www.radio.cn/pc-portal/sanji/zhibo_2.html?name=1395528)，其 URL 为 \`http://www.radio.cn/pc-portal/sanji/zhibo_2.html?name=1395528\`，可以得到 \`name\` 为 \`1395528\`

所以对应路由为 [\`/radio/zhibo/1395528\`](https://rsshub.app/radio/zhibo/1395528)

::: tip
查看更多电台直播节目，可前往 [电台直播](http://www.radio.cn/pc-portal/erji/radioStation.html)
:::`
};
async function handler(ctx) {
	const KEY = "f0fc4c668392f9f9a447e48584c214ee";
	const id = ctx.req.param("id");
	const params = `columnId=${id}&pageNo=0&pageSize=${ctx.req.query("limit") ?? "100"}`;
	const rootUrl = "https://www.radio.cn";
	const apiRootUrl = "https://ytmsout.radio.cn";
	const iconUrl = `${rootUrl}/pc-portal/image/icon_32.jpg`;
	const currentUrl = `${rootUrl}/pc-portal/sanji/zhibo_2.html?name=${id}`;
	const apiUrl = `${apiRootUrl}/web/appProgram/pageByColumn?${params}`;
	const timestamp = Date.now();
	const data = (await got_default({
		method: "get",
		url: apiUrl,
		headers: {
			sign: CryptoJS.MD5(`${params}&timestamp=${timestamp}&key=${KEY}`).toString().toUpperCase(),
			timestamp,
			"Content-Type": "application/json",
			equipmentId: "0000",
			platformCode: "WEB"
		}
	})).data.data.data;
	const items = data.map((item) => {
		let enclosure_url = item.playUrlHigh ?? item.playUrlLow;
		enclosure_url = enclosure_url.endsWith(".m3u8") ? item.downloadUrl : enclosure_url;
		const file_ext = new URL(enclosure_url).pathname.split(".").pop();
		const enclosure_type = file_ext ? `audio/${audio_types[file_ext]}` : "";
		const date = new Date(item.startTime);
		const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
		return {
			guid: item.id,
			title: `${dateString} ${item.name}`,
			link: enclosure_url,
			description: renderDescription({
				description: item.des,
				enclosure_url,
				enclosure_type
			}),
			pubDate: parseDate(item.startTime),
			enclosure_url,
			enclosure_type,
			itunes_duration: item.durationStr,
			itunes_item_image: iconUrl
		};
	});
	return {
		title: `云听 - ${data[0].name}`,
		link: currentUrl,
		item: items,
		image: iconUrl,
		itunes_author: "radio.cn",
		description: data[0].des
	};
}
//#endregion
export { route };
