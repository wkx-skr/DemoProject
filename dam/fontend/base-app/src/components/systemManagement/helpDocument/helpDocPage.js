export default {
  data() {
    return {
      domArr: [],
      currentTitle: '',
      contents2dom: [],
    }
  },

  props: ['content', 'page', 'dealedContents', 'contentMap'],

  watch: {
    page() {
      this.testShow()
    },
  },

  components: {},

  computed: {},

  mounted() {
    this.testShow()
    this.resizeImage()
  },

  methods: {
    resizeImage() {
      $('.help-doc img').each(function () {
        $(this).css('width', $(this).width() * 2)
        $(this).css('height', $(this).height() * 2)
      })
    },
    testShow() {
      const aPage = this.page.split('_')
      aPage[0] = aPage[0].slice(7)
      this.showId(aPage[0], aPage[1])
    },
    showId(level_1, level_2) {
      const $domArr = $('h1, h2')
      $('.info-title ~ *').hide()
      if (
        this.contentMap['pageDoc' + level_1 + '_' + level_2] ||
        this.contentMap['pageDoc' + level_1 + '_' + level_2] === 0
      ) {
        const dom =
          $domArr[this.contentMap['pageDoc' + level_1 + '_' + level_2]]
        if (dom) {
          this.currentTitle =
            _.trim($($('h1')[level_1 - 1]).text()) + '/' + _.trim($(dom).text())
          const id = 'showH2'
          $(dom).attr('id', id)
          // $('#' + id).show();
          $('#' + id + ' ~ *').show()
          $(dom).attr('id', '')
        }
        const domEnd =
          $domArr[this.contentMap['pageDoc' + level_1 + '_' + level_2] - 0 + 1]
        if (domEnd) {
          const id = 'hideH2'
          $(domEnd).attr('id', id)
          $('#' + id).hide()
          $('#' + id + ' ~ *').hide()
          $(domEnd).attr('id', '')
        }
      }
    },
    gotoPage(index) {
      this.$emit('gotoPage', index)
    },
  },
}
