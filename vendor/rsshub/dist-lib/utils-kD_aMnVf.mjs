import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/luogu/utils.ts
const getUserInfoFromUID = (uid) => cache_default.tryGet("luogu:username:" + uid, async () => {
	const data = await got_default(`https://www.luogu.com/user/${uid}`, { query: { _contentOnly: 1 } });
	return {
		name: data.data.currentData.user.name,
		description: data.data.currentData.user.slogan,
		avatar: data.data.currentData.user.avatar
	};
});
//#endregion
export { getUserInfoFromUID as t };
