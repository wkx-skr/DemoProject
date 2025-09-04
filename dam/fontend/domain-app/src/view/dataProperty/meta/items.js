import HTTP from '@/http/main'
import setUdp from './setUdp.vue'
import shareFileUdp from './shareFileUdp.vue'
import smbShareFileItem from './smbShareFileItem.vue'
import ComponentCaseName from '@constant/ComponentCaseName'
import { startsWith } from 'lodash'

export default {
  mounted() {
    if (!this.$route.query.blank) {
      this.getData()
      this.initScrollbar()
      this.initEventListener()
    } else {
      this.loading = false
      this.searchResult = []
    }
  },
  props: ['modelId', 'model', 'expand', 'hideListCheckbox', 'hideListFilter'],
  beforeDestroy() {
    this.$bus.$emit('shutSelectorDialog')
    $('.row-items').off('click', '.box')
  },
  components: { smbShareFileItem, setUdp, shareFileUdp },
  data() {
    const accessModelCompare = this.$ddmConnectable
    // let node = this.$refs.tree2.getNode(data.id);
    // categoryId = Number.parseInt(node.parent.data.id.slice(1));
    // let hasCategory = this.$userModelCategory.indexOf(categoryId) > -1;
    // if(this.$ddmConnectable && (hasCategory)){
    return {
      checkDisabledObj: {
        typeId: [80010118, 80010119, 82800024],
      },
      optionKeys: JSON.stringify({
        value: 'valueKey',
        label: 'labelKey',
      }),
      options: JSON.stringify([
        {
          valueKey: 'TABLE',
          labelKey: this.$t('meta.DS.filter.table'),
          disabled: false,
        },
        {
          valueKey: 'VIEW',
          labelKey: this.$t('meta.DS.filter.view'),
          disabled: false,
        },
        {
          valueKey: 'COLUMN',
          labelKey: this.$t('meta.DS.filter.column'),
          disabled: false,
        },
        {
          valueKey: 'STORED_PROCEDURE',
          labelKey: this.$t('meta.DS.filter.storedProcedure'),
          disabled: false,
        },
        {
          valueKey: 'FUNCTION',
          labelKey: this.$t('meta.DS.filter.function'),
          disabled: false,
        },
        {
          valueKey: 'PACKAGE',
          labelKey: this.$t('meta.DS.filter.package'),
          disabled: false,
        },
      ]),
      listWidth: 0,
      searchResult: null,
      currentPage: 1,
      pageSize: 20,
      totalItems: 0,
      keyword: '',
      loading: true,
      tableLoading: false,
      showTag: false,
      udpDialogVisible: false,
      showShareFileUpd: false,
      dataTypeMap: {
        table: this.$t('meta.DS.filter.table'),
        view: this.$t('meta.DS.filter.view'),
        column: this.$t('meta.DS.filter.column'),
        stored_procedure: this.$t('meta.DS.filter.storedProcedure'),
        function: this.$t('meta.DS.filter.function'),
        package: this.$t('meta.DS.filter.package'),
        // shareFile: '文件',
      },
      dataTypeChosen: {
        table: true,
        view: true,
        column: false,
        stored_procedure: true,
        function: true,
        package: false, // zl
        // shareFile: true,
      },
      types: ['80000004', '80500008', /* "80000005", */ '80010118', '80010119'],
      searchTimeout: null,
      currentTag: null,
      tagNames: null,
      dataSourceMap: {},
      accessEditDataSource: this.$auth.ROLE_DS_ADMIN,
      accessModelCompare: accessModelCompare,
      accessHistory: this.$auth.ROLE_DS_ADMIN,
      checkboxDisabled: false,
      sortByName: null,
      sortByCreateTime: null,
      selection: [],
      mutipleLength: 0,
      option: {
        selectable: this.$auth.EXPORT_METADATA,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      lineageBindOptions: [
        { label: '绑定血缘', value: 'true' },
        { label: '未绑定血缘', value: 'false' },
      ],
      lineageBindValue: '',
    }
  },
  watch: {
    expand() {
      this.updateScrollbar()
    },
    keyword() {
      this.currentPage = 1
      // this.getData()
    },
  },
  beforeMount() {
    this.getSourceMap()
  },
  methods: {
    checkBoxChange(val) {
      let allCheck = [
        'TABLE',
        'VIEW',
        'COLUMN',
        'STORED_PROCEDURE',
        'FUNCTION',
        'PACKAGE',
      ]
      if (val.length == 5) {
        val.forEach(item => {
          this.dataTypeChosen[item.toLowerCase()] = true
        })
      } else {
        let finalArr = allCheck.filter(item => val.indexOf(item) < 0)
        val.forEach(item => {
          this.dataTypeChosen[item.toLowerCase()] = true
        })
        finalArr.forEach(item => {
          this.dataTypeChosen[item.toLowerCase()] = false
        })
      }
      this.handleCurrentChange(1)
    },
    dealdataManagers(data) {
      if (data && Array.isArray(data)) {
        let strArr = []
        let len

        strArr = data.map(item => {
          return item.firstName
        })
        len = strArr.length
        if (len > 2) {
          return `${strArr[0]},${strArr[1]}等${len}人`
        } else {
          return strArr.join(',')
        }
      } else {
        return ''
      }
    },
    closeSetUp() {
      this.udpDialogVisible = false
    },
    showFilterTag() {
      this.showTag = !this.showTag
    },
    openModelCompareJob() {
      if (!this.$ddmConnectable) {
        this.$message.warning(this.$t('meta.DS.message.notEnabledDDM'))
        return
      }
      this.$emit('showModelCompareJob', this.model)
    },
    openModelCompare() {
      this.$emit('showModelCompare', this.model)
    },
    setUdp() {
      this.udpDialogVisible = true
    },
    showExpProp() {
      this.showShareFileUpd = true
    },
    exportItems() {
      let strArr = this.selection.map(item => {
        return item.objectId
      })
      let str = strArr.join(',')
      const url = this.$url + `/service/models/metadata/export?objectIds=${str}`
      this.$downloadFilePost(url, {}, this.$t('common.page.metaData'))
    },
    handleSelectionChange(val) {
      this.selection = val
      this.mutipleLength = val.length
    },
    handleClose(v, i) {
      this.currentTag.splice(i, 1)
      this.tagNames.splice(i, 1)
      this.getData()
    },
    handleSortChange(sortData) {
      if (sortData.prop === 'name') {
        this.sortByCreateTime = null
        if (sortData.order === 'ascending') {
          this.sortByName = true
        } else if (sortData.order === 'descending') {
          this.sortByName = false
        } else {
          this.sortByName = sortData.order
        }
      } else {
        if (sortData.order === 'ascending') {
          this.sortByName = null
          this.sortByCreateTime = true
        } else if (sortData.order === 'descending') {
          this.sortByCreateTime = false
        } else {
          this.sortByCreateTime = sortData.order
        }
      }
      this.getData()
    },

    callTagSelector() {
      this.$bus.$once('tagSelected', ({ keys, names }) => {
        if (keys && names) {
          this.currentTag = keys
          this.tagNames = names
          this.currentPage = 1
          this.getData()
        }
      })
      this.$bus.$emit('callSelectorDialog', {
        type: 'tag',
        tagIds: this.currentTag,
      })
    },
    cancelTagSelect() {
      this.$bus.$emit('shutSelectorDialog')
      this.currentTag = null
      this.tagNames = null
      this.currentPage = 1
      this.getData()
    },
    getSourceMap() {
      HTTP.getAllDataSource()
        .then(res => {
          const data = res.data
          const dataSourceMap = {}
          if (data && Array.isArray(data)) {
            data.forEach(item => {
              dataSourceMap[item.modelId] = item
            })
          }
          this.dataSourceMap = dataSourceMap

          this.dataSourceLoad = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    initEventListener() {
      $('.row-items').on('click', '.box-inner', function () {
        $('.box-inner').removeClass('selected')
        $(this).addClass('selected')
      })
    },
    initScrollbar() {
      setTimeout(() => {
        Ps.initialize($('.row-items')[0])
      })
    },
    updateScrollbar() {
      setTimeout(() => {
        Ps.update($('.row-items')[0])
      }, 100)
    },
    handleItemClick(basicInfo) {
      this.$emit('itemClick', basicInfo)
    },
    lineageBindChange() {
      this.handleCurrentChange(1)
    },
    getData() {
      this.checkboxDisabled = true
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        if (this.showSmbModel) {
          if (this.modelId) {
            this.getSmbData()
          }
          return
        }
        const requestBody = {
          currentPage: this.currentPage,
          keyword: _.trim(this.keyword),
          pageSize: this.pageSize,
          modelId: this.modelId,
          typeIds: this.types,
          tagIds: this.currentTag,
          schema: this.model ? this.model.schema : null,
          sortByName: this.sortByName,
          sortByCreateTime: this.sortByCreateTime,
        }
        if (this.lineageBindValue !== '') {
          requestBody.lineageBindStatus = this.lineageBindValue
        }
        this.loading = true
        this.tableLoading = true
        this.$http
          .post(this.$url + '/service/entities/searchMetadata', requestBody)
          .then(res => {
            this.tableLoading = false
            this.checkboxDisabled = false
            this.totalItems = res.data.totalItems
            this.searchResult = res.data.content
            this.updateScrollbar()
          })
          .catch(e => {
            this.tableLoading = false
            this.checkboxDisabled = false
            this.$showFailure(e)
          })
          .then(res => {
            this.tableLoading = false
            this.loading = false
          })
      }, 0)
    },
    getSmbData() {
      let modelId = this.modelId
      if (this.modelId === 'ALLFILE') {
        modelId = ''
      }
      const url = `${this.$url}/service/shareFile/folder?currentPage=${
        this.currentPage
      }&pageSize=${this.pageSize}&fileName=${_.trim(
        this.keyword
      )}&modelId=${modelId}`
      this.$http
        .get(url)
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
    },
    handleSizeChange(val) {
      this.currentPage = 1
      this.pageSize = val
      this.getData()
    },
    handleCurrentChange(val) {
      console.log(val)
      this.currentPage = val
      this.getData()
    },
    handleDataTypeChange(key) {
      this.setTypesString()
      this.handleCurrentChange(1)
    },
    setTypesString() {
      let types = []
      if (this.dataTypeChosen.table) {
        types.push('80000004')
      }
      if (this.dataTypeChosen.view) {
        types.push('80500008')
      }
      if (this.dataTypeChosen.column) {
        types.push('80000005')
      }
      if (this.dataTypeChosen.stored_procedure) {
        types.push('80010118')
      }
      if (this.dataTypeChosen.function) {
        types.push('80010119')
      }
      if (this.dataTypeChosen.package) {
        types.push('82800024')
      }
      // if(this.dataTypeChosen.shareFile){
      //   types.push('SHARE_FILE');
      // }
      this.types = types
    },
    logicalNameFormatter(item) {
      if (item.physicalName !== item.name && item.name) {
        return item.name
      } else if (item.logicalName) {
        return item.logicalName
      } else {
        return ''
      }
    },
    openCompare() {
      this.$bus.$emit('openCompare', this.model)
    },
    openHistory() {
      this.$bus.$emit('openHistory', this.model)
    },
    jumpToDataSource() {
      this.$router.push({
        name: 'dataSource',
        query: {
          id: this.model.id,
        },
      })
    },
  },
  computed: {
    /* typesTitle() {
      const types = this.types
      const array = []
      if (this.dataTypeChosen.table) {
        array.push(this.$version.dataCatalog.table)
      }
      if (this.dataTypeChosen.view) {
        array.push(this.$version.dataCatalog.view)
      }
      if (this.dataTypeChosen.column) {
        array.push(this.$version.dataCatalog.column)
      }
      if (this.dataTypeChosen.stored_procedure) {
        array.push(this.$version.dataCatalog.storedProcedure)
      }
      if (this.dataTypeChosen.function) {
        array.push(this.$version.dataCatalog.function)
      }
      if (this.dataTypeChosen.package) {
        array.push(this.$version.dataCatalog.package)
      }
      // if(this.dataTypeChosen.shareFile){
      //   array.push('文件');
      // }
      if (array.join('、').length > 10) {
        return array.join('、').slice(0, 10) + '...'
      }
      return array.join('、')
    }, */
    showSmbModel() {
      let bool = false
      if (
        this.dataSourceMap &&
        this.dataSourceMap[this.modelId] &&
        this.dataSourceMap[this.modelId].type === 'SMBSHAREFILE'
      ) {
        bool = true
      }
      if (this.modelId === 'ALLFILE') {
        bool = true
      }
      return bool
    },
    showShareFile() {
      let bool = false
      if (
        typeof model === 'object' &&
        this.model.id &&
        this.refs.items.data.smbDataSourcMap[this.model.id]
      ) {
        bool = true
      }
      return bool
    },
  },
}
