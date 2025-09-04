/**
 * Created by baobao on 2017/6/30.
 */
'use strict'
export default {
  mounted() {
    var self = this
    self.innerLoadSubjects(false)
    setTimeout(() => {
      self.initListStyle()
      Ps.initialize($('.subject-list')[0], {
        suppressScrollX: true,
      })
    }, 100)
    $(window).resize(this.initListStyle)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.initListStyle)
    //	Ps.destroy($('.subject-list')[0]);
  },
  computed: {},
  methods: {
    initListStyle() {
      var div = $('#data-subject')[0]
      this.totalWidth = div.offsetWidth
      var amount = parseInt(this.totalWidth / 320)
      if (this.totalWidth % 320 > 200) amount++
      this.itemWidth = (this.totalWidth - 60) / amount
      $('.subject-list')
        .find('.el-card')
        .css('width', this.itemWidth - 20)
      Ps.update($('.subject-list')[0])
      this.showList = true
    },
    onRefreshClick() {
      var self = this
      self.innerLoadSubjects(true)
    },
    onCardClick(subject) {
      var self = this
      self.$router.push({
        name: 'dataSubjectDetail',
        query: { subjectId: subject.subjectId, subjectName: subject.name },
      })
    },
  },
  data() {
    this.BASE_URL = this.$url + '/service/'
    return {
      totalWidth: 0,
      itemWidth: undefined,
      showList: false,

      subjectAreas: [],
      loadingSubject: false,

      innerLoadSubjects: function (refresh) {
        var self = this
        if (refresh) {
          self.subjectAreas = []
        }

        // get data from server
        if (self.subjectAreas.length == 0) {
          self.loadingSubject = true
          self.$http
            .get(self.BASE_URL + 'subjects/' + (refresh ? 'refresh' : ''))
            .then(res => {
              self.subjectAreas = res.data
              setTimeout(() => {
                self.initListStyle()
                Ps.update($('.subject-list')[0])
              }, 100)
              self.loadingSubject = false
            })
            .catch(e => {
              console.error(e)
              self.loadingSubject = false
              self.showFailure(
                this.$version.dataStandard.failLoadStd + e.message
              )
            })
        }
      },
    }
  },
}
