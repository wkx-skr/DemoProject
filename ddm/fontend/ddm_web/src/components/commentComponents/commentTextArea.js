import quillEditor from './quillEditor.vue'
import $ from 'jquery'
export default {
  props: ['userName', 'pId', 'users', 'showRate', 'parentRate'],
  components: { quillEditor },
  mounted () {
    if (this.userName) {
      // this.$refs.input.focus();
    }
    this.userSelector.options = []
    for (let i in this.users) {
      // if(this.userSelector.options.length < 5){
      this.userSelector.options.push(this.users[i])
      // }
    }
  },
  data () {
    return {
      text: '',
      userSelector: {
        show: false,
        fakeText: '',
        options: this.users
      },
      btnStyle: {
        left: 0,
        top: 0,
        position: 'absolute',
        opacity: 0.5,
        visibility: 'hidden'
      },
      showPopover: false,
      objectRate: null
    }
  },
  methods: {
    handleClose () {
      this.$emit('close')
    },
    submit () {
      let dom = $('.ql-editor[contenteditable]')
      let html = dom.html()
      if (html.endsWith('<p><br></p><p><br></p><p><br></p>')) {
        html = html.slice(0, -33)
      } else if (html.endsWith('<p><br></p><p><br></p>')) {
        html = html.slice(0, -22)
      }
      if (!($(html).text().trim())) {
        this.$message.warning(this.$store.state.$v.modelDetail.warn1)
        return
      }
      this.$emit('submit', {
        text: html,
        to: this.pId,
        receiver: this.userName
      })
      this.$emit('close')
      this.text = ''
      dom.html('')
    },
    handleTextChange (keyboardEvent) {
      // this.showPopover = false
      // if (keyboardEvent.keyCode === 50) {
      //   setTimeout(() => {
      //     this.fakeText = this.text
      //     let length = keyboardEvent.srcElement.selectionEnd
      //     let str = this.text.slice(0, length + 2)
      //     let arr = str.split('\n')
      //     this.userSelector.fakeText = arr[arr.length - 1]
      //     this.btnStyle.top = (arr.length * 24 + 45) + 'px'
      //     let spanWidth = (this.$refs.fakeText.offsetWidth)
      //     this.btnStyle.left = spanWidth - 30 + 'px'
      //     console.log(this.btnStyle)
      //     this.showPopover = true
      //   })
      // }
    },
    initRemovePopoverListener () {
      $('.context-option').one('click', () => {
        // $('.el-popover').hide()
        // this.showPopover = false;
      })
    },
    handleOptionClick (option) {
      // console.log(option);
    },
    handleSetMyRate (value) {
      this.$emit('handleSetMyRate', value)
    }
  },
  watch: {
    parentRate: {
      handler: function (newVal) {
        this.objectRate = newVal
      },
      immediate: true
    }
  }
}
