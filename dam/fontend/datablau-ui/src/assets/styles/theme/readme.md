# element ui 主题相关文件

## chooseTheme 组件

`datablau-web/src/components/common/themePick/chooseTheme.vue` 文件中定义了所以备选的主题。

## color-picker 组件

`datablau-web/src/components/common/themePick/colorPicker.vue` 文件：

- 这个组件中引入了各个主题的 css 文件与 js 中定义的颜色值，并且在修改主题时自动替换
- 原本有一个选择颜色，然后自动生成主题的功能，没有完善，不能使用

## 增加主题步骤:

 1. 在 element 官网配置新主题颜色, 生成新主题文件(自动生成主题网址: https://element.eleme.cn/#/zh-CN/theme),
1. 在`datablau-web/static/css/theme` 文件夹下, 新建文件夹,名称为 custom-theme-主题名, 将下载的文件解压缩到新文件夹下，
1. 复制 `datablau-web/src/assets/styles/theme/defaultThemeColor.js` 文件并修改颜色值，作为新主题文件的颜色文件，
1. 在 `datablau-web/src/assets/styles/theme/themeColorMap.js` 中引入新创建的颜色文件，命名为新的主题名称，
1. 在 `datablau-web/src/components/common/themePick/chooseTheme.vue` 文件中增加新的主题选项，

## 组件内使用主题颜色

- 如果仅使用颜色，直接在 css/scss 中使用 `var(变量)` 就可以
- 如果需要监听事件，需要引入 mixin 文件，`datablau-web/src/components/common/themePick/themeMixin.js`，并在外部组件实现 `handleThemeChange` 方法，该方法会在主题变化时出发，参数是方法名，同时 mixin 会向组件添加 `themeName` 变量，值为主题名称

## 注意事项

- `defaultThemeColor.js` 文件中颜色分为四部分，后两部分在新增主题时，改动的地方可能较少。
  1. 同  `element-ui` 相同
  1. 自定义变量，根据主题修改
  1. 默认与白色主题相同，即白底黑字，
  1. 默认与黑色主题相同，即黑底白字

- 全局变量中保存了主题名, 但是只能在使用的时候去取值, 不能通过 watch 或者 computed 监听变化, 在 `$globalData.$theme` 中, 主要为 `themeName` 变量, 如果需要, 可以增加变量
