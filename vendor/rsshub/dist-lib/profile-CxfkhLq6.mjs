import { t as config } from "./config-B5Cf_tHS.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
//#region lib/routes/kuaishou/profile.ts
const route = {
	name: "Profile",
	path: "/profile/:principalId",
	radar: [{
		source: ["kuaishou.com/profile/:principalId"],
		target: "/profile/:principalId"
	}],
	parameters: { principalId: "用户 id, 可在主页中找到" },
	example: "/kuaishou/profile/3xk46q9cdnvgife",
	maintainers: ["GuoChen-thlg"],
	url: "kuaishou.com/profile/:principalId",
	description: `::: tip
The profile page of the user, which contains the user's information, videos, and other information.
:::`,
	handler
};
async function handler(ctx) {
	const { principalId } = ctx.req.param();
	const context = await outPlaywright();
	const page = await context.newPage();
	let retryCount = 0;
	let userInfo;
	const { promise, resolve } = Promise.withResolvers();
	await page.route("**/*", (route) => {
		const resourceType = route.request().resourceType();
		if ([
			"image",
			"media",
			"font",
			"stylesheet",
			"ping"
		].includes(resourceType)) route.abort();
		else route.continue();
	});
	page.on("response", async (res) => {
		if (res.ok() && res.url().includes("/live_api/profile/public")) {
			const resData = await res.json();
			if (resData.data.list.length > 0) resolve(resData.data);
			else {
				if (retryCount > config.requestRetry) resolve({});
				setTimeout(() => {
					page.reload();
					retryCount++;
				}, 3e3);
			}
		} else if (res.ok() && res.url().includes("/live_api/baseuser/userinfo/byid")) userInfo = (await res.json()).data.userInfo;
	});
	await page.goto("https://www.kuaishou.com", { waitUntil: "domcontentloaded" });
	await page.goto(`https://live.kuaishou.com/profile/${principalId}`);
	const resData = await promise;
	await context.close();
	return {
		title: userInfo?.name ?? `${principalId}的作品 - 快手`,
		item: resData?.list?.map((item) => ({
			author: item.author.name,
			description: `<video controls preload="metadata" poster="${item.poster}">
                    <source src="${item.playUrl}" type="video/mp4">
                </video>`,
			id: item.id,
			guid: item.id,
			banner: item.poster,
			media: { content: { url: item.playUrl } }
		})) || []
	};
}
//#endregion
export { route };
