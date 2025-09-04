import fileList from './fileList.vue'
import fileDetail from './shareFileDetail.vue'
import shareFileUdp from '@/view/dataProperty/meta/shareFileUdp.vue'
// import UserSelect from '../../components/common/UserSelect.vue';
// import udps from './udps.vue';
// import standardDetail from './standardDetail.vue';
// import quoto from './quoto.vue';
// import updatedDomain from './updatedDomain.vue';
export default {
  components: {
    fileDetail,
    fileList,
    shareFileUdp,
    // UserSelect,
    // udps,
    // standardDetail,
    // quoto,
    // updatedDomain
  },
  data() {
    return {
      hasAccess: false,
      showShareFileUpd: false,
      // left tree
      treeLoading: false,
      treeData: [],
      checkedList: [],
      checkedListLength: 0,
      queryFirstTime: true,
      defaultProps: {
        // children: 'children',
        label: 'name',
        // id: 'catalogName'
      },
      catalogIdCount: 1,

      // right list
      contentStatus: 'scan', // 'write','folder'
      nowFolder: {},
      fileObjMap: {},

      // right file detail
      currentFileData: null,

      // dataservice
      isAdopting: false,
      options: [],
      udps: [],
      showUdps: false,
      currentTab: 'details',
      showAddTab: false,

      keyword: '',
      keywordSetTimeout: null,
      treeBox: undefined,

      // expandedKeys: [],
      // state: "A",

      fullListDataMap: {},
      listData: [],

      userSelect1: null,

      nowDomainId: null,
      nowDomain: null,
      uploading: false,
      currentServiceType: '',

      updatingDetails: null,
      treeKey: 0,
      currentData: null,
    }
  },
  mounted() {
    this.hasAccess = this.$auth.SUPER_USER
    this.loadingTreeData()
    this.treeBox = $('.tree-box')[0]
    setTimeout(() => {
      Ps.initialize(this.treeBox, {
        minScrollbarLength: 60,
      })
    }, 200)
  },
  beforeDestroy() {
    this.$message.closeAll()
  },
  methods: {
    loadingTreeData() {
      this.treeLoading = true
      this.checkedList = []
      this.treeData = []
      const url = `${this.$url}/service/shareFile/catalog`
      this.$http
        .get(url)
        .then(res => {
          const data = res.data
          this.fileObjMap = {}
          this.treeData = this.formatTreeData([data], [])
          console.log(this.treeData, 'this.treeData')
          this.checkedList = []
          this.checkedListLength = 0
          this.treeLoading = false

          if (this.queryFirstTime && this.$route.query.domain) {
            this.queryFirstTime = false
          } else {
            if (this.treeData && this.treeData[0]) {
              this.nowFolder = this.treeData[0]
              this.contentStatus = 'folder'
            }
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    filterNode(value, data, node) {
      if (!value) return true
      let current = node
      let hit = false
      do {
        hit = current.data.name.toLowerCase().includes(value.toLowerCase())
        current = current.parent
      } while (!hit && current.data && current.data.name)
      // console.log(hit, 'hit')
      return hit
    },
    formatTreeData(data, parentPath, parentObj) {
      // console.log(data, 'data')
      const arr = []
      if (!parentPath || !Array.isArray(parentPath)) {
        parentPath = []
      } else {
        parentPath = _.cloneDeep(parentPath)
      }
      if (data && Array.isArray(data)) {
        data.forEach(item => {
          const currentPath = _.cloneDeep(parentPath)
          currentPath.push(item.catalogName)
          const obj = {
            name: item.catalogName,
            id: this.catalogIdCount++,
            path: currentPath,
            parent: parentObj ? parentObj.id : null,

            type: 'catalog',
          }
          obj.children = this.formatTreeData(item.children, currentPath, obj)
          const values = item.values
          // console.log(values, 'values')
          if (values && Array.isArray(values)) {
            values.forEach(file => {
              const currentPath = _.cloneDeep(parentPath)
              currentPath.push(file.name)
              const fileObj = {
                name: file.name,
                id: this.catalogIdCount++,
                path: currentPath,
                parent: parentObj ? parentObj.id : null,

                type: 'file',
                fileId: file.id,
                filePath: file.path,
                fileType: file.type,
              }
              obj.children.push(fileObj)
              this.fileObjMap[fileObj.id] = fileObj
            })
          }
          arr.push(obj)
          this.fileObjMap[obj.id] = obj
        })
      }

      return arr
    },
    filterFilePath() {
      const keyword = this.keyword
      this.$refs.shareFileTree.filter(keyword)
      setTimeout(() => this.updateTreeBoxScrollbar())
    },

    renderContent(h, { node, data, store }) {
      // console.log(node, 'node')
      const getIcon = node => {
        const data = node.data
        if (data.type === 'catalog') {
          return h('span', { class: 'icon-i-folder' }, [
            h('span', { class: 'path1' }),
            h('span', { class: 'path2' }),
          ])
        } else {
          return h(
            'span',
            {
              class: 'tree-icon file ' + this.$fileTypeFormatter(data.fileType),
            },
            [
              // h('datablau-icon', {
              //   'data-type': this.$fileTypeFormatter(data.type),
              // })
            ]
          )
        }
      }
      return h(
        'span',
        { style: 'flex: 1; display: flex;align-items: center;' },
        [getIcon(node), h('span', {}, node.label)]
      )
      /* if (false) {
        let className = 'tree-icon domain'
        if (data.updatingId) {
          className += ' is-updating'
        }

        return (
          <span style="flex: 1; display: flex;align-items: center;" data-code={data.dataServiceId}>
            <span class={className}></span>
            <span>{node.label}</span>
          </span>
        )
      } else {
        return (
          <span style="flex: 1; display: flex;align-items: center;">
            <span class="icon-i-folder">
              <span class="path1"></span>
              <span class="path2"></span>
            </span>
            {/!* <datablau-icon v-else :data-type="$fileTypeFormatter(node.type)"></datablau-icon> *!/}
            <span>{node.label}</span>
          </span>
        )
      } */
    },
    handleItemClicked(data, node) {
      if (data.type === 'catalog') {
        this.nowFolder = data
        this.contentStatus = 'folder'
      } else {
        this.showFileDetail({ id: data.fileId })
      }
    },
    showFileDetail(data) {
      // console.log(data, 'data')
      this.currentFileData = data
      this.contentStatus = 'scan'
    },
    backToFolder() {
      this.contentStatus = 'folder'
    },
    callTopOptions(evt) {
      const x = evt.clientX
      const y = evt.clientY
      const options = [
        /* {
        icon:'el-icon-download',
        label: '下载模版',
        callback: this.modelDownload
      },{
        icon:'el-icon-upload',
        label:'批量导入',
        callback:()=>{
          if(!this.uploading){
            $('#ban-upload-btn').click();
          }else{
            this.$message.warning('正在导入中，请稍候');
          }
        }
      },{
        icon:'el-icon-download',
        label:'批量导出',
        callback:this.standardDownload
      }, */
        // {
        //   icon:'el-icon-download',
        //   label:'批量导出',
        //   callback:this.standardDownload
        // },
        {
          icon: 'el-icon-edit',
          label: '扩展属性',
          callback: () => {
            this.showShareFileUpd = true
          },
        },
      ]
      this.$bus.$emit('callContextMenu', {
        x: x,
        y: y,
        options: options,
      })
    },
    // old
    goToUpdate(details) {
      this.state = 'D'
      $('.tab-box.tri [state=D]').click()
      this.updatingDetails = details
      setTimeout(() => {
        this.updatingDetails = null
      }, 3000)
    },

    // handleCheckChange (data, checked) {
    //   this.checkedList = this.$refs.mainTree.getCheckedKeys(true);
    //   this.checkedListLength = this.checkedList.length;
    //   this.checkedContent = this.$refs.mainTree.getCheckedNodes(true);
    // },

    // innerLoadStandard () {
    //   this.treeLoading = true;
    //   this.checkedList = [];
    //   this.treeData = [];
    //   const self = this;
    //   let get_url = this.$url + "/service/citic-data-service/";
    //   this.$http.get(get_url).then(res => {
    //     self.checkedList = [];
    //     self.checkedListLength = 0;

    //     if (this.queryFirstTime && this.$route.query.domain) {
    //       this.queryFirstTime = false;

    //     } else {
    //       this.nowFolder = {data: res.data};
    //       this.contentStatus = 'folder';
    //     }
    //     let businessData = [];
    //     let businessDataMap = {};
    //     for (let typeKey in this.$citicDataService.type) {
    //       businessDataMap[typeKey] = [];
    //     }
    //     {
    //       this.listData = res.data;
    //       res.data.forEach(item=>{
    //         if(item.serviceType){
    //           businessDataMap[item.serviceType].push(item);
    //         }
    //       });
    //       this.fullListDataMap = businessDataMap;

    //       for (let key in businessDataMap) {
    //         let val = businessDataMap[key];

    //         businessData.push({
    //           name:this.$citicDataService.type[key].alias,
    //           enName:key,
    //           nodes:val
    //         })
    //       }
    //     }
    //     this.treeData = businessData;
    //     if (arguments[0] !== true && this.state === 'A') {
    //       self.expandedKeys = [];
    //     }
    //     this.expandedKeys = ['all'];
    //     this.$nextTick(() => {
    //       this.$refs.mainTree.setCurrentKey('all');
    //     });

    //     if (this.state === 'A') {
    //       if (arguments[0] !== true && businessData.length > 0 && !this.$route.query.domain) {
    //       } else if (this.$route.query.domain) {
    //         let domain = this.$route.query.domain;
    //         this.$nextTick(() => {
    //           this.$refs.mainTree.setCurrentKey(domain);
    //           this.expandedKeys = [domain];

    //           let currentNode = this.$refs.mainTree.getCurrentNode(domain);
    //           this.handleItemClicked(currentNode);
    //         });
    //       }
    //     } else if (this.state === 'D' && this.updatingDetails) {
    //       setTimeout(() => {
    //         this.$refs.mainTree.setCurrentKey(this.updatingDetails.domainId);
    //         this.expandedKeys = [this.updatingDetails.domainId];
    //         let node = this.$refs.mainTree.getCurrentNode();
    //         setTimeout(() => {
    //           let dom = $('.el-tree-node__content span[data-code=' + node.code + ']');
    //           dom.click();
    //         }, 200)
    //       });
    //     }
    //     let keyword = this.keyword.trim().toLowerCase();
    //     if (keyword) {
    //       setTimeout(() => {
    //         this.$refs.mainTree.filter(keyword);
    //         self.treeLoading = false;
    //         self.updateTreeBoxScrollbar();
    //       });
    //     } else {
    //       setTimeout(() => {
    //         self.treeLoading = false;
    //         self.updateTreeBoxScrollbar();
    //       })

    //     }
    //   }).catch(e => {
    //     this.$showFailure(e);
    //     self.treeLoading = false;
    //   });
    // },
    goToDomain(dataServiceId) {
      setTimeout(() => {
        this.$refs.mainTree.setCurrentKey(dataServiceId)
        this.expandedKeys = [dataServiceId]
        const node = this.$refs.mainTree.getCurrentNode()
        setTimeout(() => {
          const dom = $(
            '.el-tree-node__content span[data-code=' + node.dataServiceId + ']'
          )
          dom.click()
        }, 100)
      })
    },
    modifyArrKey(obj) {
      const self = this
      if (obj.nodes != null) {
        this.$utils.sort.sortConsiderChineseNumber(obj.nodes)
        obj.nodes.forEach(item => {
          self.modifyArrKey(item)
        })
      }
      if (obj.domains != null && obj.domains.length > 0) {
        this.$utils.sort.sortConsiderChineseNumber(obj.domains)
        obj.domains.forEach(item => {
          if (obj.nodes == null) {
            obj.nodes = []
          }
          obj.nodes.push(item)
        })
      }
    },
    updateTreeBoxScrollbar(time) {
      if (!this.treeBox) return
      const self = this
      setTimeout(() => {
        Ps.destroy($('.tree-box')[0])
      })

      setTimeout(function () {
        self.treeBox = $('.tree-box')[0]
        Ps.initialize(self.treeBox)
      }, time || 400)
    },

    submitAssignExamine() {
      const self = this
      if (!self.userSelect1) {
        return
      }
      self.lockAssignBtn = true
      const requestBody = {
        reviewer: self.userSelect1.name,
        domainIds: self.checkedList,
      }

      this.$postLongList({
        method: 'post',
        requestUrl: this.$url + '/service/domains/review',
        requestBody: requestBody,
        listParameter: 'domainIds',
        successCallback: () => {
          self.nowDomainId = null
          this.$message({
            title: this.$version.common.success,
            message: this.$version.common.operationSucceed,
            type: 'success',
          })
          self.lockAssignBtn = false
          this.showExamineDialog = false
          self.stateChange()
        },
        failureCallback: () => {
          self.lockAssignBtn = false
        },
        finallyCallback: () => {},
      })
    },
    deleteStandard() {
      const self = this
      this.$confirm(
        '将要删除这' + this.checkedListLength + '个数据标准，是否继续删除',
        '提示',
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(() => {
          const checkedIds = []
          this.checkedContent.forEach(item => {
            if (item.code) {
              checkedIds.push(item.id)
            }
          })
          this.isAdopting = true

          this.$postLongList({
            method: 'post',
            requestUrl: this.$url + '/service/domains/deleteByIds',
            requestBody: checkedIds,
            listParameter: null,
            successCallback: () => {
              self.$message({
                title: this.$version.common.success,
                message: this.$version.common.operationSucceed,
                type: 'success',
              })
              self.stateChange()
              self.nowDomainId = null
              this.$bus.$emit('reloadStandard')
            },
            failureCallback: () => {},
            finallyCallback: () => {
              this.isAdopting = false
            },
          })
        })
        .catch(() => {})
    },
    beforeAdopt() {
      const nodes = this.$refs.mainTree.getCheckedNodes(true)
      let hasUpdatingDomain = false
      nodes.forEach(node => {
        if (node.updatingId) {
          hasUpdatingDomain = true
        }
      })
      if (hasUpdatingDomain) {
        this.emailDialogDomainIds = _.clone(this.checkedList)
        this.emailDialogVisible = true
      } else {
        this.adopt()
      }
    },
    adoptAndSendEmail() {
      const checkedList = []
      const nodes = this.$refs.mainTree.getCheckedNodes(true)
      nodes.forEach(item => {
        if (item.updatingId) {
          checkedList.push(item.updatingId)
        } else {
          checkedList.push(item.id)
        }
      })
      const requestBody = {
        domainIds: this.checkedList,
        reviewer: this.$user.username,
        sendMailForDAM: this.emailForDam,
        sendMailForDDM: this.emailForDdm,
      }
      this.handleAdopt(requestBody)
    },
    adopt() {
      const checkedList = []
      const nodes = this.$refs.mainTree.getCheckedNodes(true)
      nodes.forEach(item => {
        if (item.updatingId) {
          checkedList.push(item.updatingId)
        } else {
          checkedList.push(item.id)
        }
      })
      const self = this
      const requestBody = {
        domainIds: this.checkedList,
        reviewer: this.$user.username,
        sendMailForDAM: false,
        sendMailForDDM: false,
      }
      this.handleAdopt(requestBody)
    },
    handleAdopt(requestBody) {
      const self = this
      this.emailDialogVisible = false
      this.isAdopting = true

      this.$postLongList({
        method: 'post',
        requestUrl: this.$url + '/service/domains/approve',
        requestBody: requestBody,
        listParameter: 'domainIds',
        successCallback: () => {
          this.$message({
            title: this.$version.common.success,
            message: this.$version.common.operationSucceed,
            type: 'success',
          })
          self.stateChange()
          self.nowDomainId = null
        },
        failureCallback: () => {
          self.stateChange()
        },
        finallyCallback: () => {
          this.isAdopting = false
        },
      })
    },
    reject() {
      const self = this
      const requestBody = {
        domainIds: self.checkedList,
      }
      this.isAdopting = true
      this.$postLongList({
        method: 'post',
        requestUrl: this.$url + '/service/domains/reject',
        requestBody: requestBody,
        listParameter: 'domainIds',
        successCallback: () => {
          this.$message({
            title: this.$version.common.success,
            message: this.$version.common.operationSucceed,
            type: 'success',
          })
          self.stateChange()
          self.nowDomainId = null
        },
        failureCallback: () => {
          self.stateChange()
        },
        finallyCallback: () => {
          this.isAdopting = false
        },
      })
    },
    withdraw() {
      const self = this

      this.$confirm(
        '确定将选中的数据标准标记为废弃吗？如果有标准正在被更新，则处于待审核或开发中的拷贝将被删除。',
        '批量废弃数据标准',
        {
          type: 'warning',
        }
      )
        .then(() => {
          this.isAdopting = true
          const length = this.checkedList.length
          let current = 0
          const xIt = () => {
            const url = `/service/domains/${this.checkedList[current]}/states/X`
            this.$http
              .put(this.$url + url)
              .then(res => {
                if (current === length - 1) {
                  this.stateChange()
                  this.isAdopting = false
                  this.$message.success(`成功废弃${length}条标准`)
                } else {
                  current++
                  xIt()
                }
              })
              .catch(e => {
                this.$showFailure(e)
              })
              .then(() => {})
          }
          xIt()
        })
        .catch(() => {
          this.$message.info('已取消执行废弃操作')
        })
    },
    handleClose() {
      this.showExamineDialog = false
    },

    add() {
      this.showAddTab = true
      this.currentTab = 'add'
      this.contentStatus = 'add'

      $('.is-current').removeClass('is-current')
    },
    removeTab() {
      this.currentTab = 'details'
      this.showAddTab = false
    },
    modelDownload() {
      const url = this.$url + '/service/domains/template'
      this.$downloadFile(url)
    },
    showBegain() {
      this.uploading = true
      this.$bus.$emit('showUploadProgress', {
        name: '导入数据标准',
        time: 10,
      })
    },
    onError(e) {
      this.uploading = false
      this.$message.closeAll()
      this.$bus.$emit('changeUploadProgress', false)
      this.$showUploadFailure(e)
    },
    onSuccess() {
      this.uploading = false
      this.$message.closeAll()
      this.$bus.$emit('changeUploadProgress', true)
      this.stateChange()
    },
    standardDownload() {
      const url = this.$url + '/service/domains/export'
      this.$message.info('正在导出，请稍候')
      this.$downloadFile(url)
    },
    handleReload(newName) {
      this.contentStatus = 'scan'
      const node = this.$refs.mainTree.getCurrentNode()
      if (newName) {
        node.name = newName
      } else {
        // if(this.state === 'D' || this.state==='X'){
        this.stateChange()
        // }
      }
    },
    callOptions(evt) {
      const x = evt.clientX
      const y = evt.clientY
      const options = [
        {
          icon: 'el-icon-plus',
          label: '添加数据服务',
          callback: this.add,
        },
      ]
      this.$bus.$emit('callContextMenu', {
        x: x,
        y: y,
        options: options,
      })
    },
  },
  computed: {
    enableBtn() {
      return this.checkedList.length > 0
    },
    defaultExpandAll() {
      return false
    },
  },
  watch: {
    keyword(value) {
      this.filterFilePath()
    },
    state(state) {
      this.stateChange()
    },
  },
}
