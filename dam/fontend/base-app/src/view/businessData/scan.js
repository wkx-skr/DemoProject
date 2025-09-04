import objectDetail from './objectDetail.vue'
import usageData from './usageData.vue'
import damUsageData from './damUsageData.vue'
export default {
  components: { objectDetail, usageData, damUsageData },
  props: ['detail'],
  data() {
    return {
      hasAccess: true,
      container: $('.content-area')[0],
      objects: null,
      currentObject: null,
      showObjectDialog: false,
      showTable: true,
      currentUseageObjId: '',
      showDamUsageDialog: false,
    }
  },
  mounted() {
    // setTimeout(()=>{
    //   Ps.initialize(this.container,{
    //     suppressScrollX:true
    //   });
    //   this.container.scrollTop = 0;
    // });
    this.getData()
  },
  beforeDestroy() {
    // Ps.destroy(this.container);
  },
  methods: {
    modifyObject(row) {
      if (row.objId) {
        this.currentObject = row
        this.showObjectDialog = true
      } else {
        this.currentObject = null
        this.showObjectDialog = true
      }
    },
    close() {
      this.showObjectDialog = false
    },
    saveAndClose() {
      this.showObjectDialog = false
      this.getData()
    },
    deleteObject(row) {
      this.$DatablauCofirm('确定删除业务实体' + row.busiName + '吗？', '删除', {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      })
        .then(() => {
          this.$http
            .delete(
              this.$url + '/service/busiObjects/objects?objectIds=' + row.objId
            )
            .then(res => {
              this.getData()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {})
    },
    getData() {
      this.showTable = false
      this.$http
        .get(this.$url + `/service/busiObjects/flows/${this.detail.id}/objects`)
        .then(res => {
          this.$utils.sort.sort(res.data, 'busiCode')
          this.objects = res.data
          this.showTable = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    changeToEditMode() {
      this.$bus.$emit('changeMode', 'edit')
    },
    jumpToCode(codeId) {
      this.$bus.$emit('jumpToCode', codeId)
    },
    n2br(str) {
      if (typeof str === 'string') {
        return str.replace(/\n/g, '<br>')
      } else {
        return ''
      }
    },

    showUsageTableAndView(row) {
      this.currentObject = row
      this.showDamUsageDialog = true
    },
    handleDamUsageClose() {
      this.showDamUsageDialog = false
    },
  },
  computed: {
    damUsageDialogTitle() {
      return '"' + this.currentObject.busiName + '"的数据对象'
    },
  },
}
