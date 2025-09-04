import quillEditor from './quillEditor.vue'
import UserInformationService from '@service/UserInformationService'
export default {
  props: ['userName', 'pId', 'users', 'showRate', 'parentRate'],
  components: { quillEditor },
  mounted() {
    if (this.userName) {
      // this.$refs.input.focus();
      this.getFullName()
    }
    this.userSelector.options = []
    for (const i in this.users) {
      // if(this.userSelector.options.length < 5){
      this.userSelector.options.push(this.users[i])
      // }
    }
  },
  data() {
    return {
      text: '',
      userSelector: {
        show: false,
        fakeText: '',
        options: this.users,
      },
      btnStyle: {
        left: 0,
        top: 0,
        position: 'absolute',
        opacity: 0.5,
        visibility: 'hidden',
      },
      showPopover: false,
      objectRate: null,
      fullName: '',
    }
  },
  methods: {
    getFullName() {
      UserInformationService.getUsernames([this.userName]).then(map => {
        if (map.has(this.userName)) {
          this.fullName = map.get(this.userName)
        } else {
          this.fullName = this.userName
        }
      })
    },
    handleClose() {
      this.$emit('close')
    },
    submit() {
      const dom = $('.ql-editor[contenteditable]')
      let html = dom.html()
      if (html.endsWith('<p><br></p><p><br></p><p><br></p>')) {
        html = html.slice(0, -33)
      } else if (html.endsWith('<p><br></p><p><br></p>')) {
        html = html.slice(0, -22)
      }
      if (!$(html).text().trim()) {
        this.$message.warning('您还没有输入任何内容,评论发表失败')
        return
      }
      this.$emit('submit', {
        text: html,
        to: this.pId,
        receiver: this.userName,
      })
      this.$emit('close')
      this.text = ''
      dom.html('')
    },
    handleTextChange(keyboardEvent) {
      return
      this.showPopover = false
      if (keyboardEvent.keyCode === 50) {
        setTimeout(() => {
          this.fakeText = this.text
          const length = keyboardEvent.srcElement.selectionEnd
          const str = this.text.slice(0, length + 2)
          const arr = str.split('\n')
          this.userSelector.fakeText = arr[arr.length - 1]
          this.btnStyle.top = arr.length * 24 + 45 + 'px'
          const spanWidth = this.$refs.fakeText.offsetWidth
          this.btnStyle.left = spanWidth - 30 + 'px'
          console.log(this.btnStyle)
          this.showPopover = true
        })
      }
    },
    initRemovePopoverListener() {
      $('.context-option').one('click', () => {
        // $('.el-popover').hide()
        // this.showPopover = false;
      })
    },
    handleOptionClick(option) {
      // console.log(option);
    },
    handleSetMyRate(value) {
      this.$emit('handleSetMyRate', value)
    },
  },
  watch: {
    parentRate: {
      handler: function (newVal) {
        this.objectRate = newVal
      },
      immediate: true,
    },
  },
}
