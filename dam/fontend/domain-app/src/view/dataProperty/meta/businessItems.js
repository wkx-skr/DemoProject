import searchItem from './businessSearchItem.vue'
export default {
  mounted() {
    this.getAccess()
    this.getData()
    this.initScrollbar()
    this.initEventListener()
  },
  props: ['modelId', 'expand', 'writable', 'dataSecurity', 'isSecurity'],
  beforeDestroy() {
    $('.row-items').off('click', '.box')
  },
  components: { searchItem },
  data() {
    return {
      assetsLevelName: '',
      levelOption: [],
      accessLevelId: -1,
      searchResult: null,
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
      keyword: '',
      modelName: '',
      loading: false,

      dataTypeMap: {
        table: '表',
        view: '视图',
        column: '字段',
        storedProcedure: '存储过程',
        function: '函数',
      },
      dataTypeChosen: {
        table: true,
        view: true,
        column: false,
        storedProcedure: true,
        function: true,
      },
      //      types:["TABLE", "VIEW", /*"COLUMN",*/ "STORED_PROCEDURE",'FUNCTION'],
      searchTimeout: null,
    }
  },
  watch: {
    expand() {
      this.updateScrollbar()
    },
    keyword() {
      this.currentPage = 1
      this.getData()
    },
    modelName() {
      this.currentPage = 1
      this.getData()
    },
    accessLevelId(val) {
      if (parseFloat(val) === -1) {
        this.assetsLevelName = ''
      } else {
        this.assetsLevelName = val
      }
      this.getData()
    },
  },
  methods: {
    skipBussCatelog() {
      const pos = location.href.indexOf('#/')
      const baseUrl = location.href.slice(0, pos + 2)
      window.open(baseUrl + 'main/business')
    },
    getAccess() {
      this.$http
        .get(this.$url + '/service/auth/assets')
        .then(res => {
          this.levelOption = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    initEventListener() {
      const self = this
      $('.row-items').on('click', '.box-inner', function () {
        $('.box-inner').removeClass('selected')
        $(this).addClass('selected')
      })
    },
    initScrollbar() {
      Ps.initialize($('.row-items')[0])
    },
    updateScrollbar() {
      setTimeout(() => {
        Ps.update($('.row-items')[0])
      }, 100)
    },
    handleItemClick(basicInfo) {
      this.$emit('itemClick', basicInfo)
    },
    getData() {
      clearTimeout(this.searchTimeout)

      this.searchTimeout = setTimeout(() => {
        if (this.modelId || this.modelId === 0) {
          this.loading = true
          if (!this.dataSecurity) {
            this.$http
              .get(
                this.$url +
                  `/service/catalogs/${this.modelId}?currentPage=${this.currentPage}&pageSize=${this.pageSize}&keyword=${this.keyword}`
              )
              .then(res => {
                res.data.content.forEach(item => {
                  if (item.type === 'DOMAIN' || item.type === 'DOMAIN_CODE') {
                    item.objectId = item.domainId
                  } else if (item.type === 'SHARE_FILE') {
                    item.objectId = item.id
                  }
                })
                this.searchResult = res.data.content

                this.totalItems = res.data.totalItems
                this.updateScrollbar()
              })
              .catch(e => {
                this.$showFailure(e)
              })
              .then(res => {
                this.loading = false
              })
          } else {
            this.$http
              .post(this.$url + '/service/catalogs/page', {
                name: this.keyword,
                typeIds: [80000004, 80010066, 82800003, 82800002, 80500008],
                catalogId: this.modelId,
                currentPage: this.currentPage,
                pageSize: this.pageSize,
                assetsLevelName: this.assetsLevelName,
                modelName: this.modelName,
              })
              .then(res => {
                this.searchResult = res.data.content
                this.totalItems = res.data.totalItems
                this.updateScrollbar()
              })
              .catch(e => {
                this.$showFailure(e)
              })
              .then(res => {
                this.loading = false
              })
          }
        }
      }, 400)
    },
    handleSizeChange(val) {
      this.currentPage = 1
      this.pageSize = val
      this.getData()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.getData()
    },
    handleDataTypeChange(key) {
      //      this.dataTypeChosen[key] = !this.dataTypeChosen[key];
      this.setTypesString()
      this.handleCurrentChange()
    },
    setTypesString() {
      const types = []
      if (this.dataTypeChosen.table) {
        types.push('TABLE')
      }
      if (this.dataTypeChosen.view) {
        types.push('VIEW')
      }
      if (this.dataTypeChosen.column) {
        types.push('COLUMN')
      }
      if (this.dataTypeChosen.storedProcedure) {
        types.push('STORED_PROCEDURE')
      }
      if (this.dataTypeChosen.function) {
        types.push('FUNCTION')
      }
      this.types = types
    },
    unbindTable(object) {
      this.$DatablauCofirm('确定要从业务目录中移除该项吗？', '', {
        type: 'warning',
      })
        .then(() => {
          this.deleteColumnFromCatalog(object)
        })
        .catch(() => {})
    },
    deleteColumnFromCatalog(item) {
      if (!item) {
        return
      }
      const self = this
      const catalogId = item.catalogId
      const objectId = item.objectId
      const base = this.$url + '/service/catalogs'
      let url = base + '/unbind/' + catalogId + '/objects/' + objectId
      if (item.type === 'DOMAIN' || item.type === 'DOMAIN_CODE') {
        url += '?typeId=80010066'
      }
      if (item.type === 'SHARE_FILE') {
        url += '?typeId=82800008'
      }
      if (item.type === 'REPORT') {
        url =
          base +
          '/unbind/' +
          catalogId +
          '/objects/' +
          item.id +
          '?typeId=82800002'
      }
      ;(catalogId || catalogId === 0) &&
        self.$http
          .delete(url)
          .then(data => {
            self.$bus.$emit('updateBusinessList')
            self.$message.success('移除成功')
          })
          .catch(e => {
            this.$showFailure(e)
          })
    },
  },
  computed: {
    typesTitle() {
      const types = this.types
      const array = []
      if (this.dataTypeChosen.table) {
        array.push('表')
      }
      if (this.dataTypeChosen.view) {
        array.push('视图')
      }
      if (this.dataTypeChosen.column) {
        array.push('字段')
      }
      if (this.dataTypeChosen.storedProcedure) {
        array.push('存储过程')
      }
      if (this.dataTypeChosen.function) {
        array.push('函数')
      }
      if (array.join('、').length > 10) {
        return array.join('、').slice(0, 10) + '...'
      }
      return array.join('、')
    },
  },
}
