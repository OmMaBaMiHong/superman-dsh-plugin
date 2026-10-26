import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/themoviedb/api-key.ts
const KEYS = [
	"fb7bb23f03b6994dafc674c074d01761",
	"e55425032d3d0f371fc776f302e7c09b",
	"8301a21598f8b45668d5711a814f01f6",
	"8cf43ad9c085135b9479ad5cf6bbcbda",
	"da63548086e399ffc910fbc08526df05",
	"13e53ff644a8bd4ba37b3e1044ad24f3",
	"269890f657dddf4635473cf4cf456576",
	"a2f888b27315e62e471b2d587048f32e",
	"8476a7ab80ad76f0936744df0430e67c",
	"5622cafbfe8f8cfe358a29c53e19bba0",
	"ae4bd1b6fce2a5648671bfc171d15ba4",
	"257654f35e3dff105574f97fb4b97035",
	"2f4038e83265214a0dcd6ec2eb3276f5",
	"9e43f45f94705cc8e1d5a0400d19a7b7",
	"af6887753365e14160254ac7f4345dd2",
	"06f10fc8741a672af455421c239a1ffc",
	"fb7bb23f03b6994dafc674c074d01761",
	"09ad8ace66eec34302943272db0e8d2c"
];
const keys = () => KEYS[Math.floor(Math.random() * KEYS.length)];
//#endregion
//#region lib/routes/themoviedb/utils.tsx
const handleDescription = (item) => {
	const poster_path = item.poster_path ?? item.still_path;
	const poster = poster_path ? `https://image.tmdb.org/t/p/original${poster_path}` : null;
	const description = item.overview.trim();
	return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		poster ? /* @__PURE__ */ jsx("img", { src: poster }) : null,
		/* @__PURE__ */ jsxs("p", { children: [
			"User Score: ",
			item.vote_average,
			/* @__PURE__ */ jsx("br", {}),
			"Vote Count: ",
			item.vote_count
		] }),
		/* @__PURE__ */ jsx("p", { children: description })
	] }));
};
const handleMovieItem = (item, lang) => ({
	title: lang ? item.title : item.original_title,
	link: `https://www.themoviedb.org/movie/${item.id}`,
	description: handleDescription(item),
	pubDate: item.release_date ? parseDate(item.release_date) : void 0
});
const handleTVShowItem = (item, lang) => ({
	title: lang ? item.name : item.original_name,
	link: `https://www.themoviedb.org/tv/${item.id}`,
	description: handleDescription(item),
	pubDate: item.first_air_date ? parseDate(item.first_air_date) : void 0
});
const MEDIA_TYPE_TO_ITEM_HANDLE = {
	tv: handleTVShowItem,
	movie: handleMovieItem
};
//#endregion
export { keys as i, handleDescription as n, handleMovieItem as r, MEDIA_TYPE_TO_ITEM_HANDLE as t };
