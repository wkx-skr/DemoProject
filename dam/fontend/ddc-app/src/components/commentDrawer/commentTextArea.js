export default {
  props: [
    'userName',
    'pId',
    'users',
    'showRate',
    'showTitle',
    'parentRate',
    'editorId',
    'replyToName',
  ],
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
      const html = this.text.trim()
      if (this.objectRate || html) {
        this.$emit('submitText', {
          star: this.objectRate,
          text: html,
          to: this.pId,
          receiver: this.userName,
        })
        this.$emit('moveTextArea', 0)
        this.text = ''
        this.objectRate = 0
        // dom && dom.html('')
      } else {
        this.$blauShowFailure(
          this.pId ? '请输入回复内容' : '请评分或输入评论内容'
        )
      }
    },
    handleSetMyRate(value) {
      this.$emit('handleSetMyRate', value)
    },
  },
}
