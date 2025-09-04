import vue from 'vue'
export default vue.extend({
  template: `
    <div>
      <el-button type="text" size="mini" @click="jumpToDdc">查看</el-button>
      <el-button type="text" size="mini" @click="deleteFavor">取消收藏</el-button> 
  </div>`,
  mounted() {},
  methods: {
    jumpToDdc() {
      const row = this.params.data
      const objectId = row.objId
      if (row.typeId === Number.parseInt(this.$commentPreCode.Entity)) {
        const type = 'TABLE'
        window.open(
          `${location.origin}${location.pathname}#/myItem?objectId=${objectId}&type=${type}`
        )
      } else if (row.typeId === Number.parseInt(this.$commentPreCode.View)) {
        const type = 'VIEW'
        window.open(
          `${location.origin}${location.pathname}#/myItem?objectId=${objectId}&type=${type}`
        )
      } else if (row.typeId === Number.parseInt(this.$commentPreCode.Domain)) {
        window.open(
          `${location.origin}${location.pathname}#/domain?domainId=${objectId}`
        )
      } else if (row.typeId === Number.parseInt(this.$commentPreCode.Report)) {
        window.open(
          `${location.origin}${location.pathname}#/reportForm?reportId=${objectId}`
        )
      } else if (
        row.typeId === Number.parseInt(this.$commentPreCode.ShareFile)
      ) {
        window.open(
          `${location.origin}${location.pathname}#/myShareFile?id=${objectId}&catalogPath=0&keyword=`
        )
      } else {
        window.open(
          `${location.origin}${location.pathname}#/indexForDdc?code=${objectId}`
        )
      }
    },
    deleteFavor() {
      const row = this.params.data
      this.$confirm('确定要取消该收藏吗？', '', {
        type: 'warning',
      })
        .then(() => {
          const id = row.id
          this.$http.delete(this.$url + '/service/favor/' + id).then(res => {
            this.$parent.$parent.$parent.getData()
          })
        })
        .catch(() => {})
    },
  },
})
