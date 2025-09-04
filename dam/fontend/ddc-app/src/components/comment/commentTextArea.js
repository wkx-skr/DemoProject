import UserInformationService from '@service/UserInformationService'
export default {
  props: ['userName', 'pId', 'users', 'showRate', 'parentRate', 'editorId'],
  data() {
    return {
      text: '',
      objectRate: null,
    }
  },
  methods: {
    cancelApply() {
      this.$emit('moveTextArea', 0)
    },
    submit() {
      const dom = $(
        this.editorId
          ? '#' + this.editorId + ' .ql-editor[contenteditable]'
          : '.ql-editor[contenteditable]'
      )
      let html = dom.html()
      if (html.endsWith('<p><br></p><p><br></p><p><br></p>')) {
        html = html.slice(0, -33)
      } else if (html.endsWith('<p><br></p><p><br></p>')) {
        html = html.slice(0, -22)
      } else if (html.endsWith('<p><br></p>')) {
        html = html.slice(0, -11)
      }
      if (html.startsWith('<p><br></p>')) {
        html = html.slice(11)
      }
      console.log('submit', {
        star: this.objectRate,
        text: html,
        to: this.pId,
        receiver: this.userName,
      })
      this.$emit('submitText', {
        star: this.objectRate,
        text: html,
        to: this.pId,
        receiver: this.userName,
      })
      this.$emit('moveTextArea', 0)
      this.text = ''
      this.objectRate = 0
      dom.html('')
    },
    handleSetMyRate(value) {
      this.$emit('handleSetMyRate', value)
    },
  },
}
