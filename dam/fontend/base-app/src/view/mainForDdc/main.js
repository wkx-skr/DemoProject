import pageHeading from './heading.vue'
import myItem from '../myItem/main.vue'
import myNews from '../myNews/main.vue'
import ddcNav from './ddcNav.vue'
import variousSelector from '../../components/common/main/variousSelector/main.vue'
export default {
  components: { pageHeading, myItem, myNews, ddcNav, variousSelector },
  data() {
    return {
      keyHover: null,
      style: {
        heading: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '51px',
          'line-height': '51px',
          backgroundColor: '#FFF',
          borderBottom: '2px solid #D20A10',
        },
        nav: {
          position: 'absolute',
          top: '51px',
          width: '180px',
          bottom: 0,
          left: 0,
          zIndex: 1,
          // background:'blue'
        },
        content: {
          position: 'absolute',
          top: '51px',
          background: '#FFF',
          bottom: 0,
          left: '180px',
          right: 0,
          zIndex: 2,
        },
        detail: {
          backgroundColor: '#FFF',
          zIndex: 3,
        },
      },
      showDetail: false,
      showNews: false,
      currentTable: null,
      showFrontPage: false,
      frontPageHtml: '',
      suggestions: null,
      fromLocal: null,
      suggestionKey: 0,
      showContext: false,
      contextOptions: [],
    }
  },
  mounted() {
    // this.$bus.$on('showDetail',this.handleShowDetail);
    this.$bus.$on('showNewsDetail', this.handleShowNewsDetail)
    /* this.$bus.$on('showFrontPage',html=>{
      this.frontPageHtml = html;
      this.showFrontPage = true;
    }); */

    this.$bus.$on('handleDataList', setting => this.handleDataList(setting))
    this.createContextMenu()
  },
  beforeDestroy() {
    // this.$bus.$off('showDetail');
    this.$bus.$off('showNewsDetail')
    this.$bus.$off('handleDataList')
    // this.$bus.$off('showFrontPage');
    this.$bus.$off('callContextMenu')
    $(window).off('mouseup', this.handleMouseUp)
    // $(window).off('keydown')
  },
  methods: {
    handleMouseUp(e) {
      self.showContext = false
      const target = $(e.target)
      if (target && target[0] && target[0].tagName !== 'INPUT') {
        $('#sug-list').hide()
        $(window).off('keydown')
      }
    },
    createContextMenu() {
      const dom = $('#context-menu')
      const self = this
      $(window).on('mouseup', this.handleMouseUp)
      this.$bus.$on('callContextMenu', ({ x, y, options, isLeft }) => {
        if (isLeft) {
          dom.css({
            top: y + 1 + 'px',
            left: x - 120 + 'px',
          })
        } else {
          dom.css({
            top: y + 1 + 'px',
            left: x + 1 + 'px',
          })
        }
        this.contextOptions = options
        this.showContext = true
      })
    },
    handleKeyDown(e) {
      // keyCode===38 up
      // keyCode===40 down
      if (this.suggestions && this.suggestions.length > 0) {
        const length = this.suggestions.length

        if (
          !this.keyHover &&
          this.keyHover !== 0 &&
          (e.keyCode === 38 || e.keyCode === 40)
        ) {
          this.keyHover = 0
        } else if (e.keyCode === 38) {
          if (this.keyHover === 0) {
            this.keyHover = length - 1
          } else {
            this.keyHover--
          }
        } else if (e.keyCode === 40) {
          if (this.keyHover === length - 1) {
            this.keyHover = 0
          } else {
            this.keyHover++
          }
        } else {
        }
        if (e.keyCode === 38 || e.keyCode === 40) {
          this.resetKeyword(this.suggestions[this.keyHover])
        }
      }
    },
    handleDataList(setting) {
      const el = this.$refs.dataList
      switch (setting.type) {
        case 'focus': {
          el.style.left = setting.left + 'px'
          el.style.top = setting.top + setting.height + 'px'
          el.style.width = setting.width + 'px'
          el.style.display = 'block'
          this.keyHover = null
          const addKeyboardListener = () => {
            $(window).off('keydown', this.handleKeyDown)
            $(window).on('keydown', this.handleKeyDown)
          }
          addKeyboardListener()
          break
        }
        case 'blur':
          setTimeout(() => {
            if (el) {
              // el.style.display = 'none';
            }

            // this.suggestions =[];
          }, 100)
          break
        case 'change':
          // el.style.display = 'block';
          this.suggestions = Array.from(setting.options)
          this.fromLocal = setting.local
          break
        case 'clear':
          this.suggestions = []
          break
      }
    },

    handleShowNewsDetail() {
      this.showNews = true
    },
    handleNewsClose() {
      this.showNews = false
    },
    handleTableClose() {
      this.showDetail = false
    },
    handleLogoClick() {
      this.$router.push({ name: 'home' })
      this.showDetail = false
      this.showNews = false
    },
    handleSuggestionClick(value) {
      this.search(value)
    },
    resetKeyword(value) {
      this.$bus.$emit('resetKeyword', value)
    },
    search(value) {
      this.$router.push({ name: 'search', query: { keyword: value } })
      this.$bus.$emit('resetKeyword', value)
    },
    clearHistories() {
      localStorage.removeItem('recentSearch')
    },
  },
}
