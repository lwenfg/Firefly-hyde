import {
	type NavBarConfig,
	type NavBarLink,
	type NavBarSearchConfig,
	NavBarSearchMethod,
} from "../types/navBarConfig";

// ============================================================================
// 导航栏配置 - 根据顺序动态生成导航栏链接
// NavBar Configuration - Dynamically generate navigation bar links based on order
// ============================================================================
const getDynamicNavBarConfig = (): NavBarConfig => {
	// 基础导航栏链接
	const links: NavBarLink[] = [];

	// 主页
	links.push(LinkPresets.Home);

	// 关于我
	links.push(LinkPresets.About);

	// 文章及其子菜单
	links.push({
		name: "文章",
		url: "#",
		icon: "material-symbols:article",
		children: [
			// 归档
			LinkPresets.Archive,

			// 分类
			LinkPresets.Categories,

			// 标签
			LinkPresets.Tags,

			/*
			// 系列功能已停用
			LinkPresets.Series,
			*/
		],
	});

	// 日常及其子菜单
	links.push({
		name: "日常",
		url: "#",
		icon: "material-symbols:bolt-outline",
		children: [
			/*
			// 朋友圈功能已停用
			LinkPresets.Moments,
			*/

			// 动态
			LinkPresets.Dynamic,

			/*
			// 日记模块暂时停用
			LinkPresets.Diary,
			*/
		],
	});

	// 社交及其子菜单
	links.push({
		name: "社交",
		url: "#",
		icon: "material-symbols:group",
		children: [
			/*
			// 友链功能已停用
			LinkPresets.Friends,
			*/

			// 留言
			LinkPresets.Guestbook,
		],
	});

	// 我的及其子菜单
	links.push({
		name: "我的",
		url: "#",
		icon: "material-symbols:person",
		children: [
			// 相册
			LinkPresets.Gallery,

			// 哔哩哔哩追番
			LinkPresets.Bilibili,

			// 书签导航
			LinkPresets.Booknav,

			// Bangumi 已停用
			// LinkPresets.Bangumi,

			/*
			// 音乐页面入口已停用；侧边栏播放器和播放控制保留
			LinkPresets.Music,
			*/

			// 足迹
			LinkPresets.Places,
			// VNDB 已停用
			// LinkPresets.VNDB,

			// MyAnimeList 已停用
			// LinkPresets.MAL,
		],
	});

	// 其他及其子菜单
	links.push({
		name: "其他",
		url: "/other/",
		icon: "material-symbols:more-horiz",
		children: [
			// 项目
			LinkPresets.Projects,

			// 时间线
			LinkPresets.Timeline,

			/*
			{
				name: "统计",
				url: "https://umami.seasir.top/share/cp5SqrNUOxbulLZt/seasir.top",
				external: true,
				icon: "fa7-solid:chart-simple",
			},
			*/
		],
	});

	// GitHub
	links.push({
		name: "GitHub",
		url: "https://github.com/lwenfg",
		external: true,
		icon: "fa7-brands:github",
	});

	// 自定义导航栏链接示例2：带子菜单（混用预设链接）
	// links.push({
	// 	name: "链接",
	// 	url: "/links/",
	// 	icon: "material-symbols:link",

	// 	// 子菜单
	// 	children: [
	// 		{
	// 			name: "GitHub",
	// 			url: "https://github.com/CuteLeaf/Firefly",
	// 			external: true,
	// 			icon: "fa7-brands:github",
	// 		},
	// 		{
	// 			name: "Bilibili",
	// 			url: "https://space.bilibili.com/38932988",
	// 			external: true,
	// 			icon: "fa7-brands:bilibili",
	// 		},
	// 		LinkPreset.Friends,
	// 	],
	// });

	// 仅返回链接，其它导航搜索相关配置在模块顶层常量中独立导出

	return { links } as NavBarConfig;
};

// 导航搜索配置
export const navBarSearchConfig: NavBarSearchConfig = {
	method: NavBarSearchMethod.PageFind,
};

// ============================================================================
// 链接预设 - 可自由自定义导航栏链接的名称、图标和URL
// Link Presets - Allows free customization of the name, icon, and URL of navigation bar links
// ============================================================================
export const LinkPresets: Record<string, NavBarLink> = {
	Home: {
		name: "主页",
		url: "/",
		icon: "material-symbols:home",
	},
	Archive: {
		name: "归档",
		url: "/archive/",
		icon: "material-symbols:archive",
	},
	Categories: {
		name: "分类",
		url: "/categories/",
		icon: "material-symbols:folder-open-rounded",
	},
	Tags: {
		name: "标签",
		url: "/tags/",
		icon: "material-symbols:label",
	},
	Series: {
		name: "系列",
		url: "/series/",
		icon: "material-symbols:layers",
	},
	Friends: {
		name: "友链",
		url: "/friends/",
		icon: "material-symbols:link-2-rounded",
		pageKey: "friends",
	},
	Guestbook: {
		name: "留言",
		url: "/guestbook/",
		icon: "material-symbols:chat",
		pageKey: "guestbook",
	},
	Dynamic: {
		name: "动态",
		url: "/dynamic/",
		icon: "material-symbols:forum-rounded",
		pageKey: "dynamic",
	},
	Gallery: {
		name: "相册",
		url: "/gallery/",
		icon: "material-symbols:photo-library",
		pageKey: "gallery",
	},
	Booknav: {
		name: "书签导航",
		url: "/booknav/",
		icon: "material-symbols:bookmarks",
		pageKey: "booknav",
	},
	Bilibili: {
		name: "哔哩哔哩",
		url: "/bilibili/",
		icon: "fa7-brands:bilibili",
		pageKey: "bilibili",
	},
	// Bangumi、VNDB、MyAnimeList 和设备页面已停用
	Diary: {
		name: "日记",
		url: "/diary/",
		icon: "material-symbols:book",
	},
	Projects: {
		name: "项目",
		url: "/projects/",
		icon: "material-symbols:work",
	},
	Timeline: {
		name: "时间线",
		url: "/timeline/",
		icon: "material-symbols:timeline",
	},
	Music: {
		name: "音乐",
		url: "/music/",
		icon: "material-symbols:music-note-rounded",
		pageKey: "music",
	},
	Places: {
		name: "足迹",
		url: "/places/",
		icon: "material-symbols:location-on",
		pageKey: "places",
	},
	/*
	Moments: {
		name: "朋友圈",
		url: "/moments/",
		icon: "mdi:wechat",
	},
	*/
	Admin: {
		name: "登录",
		url: "/admin/",
		icon: "material-symbols:lock",
	},
	Anime: {
		name: "追番",
		url: "/anime/",
		icon: "material-symbols:live-tv",
		pageKey: "anime",
	},
	// Sponsor 已停用
	About: {
		name: "关于我",
		url: "/about/",
		icon: "material-symbols:person",
	},
};

export const navBarConfig: NavBarConfig = getDynamicNavBarConfig();
