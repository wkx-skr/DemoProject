export default {
  props: [
    'type',
    'detail',
    'dims',
    'monitors',
    'baseCodeObj',
    'parentCodeObj',
    'msgFromParent',
    'allProperties',
    'functions',
    'times',
    'categoryId',
    'list',
    'node',
  ],
  components: {},
  data() {
    return {
      activeCollapse: [
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        'dim',
        'time',
        'watch',
        'alg',
        'function',
        'manage',
        'doc',
      ],
      innerDetail: {},
      documents: [],
      showPropertyDialog: false,
      properties: null,
      formKey: 0,
      editMode: true,
      value: '',
      container: $('.content-area')[0],
      baseCode: true,

      allDims: {},
      allDimsArr: [], // 选择维度时使用
      restDims: {},
      dimsDisplay: {},
      selectedDims: {},
      showChooseDims: false,
      dimsKeyword: '',
      allDimsShow: [],
      showOperation: true,

      allMonitors: [],
      restMonitors: {},
      monitorsDisplay: {},
      selectedMonitors: [],

      selectedFunctions: [],

      selectedTime: {
        group: null,
        time: null,
      },
      options: this.filterCategory(this.list),
      defaultProps: {
        value: 'id',
        label: 'name',
      },
      describeValues: {},
    }
  },
  mounted() {
    if (this.msgFromParent) {
      const obj1 = _.cloneDeep(this.msgFromParent.detail)
      const obj2 = {
        chAbbr: '',
        chFull: '',
      }
      for (const key in obj1) {
        obj2[key] = obj1[key]
      }
      this.innerDetail = obj2
      // this.innerDetail = _.cloneDeep(this.msgFromParent.detail);
      delete this.innerDetail.codeId
      if (this.msgFromParent.type === 'BASE_CODE') {
        this.innerDetail.dims = []
        this.innerDetail.monitorObjects = []
      }
    }
    if (this.detail) {
      this.innerDetail = _.cloneDeep(this.detail)
      if (this.type === 'BASE_CODE') {
        const result = []
        let current = this.node
        do {
          current = current.parent
          if (current.data.id) {
            result.push(current.data.id)
          }
        } while (current.parent)
        this.innerDetail.categoryId = result.reverse()
      }
    }
    if (this.type === 'BASE_CODE') {
      this.baseCode = true
    } else if (this.type === 'CODE') {
      this.baseCode = false
      this.mapDims()
      this.mapMonitors()
    }
    if (this.detail || this.msgFromParent) {
      this.editMode = true
      this.mapProperties(this.allProperties, this.innerDetail.properties)
      this.getDocumentsDetail()
      if (!this.baseCode) {
        // Mapping dims
        this.selectedDims = {}
        const keys = Object.keys(this.dimsDisplay)
        keys.forEach(key => {
          this.selectedDims[key] = []
        })
        Array.isArray(this.innerDetail.dims) &&
          this.innerDetail.dims.forEach(dim => {
            if (dim.catalog.dimensionType === 'NORMAL') {
              this.selectedDims[dim.catalog.catalogId].push(dim.dimId)
            } else if (dim.catalog.dimensionType === 'TIME') {
              this.selectedTime = {
                group: dim.catalog.catalogId,
                time: dim,
              }
            }
          })

        this.selectedMonitors = []
        const monitorsKeys = Object.keys(this.monitorsDisplay)
        monitorsKeys.forEach(key => {})
        this.innerDetail.monitorObjects.forEach(m => {
          this.selectedMonitors.push(m.objectId)
        })
      }
    } else {
      this.mapProperties(this.allProperties)
    }
    if (!this.detail) {
      this.editMode = false
      if (this.msgFromParent) {
        this.innerDetail.enFull = this.msgFromParent.detail.enFull
        this.innerDetail.enAbbr = this.msgFromParent.detail.enAbbr
        this.innerDetail.description = this.msgFromParent.detail.description
        if (this.msgFromParent.type === 'BASE_CODE') {
          this.innerDetail.chFull = this.msgFromParent.detail.cnFull
          this.innerDetail.chAbbr = this.msgFromParent.detail.cnAbbr
        } else if (this.msgFromParent.type === 'CODE') {
          this.innerDetail.chFull = this.msgFromParent.detail.chFull
          this.innerDetail.chAbbr = this.msgFromParent.detail.chAbbr
        }
      }
    }

    setTimeout(() => {
      Ps.initialize(this.container)
      this.container.scrollTop = 0
    })
    this.properties['算法属性'].forEach(element => {
      if (element.property.candidates === null) {
        this.$set(this.describeValues, element.property.propId, element.value)
      }
    })
    this.properties['管理属性'].forEach(element => {
      if (element.property.candidates === null) {
        this.$set(this.describeValues, element.property.propId, element.value)
      }
    })
  },
  beforeDestroy() {
    Ps.destroy(this.container)
  },
  methods: {
    filterCategory(list) {
      const result = _.cloneDeep(list)
      const forEach = obj => {
        if (obj.children) {
          const children = []
          obj.children.forEach(item => {
            if (item.type === 'FOLDER') {
              forEach(item)
              children.push(item)
            }
          })
          obj.children = children
        }
      }
      result.forEach(item => {
        forEach(item)
      })
      return result
    },
    mapDims() {
      for (const i in this.dims) {
        const v = this.dims[i]
        if (v.dimensionType === 'NORMAL') {
          this.allDims[i] = v
        } else {
        }
      }
      this.restDims = _.cloneDeep(this.allDims)
      if (this.innerDetail && Array.isArray(this.innerDetail.dims)) {
        const catalogs = []
        this.innerDetail.dims.forEach(item => {
          if (catalogs.indexOf(item.catalog.catalogId) === -1) {
            catalogs.push(item.catalog.catalogId)
            delete this.restDims[item.catalog.catalogId]
          }
        })
        for (const i in this.allDims) {
          const dim = this.allDims[i]
          if (catalogs.indexOf(i) !== -1) {
            this.dimsDisplay[i] = dim
          }
        }
      } else {
        this.dimsDisplay = {}
      }
    },
    mapMonitors() {
      this.allMonitors = _.cloneDeep(
        this.monitors[Object.keys(this.monitors)[0]].values
      )
      this.restMonitors = _.cloneDeep(this.monitors)
      if (this.innerDetail && Array.isArray(this.innerDetail.monitorObjects)) {
        const catalogs = []
        this.innerDetail.monitorObjects.forEach(item => {
          if (catalogs.indexOf(item.catalog.catalogId) === -1) {
            catalogs.push(item.catalog.catalogId)
            delete this.restMonitors[item.catalog.catalogId]
          }
        })
        /* for(let i in this.allMonitors){
          let dim = this.allMonitors[i];
          if(catalogs.indexOf(i) !== -1){
            this.monitorsDisplay[i] = dim;
          }
        } */
      } else {
        this.monitorsDisplay = {}
      }
    },
    handleSelectChange() {
      this.refreshForm()
    },
    addDims() {
      this.resetChoDimsDiaShow()
      this.showChooseDims = true
    },
    resetChoDimsDiaShow() {
      this.allDimsArr = []
      const arr = Object.keys(this.restDims)
      arr.forEach(item => {
        if (this.restDims[item]) {
          this.allDimsArr.push({
            name: this.restDims[item].catalog,
            id: this.restDims[item].catalogId,
          })
        }
      })
      this.chooseDimsFilter(this.dimsKeyword)
    },
    handleAddDim(dim) {
      this.handleCommand(dim.id)
    },
    chooseDimsFilter(keyword) {
      if (!keyword || keyword === 0) {
        keyword = ''
      }
      this.allDimsShow = []
      this.allDimsArr.forEach(item => {
        if (item.name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1) {
          this.allDimsShow.push(item)
        }
      })
      this.$utils.sort.sortConsiderChineseNumber(this.allDimsShow, 'name')
    },
    refreshForm() {
      this.formKey++
    },
    mapProperties(p, propertyOfCode) {
      const properties = {}
      const map = new Map()
      if (propertyOfCode) {
        propertyOfCode.forEach(item => {
          map.set(item.property.propId, item.value)
        })
      }
      Array.isArray(p) &&
        p.forEach(item => {
          if (item.hasOwnProperty('catalog')) {
            // update
            const catalog = item.catalog.catalog
            if (!properties.hasOwnProperty(catalog)) {
              properties[catalog] = []
            }
            const property = {
              valueId: null,
              value: '',
              property: item,
            }
            if (map.has(item.propId)) {
              property.value = map.get(item.propId)
            }
            properties[catalog].push(property)
          } else if (item.hasOwnProperty('property')) {
            // create
            const catalog = item.property.catalog.catalog
            if (!properties.hasOwnProperty(catalog)) {
              properties[catalog] = []
            }
            properties[catalog].push(item)
          }
        })
      this.properties = properties
      this.refreshForm()
    },
    addProperty() {
      //      this.getPropertyCatalogs();
      this.showPropertyDialog = true
    },
    beforeUpdateDetail() {
      this.$refs.form0.validate(valid => {
        if (!valid) {
          this.$message.error('有必填项未填写，无法提交')
          return false
        } else {
          this.validateCodeWithTree()
        }
      })
    },
    validateCodeWithTree() {
      if (this.editMode || !this.innerDetail.codeId) {
        this.updateDetail()
      } else {
        // add
        const tree = this.$parent.$refs.mainTree
        const id = this.innerDetail.codeId
        const node = tree.getNode(id)
        if (node) {
          const path = [node.data.name]
          let current = node
          while (current.parent && current.parent.data.name) {
            path.push(current.parent.data.name)
            current = current.parent
          }
          path.reverse()
          this.$message.error(
            `指标编码 "${id}"已经被"` + path.join('/') + '"占用，指标创建失败'
          )
        } else {
          this.updateDetail()
        }
      }
    },
    updateDetail() {
      let requestUrl = ''
      const requestBody = _.cloneDeep(this.innerDetail)
      requestBody.properties = []
      for (const i in this.properties) {
        const item = this.properties[i]
        item.forEach(p => {
          p.valueId = null
          if (p.property.candidates === null) {
            p.value = this.describeValues[p.property.propId]
          }
        })
        requestBody.properties = requestBody.properties.concat(item)
      }
      let folderBlur = false
      if (this.type === 'BASE_CODE') {
        requestUrl = this.$url + '/service/me/baseCodes'
        if (!this.editMode) {
          requestBody.categoryId = this.categoryId
        }
        if (requestBody.categoryId && Array.isArray(requestBody.categoryId)) {
          requestBody.categoryId = Number.parseInt(
            requestBody.categoryId[requestBody.categoryId.length - 1]
          )
          folderBlur = true
        }
      } else if (this.type === 'CODE') {
        requestUrl = this.$url + '/service/me/codes'
        if (!this.editMode) {
          if (this.msgFromParent) {
            if (this.msgFromParent.type === 'BASE_CODE') {
              requestBody.baseCodeId = this.msgFromParent.detail.codeId
            } else if (this.msgFromParent.type === 'CODE') {
              requestBody.parentCodeId = this.msgFromParent.detail.codeId
              requestBody.baseCodeId = this.msgFromParent.detail.baseCodeId
            }
          }
        }
        requestBody.dims = []
        for (const d in this.selectedDims) {
          const dimIds = this.selectedDims[d]
          if (Array.isArray(dimIds)) {
            dimIds.forEach(dimId => {
              requestBody.dims.push({
                dimId: dimId,
              })
            })
          }
        }
        /* if(this.selectedTime.time){
          requestBody.dims.push({
            dimId:this.selectedTime.time.dimId
          });
        } */
        requestBody.monitorObjects = []
        const ids = this.selectedMonitors
        if (Array.isArray(ids)) {
          ids.forEach(id => {
            requestBody.monitorObjects.push({
              objectId: id,
            })
          })
        }
      } else if (this.type) {
        return false
      } else {
        return false
      }
      this.$http
        .post(requestUrl, requestBody)
        .then(res => {
          if (this.editMode) {
            this.$message.success('修改成功')
            this.$bus.$emit('updateTreeNode', {
              type: 'rename',
              data: res.data,
            })
          } else {
            this.$message.success('创建成功')
            this.$bus.$emit('updateTreeNode', {
              type: 'create',
              data: res.data,
            })
          }

          this.$bus.$emit('changeMode', 'scan')
          //        this.$bus.$emit('reloadTree');
          this.$bus.$emit('changeCurrentDetail', res.data)
          if (folderBlur) {
            this.$emit('update', requestBody.categoryId)
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    cancel() {
      if (this.editMode) {
        this.$bus.$emit('changeMode', 'scan')
      } else {
        this.$bus.$emit('changeMode', null)
      }
    },
    beforeUpload() {
      this.$fullScreenLoading.open()
    },
    handleUploadError(e) {
      this.$showUploadFailure()
      this.$fullScreenLoading.close()
    },
    handleUploadSuccess(response) {
      const documents = this.innerDetail.documents
      if (!this.innerDetail.documents) {
        this.innerDetail.documents = []
      }
      this.innerDetail.documents.push({
        uuid: response.fileId,
        docName: response.fileOrginalName,
      })
      this.$http
        .put(this.$url + '/service/files/commit?fileIds=' + response.fileId)
        .then(res => {
          this.$fullScreenLoading.close()
          this.getDocumentsDetail()
          this.refreshForm()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getDocumentsDetail() {
      let fileIds = ''
      if (Array.isArray(this.innerDetail.documents)) {
        this.innerDetail.documents.forEach(doc => {
          if (fileIds === '') {
            fileIds += doc.uuid
          } else {
            fileIds += ',' + doc.uuid
          }
        })
      }
      this.$http
        .get(this.$url + '/service/files/?fileIds=' + fileIds)
        .then(res => {
          this.documents = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    downloadDoc(fileId) {
      const url = this.$url + '/service/files/' + fileId + '/download'
      this.$downloadFile(url)
    },
    handleDocumentRemove(index) {
      this.innerDetail.documents.splice(index, 1)
      this.getDocumentsDetail()
      //      this.$confirm('此操作将永久删除该文档, 是否继续?', '提示', {
      //        confirmButtonText: '确定',
      //        cancelButtonText: '取消',
      //        type: 'warning'
      //      }).then(() => {
      //        this.$http.delete(this.$url + '/service/files/' + uuid).then(res=>{
      //          this.$message({
      //            type: 'success',
      //            message: '删除成功!'
      //          });
      //        }).catch(e=>{
      //          this.$showFailure(e);
      //        });
      //      }).catch(() => {
      //        this.$message({
      //          type: 'info',
      //          message: '已取消删除'
      //        });
      //      });
    },
    handleCommand(command) {
      this.restDims[command] = null
      this.dimsDisplay[command] = this.allDims[command]
      this.resetChoDimsDiaShow()
      this.refreshForm()
    },
    handleMonitorCommand(command) {
      this.restMonitors[command] = null
      this.monitorsDisplay[command] = this.allMonitors[command]
      this.refreshForm()
    },
  },
  computed: {
    submitDisabled() {
      if (this.type === 'BASE_CODE') {
        return !(
          this.innerDetail.cnAbbr &&
          this.innerDetail.enAbbr &&
          this.innerDetail.area
        )
      } else if (this.type === 'CODE') {
        return !(this.innerDetail.chAbbr && this.innerDetail.enAbbr)
      } else {
        return false
      }
    },
  },
  watch: {
    dimsKeyword(newVal, oldVal) {
      this.chooseDimsFilter(newVal)
    },
    showChooseDims(newVal) {
      // let $dom = null;
      // if (newVal) {
      //   this.$nextTick(() => {
      //     if (this.$refs.chooseDimsTable) {
      //       $dom = $('.choose-dims .el-table__body-wrapper.is-scrolling-none').addClass('over-hidden');
      //     }
      //     Ps.initialize($dom[0]);
      //   });
      // } else {
      //   $dom = $('.choose-dims .el-table__body-wrapper.is-scrolling-none');
      //   // Ps.destroy($dom[0]);
      // }
    },
  },
}
