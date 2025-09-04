module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    ['prismjs',
      {
        'languages': ['javascript', 'css', 'markup', 'sql', 'plsql', 'java'],
        'plugins': ['line-numbers', 'keep-markup'],
        'css': true
      }
    ]
  ]
}
