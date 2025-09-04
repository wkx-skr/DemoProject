<template>
  <div class="cm" :class="fullScreen ? 'cm-fullscreen' : ''" ref="cm">
    <div class="toolbar" v-if="showToolbar">
      <!-- <div class="toolbar" v-if="this.option.toolbar"> -->
      <datablau-button
        v-if="showToolbar && option.formater"
        type="secondary"
        class="sql-btn"
        @click="formaterSql(newVal)"
      >
        {{ $t('component.codeMirror.format') }}
      </datablau-button>
      <div class="copySql" v-if="option.copy">
        <datablau-button type="secondary" v-if="newVal" @click="copy">
          {{ $t('component.codeMirror.copy') }}
        </datablau-button>
      </div>
      <!-- <div class="partLine"></div>-->
      <div class="setTheme" v-if="showToolbar && option.setTheme">
        <span>{{ $t('component.codeMirror.theme') }}</span>
        <datablau-select v-model="theme" @change="changeTheme" class="selTheme">
          <el-option
            v-for="item in themes"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </datablau-select>
      </div>
      <div class="setFontsize" v-if="showToolbar && option.setFontSize">
        <span>{{ $t('component.codeMirror.fontsize') }}</span>
        <el-input-number
          v-model="fontsize"
          @change="handleChangeFontsize"
          :min="12"
          :max="30"
          step-strictly
          :step="2"
          size="medium"
        ></el-input-number>
      </div>
      <div class="setDbType" v-if="option.dbType">
        <span>{{ $t('component.codeMirror.database') }}</span>
        <datablau-select v-model="dbType" @change="changeDb">
          <el-option
            v-for="item in dbTypes"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </datablau-select>
      </div>
      <div class="fullScreen" v-if="showToolbar && option.fullScreen">
        <el-button type="text" size="mini">
          <span
            class="icon-btn"
            v-if="!fullScreen"
            @click="setFullScreen"
            :title="$t('component.codeMirror.fullScreen')"
            ref="fullScreen"
          >
            <i class="fa fa-arrows-alt"></i>
            {{ $t('component.codeMirror.fullScreen') }}
          </span>
          <span
            class="icon-btn"
            v-else
            @click="setFullScreen"
            :title="$t('component.codeMirror.escFullScreen')"
          >
            <i class="fa fa-window-close-o"></i>
            {{ $t('component.codeMirror.escFullScreen') }}
          </span>
        </el-button>
      </div>
    </div>
    <!-- <div class="toolbar">
      <el-dropdown
        style="cursor: pointer"
        trigger="click"
        size="small"
        placement="bottom-start"
        @command="handleSetting"
      >
        <i class="iconfont icon-shezhi"></i>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="copy">复制</el-dropdown-item>
          <el-dropdown-item command="formatter">格式化</el-dropdown-item>
          <el-dropdown-item command="setTheme">主题设置</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <div class="fullScreen" v-if="showToolbar && option.fullScreen">
        <el-button type="text" size="mini">
          <span
            class="icon-btn"
            v-if="!fullScreen"
            @click="setFullScreen"
            title="全屏"
            ref="fullScreen"
          >
            <i class="fa fa-arrows-alt"></i>
            全屏
          </span>
          <span
            class="icon-btn"
            v-else
            @click="setFullScreen"
            title="退出全屏"
          >
            <i class="fa fa-window-close-o"></i>
            退出全屏
          </span>
        </el-button>
      </div>
    </div>-->
    <div class="cmText" :style="styleCustom">
      <textarea ref="mycode" class="" v-model="value"></textarea>
    </div>
  </div>
</template>
<script>
import 'codemirror/theme/juejin.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/hint/show-hint.css'
import './fullscreen.scss'
import { mapState } from 'vuex'
import { format } from 'sql-formatter'
let CodeMirror = require('codemirror/lib/codemirror')
require('codemirror/addon/edit/matchbrackets')
require('codemirror/addon/selection/active-line')
require('codemirror/mode/sql/sql')
require('codemirror/addon/hint/show-hint')
require('codemirror/addon/hint/sql-hint')
require('codemirror/addon/display/fullscreen')
require('codemirror/addon/comment/comment')
require('codemirror/addon/edit/closebrackets')

export default {
  name: 'DatablauCodeMirror',
  data() {
    return {
      editor: null,
      themes: [],
      theme: 'juejin',
      dbType: 'mysql',
      dbTypes: [],
      fullScreen: false,
      fontsize: 14,
    }
  },
  props: {
    value: {
      type: String,
      default: '',
    },
    sqlStyle: {
      type: String,
      default: 'default',
    },
    readOnly: {
      type: [Boolean, String],
      default: false,
    },
    option: {
      type: Object,
      default: () => {
        return {}
      },
    },
    tables: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  watch: {
    newVal(newV, oldV) {
      if (this.editor) {
        this.$emit('change', this.editor.getValue())
      }
    },
  },
  computed: {
    ...mapState({
      getThemeData: state => state.codeMirror.themeData,
      getTables: state => state.codeMirror.tables,
      getDbTypes: state => state.codeMirror.dbTypes,
    }),
    newVal() {
      if (this.editor) {
        return this.editor.getValue()
      }
    },
    styleCustom() {
      $('.cmText .CodeMirror').css({
        lineHeight: (this.fontsize - 4) * 2 + 'px',
      })
      return {
        fontSize: this.fontsize + 'px',
      }
    },
    showToolbar() {
      return this.option.hasOwnProperty('toolbar') ? this.option.toolbar : true
    },
    /*
    showFormater() {
      return this.option.hasOwnProperty('formater') ? this.option.formater : true
    }, */
  },
  created() {
    this.themes = this.getThemeData
    this.dbTypes = this.getDbTypes
  },
  mounted() {
    this.init()
    this.editor.setOption('mode', `text/x-${this.dbType}`)
  },
  methods: {
    /* handleSetting(command) {
      if(command === 'copy') {
        this.copy()
      } else if(command === 'formatter') {
        this.formaterSql()
      } else if(command === 'setTheme') {

      }
    }, */
    init() {
      let vm = this
      this.editor = CodeMirror.fromTextArea(this.$refs.mycode, {
        value: this.value,
        mode: this.dbType,
        indentWithTabs: true,
        styleActiveLine: true,
        smartIndent: true,
        lineNumbers: true,
        gutters: this.option.gutterMark
          ? ['CodeMirror-linenumbers', 'breakpoints']
          : '',
        matchBrackets: true, // 括号匹配
        cursorHeight: 1,
        lineWrapping: true,
        readOnly: this.readOnly ? 'nocursor' : false,
        theme: this.theme,
        autoCloseBrackets: true,
        // autofocus: true,
        extraKeys: {
          Ctrl: 'autocomplete',
          F11: function (cm) {
            // cm.setOption("fullScreen", !cm.getOption("fullScreen"))
            vm.setFullScreen()
          },
          Esc: function (cm) {
            if (cm.getOption('fullScreen')) cm.setOption('fullScreen', false)
            $(vm.$refs.cm).removeClass('cm-fullscreen')
          },
        },
        hintOptions: {
          completeSingle: false,
          // 自定义表联想配置
          tables: this.tables,
        },
      })
      // 初加载自动格式化
      if (this.value) {
        this.formaterSql()
      }
      // 代码自动提示功能，使用cursorActivity事件，不要使用change事件，页面会直接卡死
      /* this.editor.on('inputRead', () => {
        this.editor.showHint()
      }) */
      // 代码自动提示--调用keyup事件
      this.editor.on('keyup', (cm, event) => {
        if (event.keyCode >= 65 && event.keyCode <= 90) {
          cm.showHint()
        }
      })
      // 自定义宽高
      // this.editor.setSize('500px', '100px')
      this.editor.on('gutterClick', function (cm, n) {
        let info = cm.lineInfo(n)
        cm.setGutterMarker(
          n,
          'breakpoints',
          info.gutterMarkers ? null : vm.makeMarker()
        )
      })
    },
    makeMarker() {
      let marker = document.createElement('div')
      marker.style.color = '#822'
      marker.innerHTML = '●'
      return marker
    },
    setVal() {
      if (this.editor) {
        if (this.value === '') {
          this.editor.setValue('')
        } else {
          this.editor.setValue(this.value)
        }
      }
    },
    // 格式化
    formaterSql() {
      this.editor.setValue(format(this.newVal))
    },
    // 切换主题
    changeTheme(val) {
      import(`codemirror/theme/${val}.css`)
      this.editor.setOption('theme', val)
    },
    // 切换数据库
    changeDb(val) {
      // this.editor.setOption('theme', val)
      this.editor.setOption('mode', `text/x-${val}`)
    },
    // 全屏 / 退出全屏
    setFullScreen() {
      this.fullScreen = !this.editor.getOption('fullScreen')
      this.editor.setOption('fullScreen', !this.editor.getOption('fullScreen'))
    },
    copy() {
      this.handleCopy(this.newVal)
      this.$message({
        message: this.$t('component.codeMirror.copySucceed'),
        type: 'success',
      })
    },
    // 复制
    handleCopy(str) {
      let result = false
      const input = document.createElement('input')
      input.setAttribute('readonly', 'readonly')
      input.setAttribute('value', str)
      document.body.appendChild(input)
      input.focus()
      input.select()
      input.setSelectionRange(0, str.length)
      if (document.execCommand('copy')) {
        document.execCommand('copy', false, null)
        result = true
      }
      document.body.removeChild(input)
      return result
    },
    handleChangeFontsize(val) {
      // console.log(val)
    },
  },
}
</script>
<style lang="scss">
.cm {
  max-width: 1000px;
  .CodeMirror {
    //direction: ltr;
    line-height: 22px;
    & pre.CodeMirror-line {
      padding-left: 16px;
    }
  }
  .CodeMirror-hints {
    z-index: 9999 !important;
  }
  .toolbar {
    background: #e7e7ea;
    padding: 10px;
    min-height: 44px;
    line-height: 34px;
    .setTheme {
      display: inline-block;
      margin-left: 50px;
      .selTheme {
        display: inline-block;
        width: 120px;
        margin-left: 10px;
      }
    }
    /*.partLine {
      display: inline-block;
      width: 0;
      height: 34px;
      vertical-align: middle;
      line-height: 30px;
      border-left: 1px solid #827e7e;
      margin: 0 50px;
    }*/
    .fullScreen {
      float: right;
    }
    .copySql {
      display: inline-block;
      margin-left: 10px;
    }
    .setFontsize {
      display: inline-block;
      margin-left: 10px;
      .el-input-number {
        width: 110px;
        height: 34px;
        line-height: 34px;
        margin-left: 10px;
        .el-input {
          height: 34px;
        }
        /*.el-input__inner {
          height: 34px;
        }
        .el-input-number__decrease,
        .el-input-number__increase {
          height: 17px;
        }*/
      }
    }
    .setDbType {
      display: inline-block;
      margin-left: 10px;
      .datablau-select {
        display: inline-block;
        width: 120px;
        margin-left: 10px;
      }
    }
  }
  .cmText {
    /*.CodeMirror.CodeMirror-wrap {
      font-size: var(fontSize);
      line-height: var(lineHeight);
    }*/
  }
}
</style>
