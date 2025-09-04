import { forEach, truncate } from 'lodash'
import chooseTag from '@/components/dataSource/chooseTag.vue'
import dataSourceDialog from './dataSourceDialog.vue'
import scriptListDialog from './scriptListDialog'
import DatabaseType from '@/components/dataSource/DatabaseType.vue'
import uploadTab from '../uploadTab.vue'
import lineageTab from '../lineageTab.vue'
// import jobDetail from '@/components/jobManagement/jobDetail.vue'
import jobDetail from '@/view/dataProperty/meta/metadataJob/jobScheduler.vue'
import { page } from '../scriptManage/server'
export default {
  components: {
    dataSourceDialog,
    DatabaseType,
    chooseTag,
    uploadTab,
    jobDetail,
    scriptListDialog,
    lineageTab,
  },
  data() {
    return {
      disabledEdit: true,
      activeName: 'first',
      formData: {
        TagIds: null,
      },
      tagMap: {},
      dsCascaderProps: {
        value: 'id',
        label: 'name',
        children: 'subSets',
        checkStrictly: true,
      },
      options: [],
      dataSourceKeywords: '',
      optionTable: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      tableDataSource: [],
      totalDataSource: 0,
      dialogVisible: false,
      scriptDialogVisible: false,
      folderId: null,
      currentPage: 1,
      pageSize: 20,
      scriptKeywords: '',
      scriptSearchTimer: null,
      tableScript: null,
      totalScript: 0,
      optionScriptTable: {
        selectable: true,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
      currentPageScript: 1,
      sizeScript: 20,
      dataSourceSelection: [],
      scriptSelection: [],
      scanData: {},
      rules: {
        folderName: [
          {
            required: true,
            message: this.$t(
              'meta.lineageManage.lineageCatalogue.rules.folderName'
            ),
            trigger: 'blur',
          },
        ],
        path: [
          {
            required: true,
            message: this.$t('meta.lineageManage.lineageCatalogue.rules.path'),
            trigger: 'blur',
          },
        ],
        itDepartmentName: [
          {
            required: true,
            message: this.$t(
              'meta.lineageManage.lineageCatalogue.rules.itDepartmentName'
            ),
            trigger: 'blur',
          },
        ],
        bsDepartmentName: [
          {
            required: true,
            message: this.$t(
              'meta.lineageManage.lineageCatalogue.rules.bsDepartmentName'
            ),
            trigger: 'blur',
          },
        ],
        TagIds: [
          {
            required: true,
            message: this.$t(
              'meta.lineageManage.lineageCatalogue.rules.TagIds'
            ),
            trigger: 'blur',
          },
        ],
        owner: [
          {
            required: true,
            message: this.$t('meta.lineageManage.lineageCatalogue.rules.owner'),
            trigger: 'blur',
          },
        ],
      },
      tagTree: [],
      dialogUploadTab: false,
      tableLineage: [],
      loadLineageJobData: {},
      showSystemSetting: false,
      uploadTabfolderId: null,
      uploadTabFolderName: '',
      showLineageTab: false,
      uploadState: false,
      uploadLineage: null,
      scriptDetailVisible: false,
      currentScript: {},
      inheritDataSource: false,
      inheritScript: false,
      isAddJob: true,
      orderDesc: true,
    }
  },
  props: ['selectionData'],
  beforeMount() {},
  mounted() {
    // this.scanDataDeatil =_.cloneDeep(gridOptionsDefault)
    // this.getTreeData()
  },
  methods: {
    selectItDepartment() {
      this.$utils.branchSelect.open(false).then(res => {
        this.$set(this.formData, 'itDepartment', res.bm)
        this.$set(this.formData, 'itDepartmentName', res.fullName)
        this.$refs.formData.validateField('itDepartmentName')
      })
    },
    selectBsDepartment() {
      this.$utils.branchSelect.open(false).then(res => {
        this.$set(this.formData, 'bsDepartment', res.bm)
        this.$set(this.formData, 'bsDepartmentName', res.fullName)
        this.$refs.formData.validateField('bsDepartmentName')
      })
    },
    selectProblemUser() {
      this.$utils.staffSelect.open([], true).then(res => {
        this.formData.owner = res[0].username
        this.$refs.formData.validateField('owner')
      })
    },
    viewScriptDetail(row) {
      this.scriptDetailVisible = true
      this.currentScript = row
    },
    getScript() {
      this.tableScript = null
      let id = this.scanData.folderDto.inheritScriptFolderId
        ? this.scanData.folderDto.inheritScriptFolderId
        : this.scanData.folderDto.folderId
      this.$http
        .post(
          `${this.$meta_url}/service/lineage/folder/page/script/${id}?keyword=${this.scriptKeywords}&currentPage=${this.currentPageScript}&pageSize=${this.sizeScript}`
        )
        .then(res => {
          let tempData = []
          if (res.data.content.length) {
            tempData = res.data.content.map(item => {
              return {
                scriptTypeDesc:
                  item.scriptType === 'JAVASCRIPT'
                    ? 'javascript'
                    : '正则表达式',
                ...item,
              }
            })
          }
          if (this.currentPageScript > 1 && tempData.length === 0) {
            this.currentPageScript --
            this.getScript()
          } else {
            this.tableScript = tempData
            this.totalScript = res.data.totalItems
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    // 查任务详情
    setSystemJob(folderId) {
      this.$http
        .post(`/metadata/service/jobs/query/jobs/byCriteria`, {
          '@type': '.MultipleCriteria',
          criteria: [
            {
              '@type': '.FieldEqualsCriteria',
              page: null,
              fieldName: 'resourceId',
              compareValue: `${folderId}`,
              notEqual: false,
            },
            {
              '@type': '.FieldEqualsCriteria',
              page: null,
              fieldName: 'jobType',
              compareValue: '元数据-载入血缘文件任务',
              notEqual: false,
            },
          ],
        })
        .then(res => {
          if (res.data.content.length === 0) {
            this.isAddJob = true
          } else {
            this.isAddJob = false
          }
          this.loadLineageJobData = res.data.content[0]
          this.showSystemSetting = true
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 导入血缘文件
    addUploadTab(lineage) {
      this.dialogUploadTab = true
      this.uploadState = true
      if (lineage) {
        this.uploadLineage = {
          type: lineage.type.toLowerCase(),
          name: lineage.name,
          tabName: lineage.filename,
          title: lineage.filename + ' id: ' + lineage.id,
          id: lineage.id,
          updata: true,
          lineage: lineage,
        }
        setTimeout(() => {
          this.$refs.uploadTab.initUploadTab()
        })
      } else {
        this.uploadLineage = { updata: false }
        setTimeout(() => {
          this.$refs.uploadTab.initUploadTab()
        })
      }
    },
    handleCloseUploadTab() {
      this.dialogUploadTab = false
      this.activeName === 'fifth'
      this.showLineageTab = false
      setTimeout(() => {
        this.showLineageTab = true
      })
      this.$refs.uploadTab.clearFiles()
    },
    choosedTagChanged(tagIds) {
      this.$nextTick(() => {
        this.$set(this.formData, 'TagIds', tagIds)
      })
    },
    openChooseTag() {
      this.$refs.tagSelect.blur()
      this.handleAddTag()
    },
    handleAddTag() {
      this.$refs.chooseTag && this.$refs.chooseTag.showDialog()
    },
    // 编辑基础信息
    editFormData() {
      this.disabledEdit = false
    },
    saveEdit() {
      this.$refs.formData.validate(valid => {
        if (valid) {
          let obj = {
            folderId: this.scanData.folderDto.folderId,
            parentFolderId: this.scanData.folderDto.parentFolderId,
            folderName: this.formData.folderName,
            itDepartment: this.formData.itDepartment,
            bsDepartment: this.formData.bsDepartment,
            owner: this.formData.owner,
            // tagIds: this.formData.TagIds && this.formData.TagIds.join(','),
            description: this.formData.description,
            jobId: this.scanData.folderDto.jobId,
          }
          if (this.formData.path.join('/') === '0') {
            obj.pathsId = null
          } else {
            this.formData.path.shift()
            obj.pathsId = this.formData.path.join('/')
          }
          this.$http
            .post(
              this.$meta_url + '/service/lineage/folder/addOrUpdateFolder',
              obj
            )
            .then(res => {
              this.$blauShowSuccess(
                this.$t(
                  'meta.lineageManage.lineageCatalogue.detailScan.editSuccess'
                )
              )
              this.disabledEdit = true
              this.$emit('treeClick', this.scanData.folderDto.folderId, 'scan')
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      })
    },
    cancelEdit() {
      this.disabledEdit = true
      this.$emit('treeClick', this.scanData.folderDto.folderId, 'scan')
    },
    // 添加脚本
    addScript() {
      this.scriptDialogVisible = true
      this.$refs.scriptDialog.open()
    },
    handleSizeChangeScript(size) {
      this.sizeScript = size
      this.currentPageScript = 1
      this.getScript()
    },
    handleCurrentChangeScript(current) {
      this.currentPageScript = current
      this.getScript()
    },

    // 添加数据源
    addDataSource() {
      this.dialogVisible = true
      this.$refs.dataSourceDialog.open()
    },
    handleSortChange(sortData) {
      this.orderDesc =
        sortData.order === 'descending' || sortData.order === null
      this.getModel()
    },
    getModel() {
      this.tableDataSource = []
      let id = this.scanData.folderDto.inheritModelFolderId
        ? this.scanData.folderDto.inheritModelFolderId
        : this.scanData.folderDto.folderId
      this.$http
        .post(
          this.$meta_url +
            `/lineage/folder/page/model/${id}?keyword=${this.dataSourceKeywords}&currentPage=${this.currentPage}&pageSize=${this.pageSize}&orderDesc=${this.orderDesc}`
        )
        .then(res => {
          if (res.data) {
              this.tableDataSource = res.data.content
              this.totalDataSource = res.data.totalItems
          } else {
            this.tableDataSource = []
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTreeRef(act) {
      this.$emit('treeClick', this.scanData.folderDto.folderId, 'scan', act)
    },
    handleSelectionChange(val) {
      this.dataSourceSelection = val
    },
    handleScriptSelectionChange(val) {
      this.scriptSelection = val
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.getModel()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.getModel()
    },
    // 删除绑定数据源
    deleteDataSource() {
      this.$DatablauCofirm(
        this.$t('meta.lineageManage.lineageCatalogue.deletePrompt'),
        this.$t('meta.lineageManage.lineageCatalogue.deleteDataSource'),
        {
          type: 'warning',
        }
      )
        .then(() => {
          let refIds = []
          this.dataSourceSelection.forEach(element => {
            refIds.push(element.refId)
          })
          this.$http
            .post(
              this.$meta_url +
                `/lineage/folder/deleteFolderRefs/DATAOBJECT/${this.scanData.folderDto.folderId}`,
              refIds
            )
            .then(res => {
              this.$message.success(
                this.$t(
                  'meta.lineageManage.lineageCatalogue.successfullyDeleted'
                )
              )
              if (
                this.tableDataSource.length === refIds.length &&
                this.currentPage !== 1
              ) {
                this.currentPage -= 1
              }
              this.getModel()
              this.getTreeRef()
            })
        })
        .catch(e => {})
    },
    deleteScript() {
      this.$DatablauCofirm(
        this.$t('meta.lineageManage.lineageCatalogue.deletePrompt'),
        this.$t('meta.lineageManage.lineageCatalogue.deleteScript'),
        {
          type: 'warning',
        }
      )
        .then(() => {
          let refIds = []
          this.scriptSelection.forEach(element => {
            refIds.push(element.refId)
          })
          this.$http
            .post(
              this.$meta_url +
                `/lineage/folder/deleteFolderRefs/SCRIPT/${this.scanData.folderDto.folderId}`,
              refIds
            )
            .then(res => {
              this.$message.success(
                this.$t(
                  'meta.lineageManage.lineageCatalogue.successfullyDeleted'
                )
              )
              this.getScript()
              this.getTreeRef()

            })
        })
        .catch(e => {})
    },
    closeDialog() {
      this.dialogVisible = false
    },
    closeScriptDialog() {
      this.scriptDialogVisible = false
    },
    handleClick(val) {
      this.activeName = val.name || this.activeName
      if (this.activeName === 'third') {
        this.getModel()
      } else if (this.activeName === 'fourth') {
        this.getScript()
      } else if (this.activeName === 'sixth') {
        this.setSystemJob(this.scanData.folderDto.folderId)
      } else if (this.activeName === 'fifth') {
        this.uploadTabfolderId = this.scanData.folderDto.folderId
        this.uploadTabFolderName = this.scanData.folderDto.folderName
        this.showLineageTab = true
      }
      if (this.activeName !== 'fifth') {
        this.showLineageTab = false
      }
    },
    getTreeData(data, act = 'first') {
      this.activeName = this.activeName || act
      this.showSystemSetting = false
      this.showLineageTab = false
      this.scanData = _.cloneDeep(data)
      this.disabledEdit = true
      this.handleClick(this.activeName)
      this.$http
        .post(this.$meta_url + '/service/lineage/folder/tree')
        .then(res => {
          this.options.push(res.data)
          this.getTags()
          if (data.folderDto.pathsId === null) {
            this.$nextTick(() => {
              this.$set(this.formData, 'path', [0])
            })
          } else {
            let arr = this.scanData.folderDto.pathsId.split('/')
            arr.pop()
            // arr.unshift('0')
            this.$nextTick(() => {
              this.$set(this.formData, 'path', arr.map(Number))
            })
          }

          this.formData = this.scanData.folderDto
          this.$nextTick(() => {
            this.byBms(this.scanData.folderDto.itDepartment, 'itDepartment')
            this.byBms(this.scanData.folderDto.bsDepartment, 'bsDepartment')
          })
          /* if (this.scanData.folderDto.tagIds) {
            this.formData.TagIds =
              this.scanData.folderDto.tagIds &&
              this.scanData.folderDto.tagIds.split(',').map(Number)
          } */
          this.folderId = this.scanData.folderDto.folderId
          if (
            this.scanData.folderDto.inheritModelFolderId &&
            this.scanData.folderDto.inheritModelFolderId !== null
          ) {
            this.inheritDataSource = true
          } else {
            this.inheritDataSource = false
          }
          if (
            this.scanData.folderDto.inheritScriptFolderId &&
            this.scanData.folderDto.inheritScriptFolderId !== null
          ) {
            this.inheritScript = true
          } else {
            this.inheritScript = false
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    byBms(id, type) {
      let obj = [id]
      this.$http
        .post('/user/org/organization/byBms', obj)
        .then(res => {
          if (type === 'itDepartment') {
            this.$nextTick(() => {
              if (res.data.length > 0) {
                this.$set(
                  this.formData,
                  'itDepartmentName',
                  res.data[0].fullName
                )
              } else {
                this.$set(this.formData, 'itDepartmentName', '')
              }
            })
          } else {
            this.$nextTick(() => {
              if (res.data.length > 0) {
                this.$set(
                  this.formData,
                  'bsDepartmentName',
                  res.data[0].fullName
                )
              } else {
                this.$set(this.formData, 'bsDepartmentName', '')
              }
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 关于 tag
    getTags(callback) {
      this.$http
        .post(this.$url + '/tags/getAllTags')
        .then(res => {
          const tagTree = []
          const map = {}
          let datazoneTag = {}
          if (res.data && Array.isArray(res.data)) {
            res.data.forEach(item => {
              map[item.tagId] = item
              if (item.name === '数据区域') {
                datazoneTag = item
              }
            })
            res.data.forEach(item => {
              if (item.parentId && map[item.parentId]) {
                var parent = map[item.parentId]
                if (!parent.children) {
                  parent.children = []
                }
                parent.children.push(item)
              } else {
                tagTree.push(item)
              }
            })
            this.tagMap = map
            this.tagTree = tagTree
          }
          this.dataZoneTags = datazoneTag.children || []
          callback && callback()
        })
        .catch(e => {
          this.$showFailure(e)
          callback && callback()
        })
    },
  },
  watch: {
    dataSourceKeywords(val) {
      this.currentPage = 1
      this.getModel()
    },
    scriptKeywords(val) {
      clearTimeout((this.scriptSearchTimer))
      this.scriptSearchTimer = setTimeout(() => {
        this.currentPageScript = 1
        this.getScript()
      }, 300)
    },
  },
}
