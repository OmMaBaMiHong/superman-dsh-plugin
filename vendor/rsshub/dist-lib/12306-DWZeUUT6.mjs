import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/12306/index.tsx
const rootUrl = "https://kyfw.12306.cn";
const renderTrainDescription = (trainInfo) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsxs("text", { children: ["车次：", trainInfo.trainNo] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: [
		"始发站：",
		trainInfo.fromStation,
		" → ",
		trainInfo.toStation
	] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: ["出发时间：", trainInfo.startTime] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: ["到达时间：", trainInfo.arriveTime] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: [
		"历时：",
		trainInfo.duration,
		" ",
		trainInfo.today === "N" && "次日达"
	] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: ["商务座/特等座：", trainInfo.A9 || "无"] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: ["一等座：", trainInfo.M || "无"] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: ["二等座/二等包座：", trainInfo.O || "无"] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: ["高级软卧：", trainInfo.A6 || "无"] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: ["软卧/一等卧：", trainInfo.A4 || "无"] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: ["动卧：", trainInfo.F || "无"] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: ["硬卧/二等卧：", trainInfo.A3 || "无"] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: ["软座: ", trainInfo.A2 || "无"] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: ["硬座: ", trainInfo.A1 || "无"] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: ["无座: ", trainInfo.WZ || "无"] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: ["其他: ", trainInfo.QT || "无"] })
] }));
async function getJSESSIONID(linkUrl) {
	return (await got_default({
		method: "get",
		url: linkUrl,
		headers: {
			UserAgent: config.ua,
			Referer: "https://www.12306.cn/index/index.html"
		}
	})).headers["set-cookie"].join(",").match(/JSESSIONID=([^;]+);/)[0];
}
function getStationInfo(stationName) {
	return cache_default.tryGet(stationName, async () => {
		return (await got_default({
			method: "get",
			url: `${rootUrl}/otn/resources/js/framework/station_name.js`,
			headers: {
				UserAgent: config.ua,
				Referer: "https://kyfw.12306.cn/otn/leftTicket/init"
			}
		})).data.split("@").map((item) => {
			const itemData = item.split("|");
			return itemData.includes(stationName) ? {
				code: itemData[2],
				name: itemData[1]
			} : null;
		}).find(Boolean);
	});
}
const route = {
	path: "/:date/:from/:to/:type?",
	categories: ["travel"],
	example: "/12306/2022-02-19/重庆/永川东",
	parameters: {
		date: "时间，格式为（YYYY-MM-DD）",
		from: "始发站",
		to: "终点站",
		type: "售票类型，成人和学生可选，默认为成人"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "售票信息",
	maintainers: ["Fatpandac"],
	handler
};
async function handler(ctx) {
	const date = ctx.req.param("date");
	const fromStationInfo = await getStationInfo(ctx.req.param("from"));
	const toStationInfo = await getStationInfo(ctx.req.param("to"));
	const type = ctx.req.param("type") ?? "ADULT";
	const apiUrl = `${rootUrl}/otn/leftTicket/queryA?leftTicketDTO.train_date=${date}&leftTicketDTO.from_station=${fromStationInfo.code}&leftTicketDTO.to_station=${toStationInfo.code}&purpose_codes=${type}`;
	const linkUrl = `${rootUrl}/otn/leftTicket/init?linktypeid=dc&fs=${fromStationInfo.code}&ts=${toStationInfo.code}&date=${date}&flag=N,N,Y`;
	const response = await got_default.get(apiUrl, { headers: {
		UserAgent: config.ua,
		Referer: "https://kyfw.12306.cn/otn/leftTicket/init",
		Cookie: await getJSESSIONID(linkUrl)
	} });
	if (response.data.data === void 0 || response.data.data.length === 0) throw new InvalidParameterError("没有找到相关车次，请检查参数是否正确");
	const data = response.data.data.result;
	const map = response.data.data.map;
	const items = data.map((item) => {
		const itemData = item.split("|");
		const trainInfo = {
			trainNo: itemData[3],
			fromStation: map[itemData[6]],
			toStation: map[itemData[7]],
			startTime: itemData[8],
			arriveTime: itemData[9],
			duration: itemData[10],
			today: itemData[11],
			A9: itemData[32],
			M: itemData[31],
			O: itemData[30],
			A6: itemData[29],
			A4: itemData[28],
			F: itemData[27],
			A3: itemData[26],
			A2: itemData[25],
			A1: itemData[24],
			WZ: itemData[23],
			QT: itemData[22]
		};
		return {
			title: `${trainInfo.fromStation} → ${trainInfo.toStation} ${trainInfo.startTime} ${trainInfo.arriveTime}`,
			description: renderTrainDescription(trainInfo),
			link: linkUrl,
			guid: Object.values(trainInfo).join("|")
		};
	});
	return {
		title: `${fromStationInfo.name} → ${toStationInfo.name} ${date}`,
		link: linkUrl,
		item: items
	};
}
//#endregion
export { route };
