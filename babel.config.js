module.exports = {
	presets: [
		'@vue/cli-plugin-babel/preset'
	],
	// 按需引入CSS
	plugins: [
		['import', {
			libraryName: 'vant',
			libraryDirectory: 'es',
			style: true
		}, 'vant']
	]
}
