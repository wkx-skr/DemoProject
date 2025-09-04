import DownloadingEnum from '@/components/dataSource/Downloading'
export default {
  components: {},
  props: ['modelId', 'schemas'],
  data() {
    return {
      DownloadingEnum: DownloadingEnum,
      displayPath: [this.$t('meta.DS.treeSubOperation.exportAll')],
      tableData: null,
      tableDataIgnoreTag: null,
      selectList: [],
      keyword: '',
      keywordTimeout: null,
      tableHeight: undefined,
      // 分页 设置
      currentPage: 1,
      pageSize: 500,
      total: 0,
      showTable: true,
      gridOptions: {},
      tableLoading: false,
      currentTag: null,
      tagNames: null,
      metaIdsOfTag: [],
      isSimple: true,
      schemaList: [],
      schemaOptions: [],
      tableAllData: [],
      tableAllData2: [],
      currentableData: [],
      manyEachPage: 20,
      oldSelectionAll: [],
      checkedIdList: [],
      downloading: this.$store.state.currentDownloading.has(
        'export-metadata' + this.modelId
      )
        ? this.$store.state.currentDownloading.get(
            'export-metadata' + this.modelId
          )
        : DownloadingEnum.Nothing, // 表示正在下载的是哪个按钮
      isLogical: false,
    }
  },
  mounted() {
    const self = this
    this.schemaOptions = this.schemas
    this.schemaList = this.schemaOptions
    // this.tableHeight = $(".download-table-row")[0].offsetHeight;
    $(window).resize(this.resizeTable)
    this.$bus.$on('downloadOntop', () => {
      self.resizeTable()
    })
    self.getTableData2()
    this.getReDetail(this.modelId)
  },
  beforeDestroy() {
    $(window).unbind('resize', this.resizeTable)
    this.$bus.$off('downloadOntop')
    this.$bus.$off('tagSelected')
    this.$bus.$emit('shutSelectorDialog')
  },
  watch: {
    keyword(newVal) {
      clearTimeout(this.keywordTimeout)
      this.keywordTimeout = setTimeout(() => {
        this.currentPage = 1
        this.getTableData2()
      }, 800)
    },
    modelId(newVal) {
      this.$emit('showModel', newVal)
      // this.getSchemaList();
    },
  },
  methods: {
    getReDetail(id) {
      this.$http
        .post(`${this.$meta_url}/models/${id}/plain`)
        .then(res => {
          if (res.data.type === 'DATADICTIONARY_LOGICAL') {
            this.isLogical = true
          } else {
            this.isLogical = false
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    callTagSelector() {
      this.$bus.$once('tagSelected', ({ keys, names }) => {
        this.currentTag = keys
        this.tagNames = names
        this.currentPage = 1
        this.getMetaByTag()
      })
      this.$bus.$emit('callSelectorDialog', { type: 'tag' })
    },
    cancelTagSelect() {
      this.$bus.$emit('shutSelectorDialog')
      this.currentTag = null
      this.tagNames = null
      this.currentPage = 1
      this.getTableData2()
    },
    getMetaByTag() {
      const tagIds = this.currentTag.join(',')
      const url = `${this.$url}/service/tags/model/${this.modelId}?tagIds=${tagIds}&pageSize=${this.pageSize}&currentPage=${this.currentPage}`
      this.$http
        .get(url)
        .then(res => {
          res.data.content.forEach(item => {
            item.name = item.logicalName
            //          item.definition = item.description;
          })
          this.tableData = res.data.content
          this.total = res.data.totalItems
          this.$nextTick(() => {
            this.resizeTable()
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleSizeChange(val) {
      this.currentPage = 1
      this.manyEachPage = val
      this.getTableData2()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.getTableData2()
    },
    downloadCallback() {
      return () => {
        this.downloading = DownloadingEnum.Nothing
        const state = this.$store.state.currentDownloading
        state.delete('export-metadata' + this.modelId)
      }
    },
    download() {
      const result = this.prepareList()
      let href =
        this.$meta_url + '/service/models/' + this.modelId + '/exportAsync'
      if (result.length !== 0) {
        href += '?tableIds=' + result.join(',')
        if (this.isSimple) {
          href += '&isSimple=true'
        }
      } else {
        if (this.isSimple) {
          href += '?isSimple=true'
        }
      }
      this.$http
        .post(href, {})
        .then(res => {
          this.$bus.$emit('getTaskJobResult', res.data, 'export')
        })
        .catch(e => {
          this.$showFailure(e)
        })
      // this.downloading = DownloadingEnum.Selected
      // const state = this.$store.state.currentDownloading
      // state.set('export-metadata' + this.modelId, this.downloading)
      // this.$downloadFilePost(
      //   href,
      //   {},
      //   this.$t('meta.DS.treeSubOperation.metadata'),
      //   this.downloadCallback(),
      //   this.downloadCallback()
      // )
    },
    downloadAll() {
      let href =
        this.$meta_url + '/service/models/' + this.modelId + '/exportAsync'
      if (this.currentTag) {
        href += '?tagIds=' + this.currentTag.join(',')
        if (this.isSimple) {
          href += '&isSimple=true'
        }
      } else {
        if (this.isSimple) {
          href += '?isSimple=true'
        }
      }
      this.$http
        .post(href, { schemaNames: this.schemaList.toString() })
        .then(res => {
          this.$bus.$emit('getTaskJobResult', res.data, 'export')
        })
        .catch(e => {
          this.$showFailure(e)
        })
      // this.downloading = DownloadingEnum.All
      // const state = this.$store.state.currentDownloading
      // state.set('export-metadata' + this.modelId, this.downloading)
      // // this.$downloadFile(href);
      // this.$downloadFilePost(
      //   href,
      //   { schemaNames: this.schemaList.toString() },
      //   this.$t('meta.DS.treeSubOperation.metadata'),
      //   this.downloadCallback(),
      //   this.downloadCallback()
      // )
    },
    prepareList() {
      const result = []
      this.selectList.forEach(item => {
        result.push(item.objectId)
      })
      return result
    },
    resizeTable() {
      this.upDateTable()
      // this.$nextTick(() => {
      //   try {
      //     this.tableHeight = $(".download-table-row")[0].offsetHeight || this.tableHeight;
      //   } catch (e) {
      //   }
      // });
    },
    upDateTable() {
      this.showTable = false
      this.$nextTick(() => {
        this.showTable = true
      })
    },
    getTableData2() {
      this.tableLoading = true
      this.$http
        .post(this.$meta_url + '/models/search/metadata/export', {
          pageSize: this.manyEachPage,
          currentPage: this.currentPage,
          keyword: this.keyword,
          modelIds: [this.modelId],
          schemas: this.schemaList,
        })
        .then(res => {
          this.currentableData = res.data.content
          // this.tableAllData2 = this.tableAllData;
          // this.handleCurrentChange(1)
          this.total = res.data.totalItems
          this.tableLoading = false
          if (this.checkedIdList.length) {
            // 实现翻页选
            const arr = this.checkedIdList
            const indexArr = []
            this.currentableData.forEach((e, i) => {
              arr.forEach(e2 => {
                if (e2 === e.id) {
                  indexArr.push(this.currentableData[i])
                }
              })
            })
            this.toggleSelection(indexArr)
          }
        })
        .catch(e => {
          this.tableLoading = false
          this.$showFailure(e)
        })
    },
    schemaChange(val) {
      this.getTableData2()
      // if (this.schemas.length) {
      //   const newArr = [];
      //   this.tableAllData.forEach(e => {
      //     this.schemas.forEach(item => {
      //       if (e.schema === item) {
      //         newArr.push(e);
      //       }
      //     });
      //   });
      //   this.tableAllData2 = newArr;
      // } else {
      //   this.tableAllData2 = this.tableAllData
      // }
      // this.handleCurrentChange(1);
      // setTimeout(() => {
      //   let arr = [];
      //   this.currentableData.forEach(item => {
      //     arr.push(item)
      //   });
      //   this.toggleSelection(arr);
      //   this.selectList = this.tableAllData2;
      // });
    },
    toggleSelection(rows) {
      if (rows) {
        setTimeout(() => {
          rows.forEach(row => {
            this.$refs.columnsTable.toggleRowSelection(row)
          })
        })
      }
    },
    goBack() {
      this.$emit('showModel', this.modelId)
    },
    select(selectList, row) {
      if (selectList.includes(row)) {
        // 勾选
        let has = false
        this.selectList.forEach(e => {
          if (e.id === row.id) {
            has = true
          }
        })
        if (!has) {
          this.selectList.push(row)
        }
      } else {
        // 去勾选
        this.selectList.forEach((e, i) => {
          if (e.id === row.id) {
            this.selectList.splice(i, 1)
          }
        })
      }
      if (this.selectList.length > 0) {
        this.checkedIdList = this.selectList.map(e => e.id)
      } else {
        this.checkedIdList = []
      }
    },
    selectAll(selectList) {
      if (selectList.length) {
        // 勾选
        this.oldSelectionAll = JSON.parse(JSON.stringify(selectList))
        selectList.forEach(e1 => {
          let has = false
          this.selectList.forEach(e => {
            if (e.id === e1.id) {
              has = true
            }
          })
          if (!has) {
            this.selectList.push(e1)
          }
        })
      } else {
        // 去勾选
        this.oldSelectionAll.forEach(e1 => {
          this.selectList.forEach((e, i) => {
            if (e.id === e1.id) {
              this.selectList.splice(i, 1)
            }
          })
        })
      }
      if (this.selectList.length > 0) {
        this.checkedIdList = this.selectList.map(e => e.id)
      } else {
        this.checkedIdList = []
      }
    },
  },
  computed: {
    tableDataLength() {
      if (this.tableData) {
        return this.tableData.length
      }
    },
    downloadDisabled() {
      return !this.selectList || this.selectList.length === 0
    },
  },
}
