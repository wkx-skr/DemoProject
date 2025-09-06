// https://github.com/michael-ciniawsky/postcss-load-config
// import obj from "./src/assets/styles/theme/defaultThemeColor.js"
// console.log(obj, 'obj')
const defaultTheme = require('./src/assets/styles/theme/defaultThemeColor.js')

const plugins = {
    // to edit target browsers: use "browserlist" field in package.json
    autoprefixer: {},
    'postcss-css-variables': {
        preserve: true,
        preserveInjectedVariables: true,
        variables: defaultTheme,
    },
}
if (process.env.NODE_ENV !== 'production') {
    delete plugins['postcss-css-variables']
}
module.exports = {
    plugins: plugins,
}
