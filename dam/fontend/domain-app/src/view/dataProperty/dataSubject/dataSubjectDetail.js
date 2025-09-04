/**
 * Created by baobao on 2017/6/30.
 */
'use strict'
export default {
  mounted() {
    var self = this
    self.subjectId = this.$route.query.subjectId
    self.subjectName = this.$route.query.subjectName
    self.innerLoadSubject(self.subjectId)
    self.innerLoadSubjectDiagram(self.subjectId)
  },
  computed: {
    isList() {
      var self = this
      return self.listMode == 'list'
    },
  },
  methods: {
    onCardClick(member) {
      this.$router.push({ name: 'dataCatalog', query: { table: member.id } })
    },
    pictureUrl(id) {
      return this.$url + '/service/subjects/' + id + '/image'
    },
    pictureItemUrl(member) {
      return '../../assets/images/icon/table.png'
      if (member.typeId == 80000004) {
        return '../../assets/images/icon/table.png'
      } else {
        return '../../assets/images/icon/diagram.png'
      }
    },
  },
  data() {
    this.BASE_URL = this.$url + '/service/'
    return {
      listMode: 'list',
      members: [],
      loadingSubject: false,
      hasImage: true,
      subjectId: 0,
      subjectName: '',
      innerLoadSubject: function (subjectId) {
        var self = this

        // get data from server
        if (self.members.length == 0) {
          //        self.loadingSubject = true;
          self.$http
            .get(self.BASE_URL + 'subjects/' + subjectId + '/members')
            .then(res => {
              self.members = res.data
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

      innerLoadSubjectDiagram: function (subjectId) {
        var self = this

        // get data from server
        if (self.members.length == 0) {
          //        self.loadingSubject = true;
          var url = self.pictureUrl(subjectId)
          self.$http
            .get(url)
            .then(res => {
              // var buffer64 = Buffer.from(res.data,'binary');
              // $("#subject-image").attr("src", 'data:image/png;base64,' + buffer64.toString('base64'));
              $('#subject-image').attr('src', url)
              self.hasImage = true
              self.loadingSubject = false
            })
            .catch(e => {
              self.loadingSubject = false
              self.hasImage = false
            })
        }
      },
    }
  },
}
