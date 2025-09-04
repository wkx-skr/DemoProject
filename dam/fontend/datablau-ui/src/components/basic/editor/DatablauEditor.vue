<template>
  <div class="datablau-editor" :test-name="testName">
    <div :id="quillId + 'Toolbar'">
      <button
        class="ql-header"
        value="1"
        :title="$t('component.editor.primaryTitle')"
      ></button>
      <button
        class="ql-header"
        value="2"
        :title="$t('component.editor.secondaryTitle')"
      ></button>
      <select class="ql-header" :title="$t('component.editor.titleLevel')">
        <option value="1">{{ $t('component.editor.primaryTitle') }}</option>
        <option value="2">{{ $t('component.editor.secondaryTitle') }}</option>
        <option value="3">{{ $t('component.editor.thirdTitle') }}</option>
        <option value="Normal" selected>
          {{ $t('component.editor.text') }}
        </option>
      </select>
      <button
        class="ql-list"
        value="ordered"
        :title="$t('component.editor.orderedList')"
      ></button>
      <button
        class="ql-list"
        value="bullet"
        :title="$t('component.editor.unorderedList')"
      ></button>
      <select class="ql-align" :title="$t('component.editor.align')"></select>
      <button class="ql-bold" :title="$t('component.editor.bold')"></button>
      <button class="ql-italic" :title="$t('component.editor.italic')"></button>
      <button
        class="ql-underline"
        :title="$t('component.editor.underline')"
      ></button>
      <button class="ql-strike" :title="$t('component.editor.strike')"></button>

      <select class="ql-color" :title="$t('component.editor.color')"></select>
      <select
        class="ql-background"
        :title="$t('component.editor.background')"
      ></select>
      <!-- <button class="ql-link" :title="$t('component.editor.link')"></button> -->
      <button
        class="ql-code-block"
        :title="$t('component.editor.codeBlock')"
      ></button>
      <button
        class="ql-blockquote"
        :title="$t('component.editor.blockquote')"
      ></button>
      <!--<button @click="handleAtClick"><b>@</b></button>-->
    </div>
    <div :id="quillId" style="padding-top: 15px; padding-bottom: 15px">
      <!--<p>Hello World!</p>-->
      <!--<p>Some initial <strong>bold</strong> text</p>-->
      <p><br /></p>
    </div>
    <button
      id="anchor"
      @click="showPopover = true"
      v-popover:popover_context
      :style="btnStyle"
    >
      btn
    </button>
    <!--    <el-popover
      ref="popover_context"
      placement="top-start"
      class="context-menus"
      :visible-arrow="false"
      width="0"
      title=""
      :offset="10"
      trigger="click"
      @show="initRemovePopoverListener"
      v-model="showPopover"
      :key="showPopover"
    >
      <div class="context-menu-style" style="max-height: 150px; overflow: auto">
        <div
          class="context-option"
          v-for="o in options"
          :key="o.userId"
          @click="handleOptionClick(o)"
        >
          &lt;!&ndash;<i class="el-icon-plus"></i>&ndash;&gt;
          {{ o.username }}
        </div>
      </div>
    </el-popover>-->
  </div>
</template>

<script>
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
export default {
  name: 'DatablauEditor',
  mounted() {
    var toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'], // toggled buttons
      ['blockquote', 'code-block'],

      [{ header: 1 }, { header: 2 }], // custom button values
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      // [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
      [{ direction: 'rtl' }], // text direction
      // ['link'],
      // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown

      [{ color: [] }, { background: [] }], // dropdown with defaults from theme
      [{ font: [] }],
      [{ align: [] }],

      ['clean'], // remove formatting button
    ]
    console.log(this.quillId)
    this.quill = new Quill('#' + this.quillId, {
      theme: 'snow',
      modules: {
        // toolbar: toolbarOptions
        toolbar: {
          container: '#' + this.quillId + 'Toolbar',
        },
      },
    })
    this.quill.on('text-change', this.handleEditorChange)
  },
  beforeDestroy() {
    this.quill.off('text-change', this.handleEditorChange)
  },
  props: ['users', 'editorId', 'testName'],
  data() {
    return {
      showPopover: false,
      options: this.users,
      quillId: this.editorId || 'editor',
      btnStyle: {
        color: 'red',
        left: '10px',
        top: '100px',
        position: 'absolute',
        opacity: 0.5,
        visibility: 'hidden',
      },
      quill: null,
      indexOfAt: 0,
      textOfAt: '',
    }
  },
  methods: {
    handleEditorChange(delta, oldDelta, source) {
      if (source === 'user') {
        const range = this.quill.getSelection()
        this.showPopover = false
        if (range) {
          if (range.length === 0) {
            const text = this.quill.getText(range.index - 8, 8)
            const result = this.figureOutIfAt(text)
            if (result) {
              this.textOfAt = result.text.substr(1)
              this.indexOfAt = range.index
              {
                this.options = []
                for (const i in this.users) {
                  const item = this.users[i]
                  if (
                    item.username
                      .toLowerCase()
                      .indexOf(this.textOfAt.toLowerCase()) !== -1
                  ) {
                    this.options.push(item)
                  }
                }
              }
              this.showPopover = true
              {
                if (
                  this.options.length === 1 &&
                  this.options[0].username === this.textOfAt
                ) {
                  $(
                    '.context-option:contains(' + this.textOfAt + ')'
                  )[0].click()
                }
              }
              this.initRemovePopoverListener()
            } else {
              this.showPopover = false
            }
          }
        } else {
          console.debug('User cursor is not in editor')
        }
      }
    },
    figureOutIfAt(str) {
      const length = str.length
      let result = ''
      for (let i = length - 1; i >= 0; i--) {
        if (str[i] === '@') {
          result = str.slice(i, length)
          return {
            text: result,
            length: length - i,
          }
        }
      }
      return false
    },
    handleAtClick() {},
    handleKeyDown(ev) {
      console.warn(ev)
    },
    initRemovePopoverListener() {
      $('.context-option').one('click', () => {
        this.showPopover = false
      })
      $(window).one('click', () => {
        this.showPopover = false
      })
    },
    handleOptionClick(option) {
      this.showPopover = false
      const length = this.textOfAt.length + 1
      this.quill.deleteText(this.indexOfAt - length, length)

      this.quill.insertText(this.indexOfAt - length, ` @${option.username} `, {
        color: '#71aedd',
        italic: true,
      })
      this.quill.removeFormat(this.indexOfAt - length, 1)
      this.quill.removeFormat(
        this.indexOfAt - length + option.username.length + 2,
        1
      )
      this.quill.setSelection(
        this.indexOfAt - length + option.username.length + 3
      )
    },
    handleSubmit() {
      const dom = $('.ql-editor[contenteditable]')
      let html = dom.html()
      if (html.endsWith('<p><br></p><p><br></p><p><br></p>')) {
        html = html.slice(0, -33)
      } else if (html.endsWith('<p><br></p><p><br></p>')) {
        html = html.slice(0, -22)
      }
      if (!$(html).text().trim()) {
        this.$message.warning(this.$t('component.editor.emptyMsg'))
        return
      }
      return new Promise(resolve => {
        resolve(html)
        dom.html('')
      })
    },
  },
}
</script>

<style lang="scss">
.datablau-editor {
  .ql-snow .ql-fill,
  .ql-snow .ql-stroke.ql-fill {
    fill: var(--quill-tool-bar);
  }
  .ql-snow .ql-stroke {
    stroke: var(--quill-tool-bar);
  }
  .ql-snow .ql-picker {
    color: var(--quill-tool-bar);
  }
  .ql-snow .ql-picker-options {
    background-color: var(--default-bgc);
  }
}
</style>
