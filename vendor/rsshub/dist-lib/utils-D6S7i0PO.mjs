import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/newrank/utils.ts
const newrank_cookie_token = "newrank_cookie_token";
const query_count = "newrank_cookie_count";
const max_query_count = 30;
const random_nonce = (count) => {
	const arr = [
		"0",
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"a",
		"b",
		"c",
		"d",
		"e",
		"f"
	];
	const shuffled = [...arr];
	let i = arr.length, temp, index, str = "";
	const min = i - count;
	while (i-- > min) {
		index = Math.floor((i + 1) * Math.random());
		temp = shuffled[index];
		str += temp;
	}
	return str;
};
const decrypt_login_xyz = (username, decrypt_password, nonce) => {
	return md5("/nr/user/login/loginByAccount?AppKey=joker&account=" + username + "&password=" + decrypt_password + "&state=1&nonce=" + nonce);
};
const decrypt_wechat_detail_xyz = (uid, nonce) => {
	return md5("/xdnphb/detail/v1/rank/article/lists?AppKey=joker&account=" + uid + "&nonce=" + nonce);
};
const decrypt_douyin_account_xyz = (nonce) => {
	return md5("/xdnphb/nr/cloud/douyin/detail/accountInfoAll?AppKey=joker&nonce=" + nonce);
};
const decrypt_douyin_detail_xyz = (nonce) => {
	return md5("/xdnphb/nr/cloud/douyin/detail/aweme?AppKey=joker&nonce=" + nonce);
};
const flatten = (arr) => {
	const result = [];
	for (const val of arr) if (Array.isArray(val)) result.push(...flatten(val));
	else result.push(val);
	return result;
};
function shouldUpdateCookie(forcedUpdate = false) {
	if (forcedUpdate) cache_default.set(query_count, 0);
	else {
		const count = cache_default.get(query_count);
		if (count) if (count > max_query_count) {
			cache_default.set(query_count, 0);
			clearCookie();
		} else cache_default.set(query_count, count + 1);
		else cache_default.set(query_count, 1);
	}
}
function clearCookie() {
	cache_default.set(newrank_cookie_token, null);
}
async function getCookie() {
	shouldUpdateCookie();
	let token = await cache_default.get(newrank_cookie_token);
	const username = String(config.newrank.username);
	const password = md5(md5(String(config.newrank.password)) + "daddy");
	const nonce = random_nonce(9);
	const xyz = decrypt_login_xyz(username, password, nonce);
	if (!token) {
		const set_cookie = (await got_default({
			method: "post",
			url: "https://www.newrank.cn/nr/user/login/loginByAccount",
			form: {
				account: username,
				password,
				state: 1,
				nonce,
				xyz
			}
		})).headers["set-cookie"];
		if (set_cookie) {
			for (const e of set_cookie) if (e.indexOf("token") === 0) token = e.split(";", 1)[0];
		}
		cache_default.set(newrank_cookie_token, token, 600);
		shouldUpdateCookie(true);
	}
	return token;
}
var utils_default = {
	getCookie,
	random_nonce,
	decrypt_wechat_detail_xyz,
	decrypt_douyin_account_xyz,
	decrypt_douyin_detail_xyz,
	flatten
};
//#endregion
export { utils_default as t };
