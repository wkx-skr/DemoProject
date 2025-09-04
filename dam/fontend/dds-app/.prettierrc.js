module.exports = {
  // 字符串使用单引号
  singleQuote: true,
  // 每行末尾自动添加分号
  semi: false,
  // tab缩进大小,默认为2
  tabWidth: 2,
  // 使用tab缩进，默认false
  useTabs: false,
  // 对象中打印空格 默认true
  // true: { foo: bar }
  // false: {foo: bar}
  bracketSpacing: true,
  // 箭头函数参数括号 默认avoid 可选 avoid| always
  // avoid 能省略括号的时候就省略 例如x => x
  // always 总是有括号
  arrowParens: 'avoid',
  // 换行长度，默认80
  printWidth: 80,

  // 设置为true时,将多行JSX元素的 > 放在最后一行的末尾，而不是单独放在下一行
  /*
    <button
       className="prettier-class"
       id="prettier-id"
       onClick={this.handleClick}>
       Click Here
    </button>
     */
  // 设置为false时
  /*
    <button
        className="prettier-class"
        id="prettier-id"
        onClick={this.handleClick}
    >
        Click Here
    </button>
     */
  // jsxBracketSameLine: true, //多属性html标签的‘>’折行放置
  // jsxSingleQuote: true, // jsx中使用单引号
  // trailingComma: 'all', //多行时尽可能打印尾随逗号
  quoteProps: 'as-needed', //仅在必需时为对象的key添加引号
  requirePragma: false, //无需顶部注释即可格式化
  insertPragma: false, //在已被preitter格式化的文件顶部加上标注
  proseWrap: 'preserve', // md 等空格敏感文本的自动折行相关配置, 配合 Print Width 使用
  htmlWhitespaceSensitivity: 'ignore', //对HTML全局空白不敏感
  vueIndentScriptAndStyle: false, //不对vue中的script及style标签缩进
  endOfLine: 'auto', //结束行形式
  embeddedLanguageFormatting: 'auto', //对引用代码进行格式化
};
