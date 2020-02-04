const path = require('path')
const resolve = dir => path.join(__dirname,dir)
const BASE_URL = process.env.NODE_ENV ==='production'?'/statics/':'/'

module.exports = {
	lintOnSave: false,
	// outputDir: path.join(__dirname, '../www/statics/'),
	publicPath: BASE_URL,
	// indexPath: path.join(__dirname, '../view/index/m_index.php'),
	productionSourceMap: false,
	devServer: {
		disableHostCheck: true
	},
	pluginOptions: {
		'style-resources-loader': {
			preProcessor: 'less',
			patterns: [resolve('src/assets/var.less')]
		}
	}
}
