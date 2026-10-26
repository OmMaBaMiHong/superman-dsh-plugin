import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as PRESETS } from "./header-generator-DACPoxdp.mjs";
//#region lib/routes/dianping/user.ts
const route = {
	path: "/user/:id",
	categories: ["shopping"],
	example: "/dianping/user/808259118",
	parameters: { id: "User id，打开网页端从 URL 中获取，在 `/member/:id` 中" },
	features: {
		requireConfig: [{
			name: "DIANPING_COOKIE",
			optional: false,
			description: "大众点评的 Cookie"
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["dianping.com/member/:id"],
		target: "/dianping/user/:id"
	}, {
		source: ["m.dianping.com/userprofile/:id"],
		target: "/dianping/user/:id"
	}],
	name: "用户动态",
	maintainers: ["pseudoyu"],
	handler,
	description: "获取用户点评、签到、攻略等动态。"
};
function addPictureAndVideo(item) {
	let content = "";
	content += item.pictureList ? item.pictureList.map((ele) => `<img src="${ele.picUrl}" />`).join("<br>") : "";
	content += item.videoUrl ? `<img src="${item.videoUrl}" />` : "";
	return content;
}
const starMap = {
	0: "无",
	10: "一星",
	20: "二星",
	30: "三星",
	35: "三星半",
	40: "四星",
	45: "四星半",
	50: "五星"
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const userPage = `https://m.dianping.com/userprofile/${id}`;
	const cookie = config.dianping.cookie;
	const headers = { Referer: userPage };
	if (cookie) headers.Cookie = cookie;
	const pageResponse = await rofetch(userPage, {
		headers,
		headerGeneratorOptions: PRESETS.MODERN_IOS
	});
	const nickName = /window\.nickName = "(.*?)"/.exec(pageResponse)?.[1];
	const items = (await rofetch(`https://m.dianping.com/member/ajax/NobleUserFeeds?userId=${id}`, {
		headers,
		headerGeneratorOptions: PRESETS.MODERN_IOS
	})).data.map((item) => {
		let link = "";
		let title = "";
		let content = "";
		const poi = item.poi ? `地点：<a href="http://www.dianping.com/shop/${item.poi.shopId}">${item.poi.name} - ${item.poi.regionCategory}</a>` : "";
		const poiName = item.poi ? item.poi.name : "";
		switch (item.feedType) {
			case 1101:
				link = `https://m.dianping.com/ugcdetail/${item.mainId}?sceneType=0&bizType=3`;
				content = poi;
				title = `签到成功: ${poiName} `;
				break;
			case 101:
				link = `https://m.dianping.com/ugcdetail/${item.mainId}?sceneType=0&bizType=1`;
				content = item.content.replaceAll(/\n+/g, "<br>") + "<br>";
				content += `评分：${starMap[item.star]}<br>`;
				content += poi + "<br>";
				content += addPictureAndVideo(item);
				title = `发布点评: ${poiName}`;
				break;
			case 131:
				link = `https://m.dianping.com/ugcdetail/${item.mainId}?sceneType=0&bizType=29`;
				content = item.content.replaceAll(/\n+/g, "<br>") + "<br>";
				content += addPictureAndVideo(item);
				title = `发布点评: ${content}`;
				break;
			case 4208:
				link = `https://m.dianping.com/cityinsight/${item.mainId}`;
				content = item.content.replaceAll(/\n+/g, "<br>") + "<br>";
				content += poi + "<br>";
				content += item.moreDesc ? `<a href='${link}'>${item.moreDesc}</a><br>` : "";
				content += addPictureAndVideo(item);
				title = `发布攻略: ${poiName}`;
				break;
			default:
		}
		return {
			description: content,
			title,
			link
		};
	});
	return {
		title: `大众点评 - ${nickName}`,
		link: userPage,
		description: `大众点评 - ${nickName}`,
		item: items
	};
}
//#endregion
export { route };
