export default {
  data() {
    return {
      propertyCatalogs: [],
      defaultProps: {
        label: 'name',
        value: 'propId',
        isLeaf: 'leaf',
      },
      enableSelectBtn: false,
      treeKey: 0,
      catalogName: '',
      nameDialogVisible: false,

      propertyDialogVisible: false,
      referenceCatalog: null,
      propertyName: '',
      propertyId: '',
      dynamicTags: [],
      inputVisible: false,
      inputValue: '',
      allProps: [],
      currentProp: null,
      propertyUpdateDialogVisible: false,
    }
  },
  mounted() {},
  methods: {
    getPropertyCatalogs() {},
    loadProperty(node, resolve) {
      if (node.level === 0) {
        const rtn = []
        this.$http
          .get(this.$url + '/service/me/properties/catalogs')
          .then(res => {
            this.allProps = []
            this.propertyCatalogs = res.data
            this.propertyCatalogs.forEach(item => {
              rtn.push({
                name: item.catalog,
                propId: item.catalogId,
              })
            })
            return resolve(rtn)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
      if (node.level > 1) return resolve([])
      if (node.level === 1) {
        this.$http
          .get(
            this.$url +
              '/service/me/properties/catalogs/' +
              node.data.propId +
              '/properties'
          )
          .then(res => {
            res.data.forEach(item => {
              item.leaf = true
            })
            this.allProps = this.allProps.concat(res.data)
            this.handlePropertySelected()
            return resolve(res.data)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
      return resolve([])
    },
    handlePropertySelected() {
      const a = this.allProps
      this.$bus.$emit('propertySelected', a)
    },
    handleNodeClick(data, node) {
      //      if(node.level === 2){
      //        this.enableSelectBtn = true;
      //      }else{
      //        this.enableSelectBtn = false;
      //      }
    },
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1)
    },

    showInput() {
      this.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    handleInputConfirm() {
      const inputValue = this.inputValue
      if (inputValue) {
        this.dynamicTags.push(inputValue)
      }
      this.inputVisible = false
      this.inputValue = ''
    },
    renderContent(h, { node, data, store }) {
      if (node.level === 2) {
        return (
          <span style="flex: 1; display: flex;align-items: center;justify-content:space-between;">
            <span>
              <span class="tree-icon fa fa-address-card-o"></span>
              <span>{node.label}</span>
              <span style="margin-left:2em;color:#999">{data.propId}</span>
            </span>
            <span class="moveToRight">
              <el-button
                size="mini"
                type="text"
                on-click={() => this.updateProperty(node, data)}
              >
                修改
              </el-button>
              <el-button
                size="mini"
                type="text"
                on-click={() => this.removeProperty(node, data)}
              >
                {{ $t('common.button.delete') }}
              </el-button>
            </span>
          </span>
        )
      } else {
        return (
          <span style="flex: 1; display: flex;align-items: center;justify-content:space-between">
            <span>
              <span class="icon-i-folder">
                <span class="path1"></span>
                <span class="path2"></span>
              </span>
              <span>{node.label}</span>
            </span>
            <span class="moveToRight">
              <el-button
                size="mini"
                type="text"
                on-click={() => this.appendProperty(data)}
              >
                添加属性
              </el-button>
              {/* <el-button size="mini" type="text" on-click={ () => this.removeCatalog(node, data) }>Delete</el-button> */}
            </span>
          </span>
        )
      }
    },
    removeCatalog(node, data) {
      this.$http
        .delete(this.$url + '/service/me/properties/catalogs/' + data.propId)
        .then(res => {
          this.treeKey++
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    appendProperty(data) {
      this.propertyDialogVisible = true
      this.referenceCatalog = data
    },
    handleAppendProperty() {
      const requestBody = {
        propId: 'P-' + this.$getUniqueId(),
        name: this.propertyName,
        candidates: null,
        catalog: {
          catalogId: this.referenceCatalog.propId,
        },
      }
      if (this.propertyId) {
        requestBody.propId = this.propertyId
      }
      if (this.dynamicTags.length > 0) {
        requestBody.candidates = this.dynamicTags
      }
      this.$http
        .post(this.$url + '/service/me/properties', requestBody)
        .then(res => {
          this.propertyDialogVisible = false
          this.treeKey++
          this.dynamicTags = []
          this.propertyName = ''
          this.propertyId = ''
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updateProperty(node, data) {
      const propId = data.propId
      this.currentProp = null
      this.allProps.forEach(p => {
        if (p.propId === propId) {
          this.currentProp = p
        }
      })
      if (this.currentProp.candidates) {
        this.dynamicTags = this.currentProp.candidates
      } else {
        this.dynamicTags = []
      }
      this.propertyUpdateDialogVisible = true
    },
    executeUpdateProperty() {
      const requestBody = this.currentProp
      if (this.dynamicTags.length > 0) {
        requestBody.candidates = this.dynamicTags
      }
      this.$http
        .post(this.$url + '/service/me/properties', requestBody)
        .then(res => {
          this.propertyUpdateDialogVisible = false
          this.treeKey++
          this.dynamicTags = []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    removeProperty(node, data) {
      const propId = data.propId
      this.$http
        .delete(this.$url + '/service/me/properties/' + propId + '/')
        .then(res => {
          this.treeKey++
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    createNewCatalog() {
      this.catalogName = ''
      this.nameDialogVisible = true
    },
    handleCreateOrUpdateCatalog() {
      this.nameDialogVisible = false
      const catalogId = 'PC-' + this.$getUniqueId()
      const requestBody = {
        catalogId: catalogId,
        catalog: this.catalogName,
      }
      this.$http
        .post(this.$url + '/service/me/properties/catalogs', requestBody)
        .then(res => {
          this.treeKey++
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
