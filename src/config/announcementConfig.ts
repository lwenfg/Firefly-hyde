import type { AnnouncementConfig } from "../types/announcementConfig";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题
	title: "",

	// 公告内容
	content: "👋🏻 Hi，我是lwenfg，欢迎你！这里是我分享知识和记录生活的地方，希望你能在这里找到有价值的内容",

	// 是否允许用户关闭公告
	closable: false,

	link: {
		// 启用链接
		enable: true,
		// 链接文本
		text: "了解更多",
		// 链接 URL
		url: "/about/",
		// 内部链接
		external: false,
	},
};
