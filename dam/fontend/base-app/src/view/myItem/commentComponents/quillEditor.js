import Quill from 'quill'
import 'quill/dist/quill.snow.css'
export default {
  name: 'quillEditor',
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
    this.quill = new Quill('#editor', {
      theme: 'snow',
      modules: {
        // toolbar: toolbarOptions
        toolbar: {
          container: '#toolbar',
        },
      },
    })
    this.quill.on('text-change', this.handleEditorChange)
  },
  beforeDestroy() {
    this.quill.off('text-change', this.handleEditorChange)
  },
  props: ['users'],
  data() {
    return {
      showPopover: false,
      options: this.users,
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
  },
}
