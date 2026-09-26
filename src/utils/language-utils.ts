/**
 * 获取语言的显示名称
 * @param langCode 语言代码（配置文件格式或翻译服务格式）
 * @returns 语言的显示名称
 */
export function getLanguageDisplayName(langCode: string): string {
	const languageNames: Record<string, string> = {
		zh_CN: "简体中文",
		en: "English",
		chinese_simplified: "简体中文",
		english: "English",
	};

	return languageNames[langCode] || langCode;
}
