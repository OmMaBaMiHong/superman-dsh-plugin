import { n as getCitys, r as getDistricts, t as baseUrl } from "./utils-6oRwF0ha.mjs";
//#region lib/routes/wellcee/support-city.ts
const route = {
	path: "/support-city",
	example: "/wellcee/support-city",
	name: "支持的城市",
	maintainers: ["TonyRL"],
	radar: [{ source: ["www.wellcee.com"] }],
	handler,
	url: "www.wellcee.com"
};
async function handler(ctx) {
	const citys = await getCitys();
	const list = await Promise.all(citys.map(async (city) => ({
		...city,
		district: await getDistricts(city.id)
	})));
	const requestHost = new URL(ctx.req.url).host;
	return {
		title: "支持的城市 - Wellcee",
		description: "上海国际化租房平台｜北京合租&找室友｜香港留学生租房｜深圳无中介租房｜广州外国人租房 ｜杭州高品质租房｜成都房东直租；同志友好&宠物友好；Wellcee 的生活方式：社交｜活动｜交友｜美食｜宠物领养｜音乐&艺术；Wellcee 的二手市集：家居｜电子｜奢侈品｜时尚。",
		link: baseUrl,
		item: list.flatMap((city) => city.district.map((district) => ({
			title: `${city.chCityName} - ${district.name}`,
			description: `${city.chCityName} - ${district.name}`,
			link: `https://${requestHost}/wellcee/rent/${city.chCityName}/${district.name}`
		})))
	};
}
//#endregion
export { route };
