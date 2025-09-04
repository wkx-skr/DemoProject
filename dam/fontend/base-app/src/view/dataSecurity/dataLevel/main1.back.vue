<template>
  <div @mousemove="onDrag($event)" class="tagPage">
    <datablau-dialog :title="editTitle" :visible.sync="dialogVisible" size="s">
      <div class="dialog-container dialog-form-content" v-if="dialogVisible">
        <el-form
          class="edit-tag"
          :rules="rules"
          @submit.native.prevent
          :label-width="'80px'"
        >
          <el-form-item label="分组名称" v-if="addType === 'group'">
            <datablau-input
              style="width: 100%"
              v-model="addGroupValue"
              placeholder="请输入分组名称"
              clearable
            ></datablau-input>
          </el-form-item>
          <el-form-item label="等级名称" v-if="addType !== 'group'">
            <datablau-input
              style="width: 100%"
              v-model="addStr"
              placeholder="请输入名称"
              clearable
            ></datablau-input>
          </el-form-item>
          <el-form-item label="等级描述" v-if="addType !== 'group'">
            <datablau-input
              style="width: 100%"
              type="textarea"
              v-model="addPro"
              placeholder="请输入描述"
              clearable
              resize="none"
            ></datablau-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="dialogVisible = false">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="important"
          @click="conEdi"
          :disabled="!canConfirm"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      title="新建数据等级"
      :visible.sync="showCreate"
      v-if="showCreate"
      size="s"
      append-to-body
    >
      <el-form
        :model="createform"
        ref="createForm"
        label-width="80px"
        class="edit-tag"
        @submit.native.prevent
      >
        <el-form-item
          label="等级名称"
          style="margin-bottom: 14px"
          prop="newName"
          :rules="{
            required: true,
            message: '请输入等级名称',
            trigger: 'blur',
          }"
        >
          <datablau-input
            style="width: 100%"
            v-model="createform.newName"
            placeholder="请输入等级名称"
            clearable
          ></datablau-input>
        </el-form-item>
        <el-form-item label="等级描述">
          <datablau-input
            style="width: 100%"
            type="textarea"
            v-model="createform.newDisc"
            placeholder="请输入等级描述"
            clearable
            resize="none"
          ></datablau-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <datablau-button type="secondary" @click="handleCancelNewLevel">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="important" @click="submitNewLevel">
          {{ $t('common.button.ok') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <choose-tag
      ref="chooseTag"
      :tagTree="tagsTreeData"
      :tagMap="tagMap"
      @choosedTagChanged="choosedTagChanged"
      :oldChoosedIds="editassociatedTags"
      :disabledSiblings="[editTag.tagId]"
      :disabledChildren="currentParentId"
    ></choose-tag>
    <choose-catalog
      ref="chooseTree"
      :chooseTreeData="catalogTree"
      :diaTitle="'移动到'"
      @chooseNode="moveCatalog"
    ></choose-catalog>
    <div class="tree-area">
      <div class="tree-box" style="overflow: auto">
        <div class="tree-title">
          <span>数据分级</span>
          <el-tooltip
            class="item"
            effect="dark"
            content="新建数据分级"
            placement="top"
          >
            <i class="iconfont icon-tianjia" @click="showCreate = true"></i>
          </el-tooltip>
        </div>
        <datablau-tree
          ref="tree"
          node-key="tagId"
          v-loading="isTreeLoading"
          :data="tagsTreeData"
          :props="defaultProps"
          :highlight-current="true"
          :filter-node-method="filterNode"
          :data-supervise="true"
          :data-icon-function="dataIconFunction"
          :data-options-function="dataOptionsFunction"
          :default-expanded-keys="defaultExpanded"
          :show-checkbox="hasAccess"
          :accordion="false"
          @check-change="handleCheckChange"
          @node-click="handleNodeClick"
          @node-expand="updateTreeBoxScrollbar(300)"
          @node-collapse="updateTreeBoxScrollbar(200)"
          draggable
          :allow-drag="allowDrag"
          :allow-drop="allowDrop"
          @node-drag-end="nodeDragEnd"
        >
          <!-- :check-strictly="true" -->
        </datablau-tree>
      </div>
    </div>
    <div class="tree-area-margin-right" @mousedown="handleDrag($event)"></div>
    <div class="content-area">
      <div class="details">
        <div class="head" v-if="details.name">
          <div class="page-title-row">
            <span class="menu font-medium">
              {{ details.parentName }}/{{ details.name }}
            </span>
          </div>
          <p
            style="
              display: block;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              line-height: 16px;
              margin-left: 20px;
            "
          >
            <span>描述: {{ details.description }}</span>
          </p>
        </div>
        <div class="table-container" ref="tableBox" v-if="showQuoteTable">
          <div style="padding: 10px 20px" class="list-search-content">
            <datablau-tabs v-model="type">
              <el-tab-pane label="数据表" name="80000004"></el-tab-pane>
              <el-tab-pane label="应用字段" name="80000005"></el-tab-pane>
              <el-tab-pane
                label="引用标准"
                name="80010066"
                v-if="$featureMap['FE_DOMAIN']"
              ></el-tab-pane>
              <el-tab-pane label="应用报表" name="82800002"></el-tab-pane>
              <el-tab-pane label="描述信息" name="89900000"></el-tab-pane>
            </datablau-tabs>
            <datablau-input
              v-if="type !== '89900000'"
              :iconfont-state="true"
              clearable
              style="vertical-align: top"
              placeholder="请输入搜索词"
              v-model="searchQuery"
            ></datablau-input>
          </div>
          <template v-if="type === '89900000'">
            <div class="level-markdown">
              <datablau-form-submit>
                <mavon-editor
                  style="height: 300px; min-width: 800px"
                  :toolbars="toolbars"
                  v-model="curDescription"
                  :placeholder="$t('meta.DS.tableDetail.startEdit')"
                />
                <template slot="buttons">
                  <!-- <datablau-button>取消</datablau-button> -->
                  <datablau-button type="important" @click="saveDes">
                    保存
                  </datablau-button>
                </template>
              </datablau-form-submit>
            </div>
          </template>
          <template v-else>
            <div class="table-box">
              <datablau-tab-with-table
                v-loading="tableLoading"
                class="tag-link-table"
                ref="columnsTable"
                :isDatablau="true"
                :isCheckbox="true"
                :hideTopLine="true"
                :totalShow="totalShow"
                :columnDefs="columnDefs"
                :getShowData="getShowData"
                :hideBottomLine="false"
                :tableOption="tableOption"
                @datablauSelectionChanged="datablauSelectionChanged"
              >
                <div class="" style="margin-left: 20px" slot="footer">
                  <span style="margin-right: 10px" v-if="selection.length > 0">
                    当前选中“{{ selection.length }}条”信息，是否
                  </span>
                  <datablau-button
                    v-if="selection.length > 0"
                    type="important"
                    class="green-btn tab-button"
                    @click="handleRemoveTagQuote"
                  >
                    取消引用
                  </datablau-button>
                </div>
              </datablau-tab-with-table>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import chooseCatalog from '@/view/dataStandardTagManage/chooseCatalog.vue'
import multipleTagRule from '@/view/dataStandardTagManage/multipleTagRule.vue'
import chooseTag from '@/components/dataSource/chooseTag.vue'
import tagPackage from '@/view/dataStandardTagManage/tagPackage.vue'
import agTableComponent from '@/components/common/agTableComponent'
import SmartRule from '@/view/dataStandardTagManage/smartRule/smartRule.vue'
import LDMTypes from '@constant/LDMTypes'
import HTTP from '@/http/main.js'

export default {
  components: {
    chooseCatalog,
    //    tagRule,
    multipleTagRule,
    chooseTag,
    tagPackage,
    agTableComponent,
    SmartRule,
  },
  data() {
    const baseUrl = this.$url + '/service/entities/'
    return {
      userMap: {},
      relatedCatalogs: null,
      options: null,
      defaultCatalogsProps: {
        value: 'id',
        label: 'name',
        children: 'children',
      },
      tagsTreeData: [],
      hasAccess: false,
      defaultTag: '',
      baseUrl: baseUrl,
      /* dialog */
      editTitle: '',
      isEdit: false,
      addType: '',
      addStr: '',
      addPro: '',
      addTagGroup: '',
      editColor: '',
      editBackgroundColor: '',
      editassociatedTags: [],
      dialogVisible: false,
      showAddCatlog: false,
      /* tree */
      keyword: '',
      tagMap: {},
      nameMap: {},
      valSucces: true,
      tagRuleSetSet: new Set(),
      treeData: [],
      treeBox: '',
      defaultProps: {
        label: 'name',
        id: 'tagId',
      },
      checkedListLength: 0,
      currentTreeNode: '',
      checkedList: [],
      defaultExpanded: [],
      isTreeLoading: true,
      /* right part */
      currentTab: 'details',
      /* tag detail */
      details: {
        // 右侧显示的内容
        name: '',
        parentId: null,
        parentName: null,
        properties: null,
        tagId: undefined,
      },
      tableData: [],
      tableHeight: undefined,
      tableHeightReseted: false,
      quoTables: undefined,
      quoColumns: undefined,
      showQuoteTable: false, // 判断是否是目录
      showTable: true,
      showClo: true,
      disableCommitButton: true,
      selection: [],
      // table new
      gridOptions: null,
      columnDefs: null,
      gridApi: null,
      columnApi: null,
      tableLoading: false,
      // table new 2
      totalShow: 0,
      tableOption: {},
      defaultParaData: {},

      /** options */
      optionShowFolder: true,
      optionShowFolderGroup: true,
      showOptionPop: false,
      dialogVisibleMove: false,
      editTag: {}, // 被编辑的标签
      catalogTree: [],
      /* drag */
      drag: {
        start: 0,
        startTime: 0,
        startWidth: 0,
        mousedown: false,
        end: 0,
        offset: 0,
        windowOffset: 0,
      },
      rules: {
        addStr: [
          {
            required: true,
            validator: this.testDupname,
            trigger: 'change',
          },
        ],
        addGroupValue: [
          { required: true, message: '请输入分组名称', trigger: 'blur' },
        ],
      },
      currentParentId: [],
      tagGroupList: [],
      addGroupValue: '',
      searchQuery: '',
      type: '80000004',

      showCreate: false,
      createform: {
        newName: '',
        newDisc: '',
      },
      curTagMap: {},
      curLevel: '',
      toolbars: {
        bold: true, // 粗体
        italic: true, // 斜体
        header: true, // 标题
        underline: true, // 下划线
        strikethrough: true, // 中划线
        mark: true, // 标记
        superscript: true, // 上角标
        subscript: true, // 下角标
        quote: true, // 引用
        ol: true, // 有序列表
        ul: true, // 无序列表
        link: true, // 链接
        imagelink: false, // 图片链接
        code: true, // code
        table: true, // 表格
        fullscreen: false, // 全屏编辑
        readmodel: true, // 沉浸式阅读
        htmlcode: true, // 展示html源码
        help: false, // 帮助
        /* 1.3.5 */
        undo: true, // 上一步
        redo: true, // 下一步
        trash: true, // 清空
        save: false, // 保存（触发events中的save事件）
        /* 1.4.2 */
        navigation: true, // 导航目录
        /* 2.1.8 */
        alignleft: true, // 左对齐
        aligncenter: true, // 居中
        alignright: true, // 右对齐
        /* 2.2.1 */
        subfield: true, // 单双栏模式
        preview: true, // 预览
      },
      curDescription: '',
      isDes: false,
    }
  },
  computed: {
    enableBtn() {
      return this.checkedListLength > 0
    },
    canConfirm() {
      return (
        (this.addStr && this.addStr.length > 0 && this.valSucces) ||
        this.addGroupValue
      )
    },
  },
  beforeMount() {
    // this.hasAccess = this.$auth['ROLE_DATA_CATALOG_ADMIN']
    const gridOptions = {}
    const columnDefs = [
      {
        headerName: '',
        field: 'icon',
        isIcon: true,
        tooltipField: 'icon',
      },
      {
        headerName: '资产名称',
        field: 'name',
        tooltipField: 'name',
      },
      {
        headerName: '业务系统',
        field: 'modelCategoryId',
        tooltipField: 'modelCategoryId',
      },
      {
        headerName: '数据管家',
        field: 'dataManagers',
        tooltipField: 'dataManagers',
      },
      {
        headerName: '创建时间',
        field: 'creationTime',
        tooltipField: 'creationTime',
      },
      {
        headerName: '安全等级',
        field: 'level',
        tooltipField: 'level',
      },
    ]
    this.columnDefs = columnDefs
    this.gridOptions = gridOptions
  },
  inject: ['reload'],
  mounted() {
    if (this.$route.query && this.$route.query.tagId) {
      this.defaultTag = this.$route.query.tagId
    }
    this.getTagsRuleSet(() => {
      this.getTags(this.initTagData)
    })
    this.treeBox = $('.tree-box')[0]
    $(window).resize(this.handleResize)
    this.handleResize()
    this.getTagGroupList()
  },
  beforeDestroy() {
    $(window).unbind('resize', this.handleResize)
    $(document).unbind('mouseup', this.handleDragEnd)
  },
  methods: {
    getUser(val) {
      return new Promise(resolve => {
        const usernames = [val]
        this.$http
          .post(
            `/user/usermanagement/user/getUsersByUsernames`,
            _.uniq(usernames)
          )
          .then(res => {
            resolve(res.data[0].firstName)
          })
      })
    },
    async getName(val) {
      const result = await this.getUser(val)
      console.log(result)
      return result
    },
    allowDrag(node) {
      return node.id
    },
    allowDrop(draggingNode, dropNode, type) {
      const allow =
        draggingNode.parent &&
        dropNode.parent &&
        draggingNode.parent.id === dropNode.parent.id &&
        type !== 'inner'
      return allow
    },
    nodeDragEnd(draggingNode, dropNode, type, event) {
      if (dropNode.level === 1) {
        dropNode.parent.childNodes.forEach((item, index) => {
          this.$http.put(
            this.$url + `/service/tags/group/${item.data.id}/reorder/${index}`
          )
        })
      } else {
        dropNode.parent.childNodes.forEach((item, index) => {
          this.$http.put(
            this.$url +
              `/service/tags/category/${item.data.tagId}/reorder/${index}`
          )
          // this.$http.put(this.$url + `/service/catalogs/${item.data.id}/reorder/${index}`)
        })
      }
    },
    testDupname(rule, value, callback) {
      this.valSucces = false
      value = _.trim(this.addStr)
      const nameStr = value + ''
      const name2low = value && nameStr.toLowerCase ? nameStr.toLowerCase() : ''
      if (!value) {
        callback(new Error('名称必须填写'))
      } else if (this.nameMap[name2low] && !this.isEdit) {
        const errMsg = `已存在名称为${this.nameMap[name2low].name}的${
          this.nameMap[name2low].category ? '目录' : '标签'
        }`
        callback(new Error(errMsg))
      } else {
        callback()
        this.valSucces = true
      }
    },
    getTagsRuleSet(callback) {
      this.$http
        .get(this.$url + '/service/ruletag/')
        .then(res => {
          this.tagRuleSetSet = new Set(res.data)
          callback()
        })
        .catch(e => {
          callback()
        })
    },
    /** 响应事件 */
    // window resize handdle
    handleResize() {
      this.resetTableHeight()
      this.updateTreeBoxScrollbar()
    },
    handleCheckChange(data, checked, indeterminate) {
      this.checkedList = this.$refs.tree.getCheckedNodes()
      this.checkedListLength = this.checkedList.length
    },
    deleteSingleTag() {
      if (this.editTag.group) {
        this.$DatablauCofirm('确定要删除？', '提示', {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        })
          .then(res => {
            this.$http
              .delete(this.$url + '/service/tags/group/' + this.editTag.id)
              .then(res => {
                this.getTags()
              })
              .catch(e => this.$showFailure(e))
          })
          .catch(e => {
            console.log(e)
          })
      } else {
        const tag = this.editTag
        this.$DatablauCofirm('确定要删除？', '提示', {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        })
          .then(res => {
            this.$http
              .delete(this.$url + '/service/tags/' + tag.tagId)
              .then(res => {
                this.getTags()
              })
              .catch(e => this.$showFailure(e))
          })
          .catch(e => {
            console.log(e)
          })
      }
    },
    deleteTags() {
      this.$DatablauCofirm('确定要删除？', '提示', {
        type: 'warning',
        cancelButtonText: this.$t('common.button.cancel'),
        confirmButtonText: this.$t('common.button.ok'),
      })
        .then(() => {
          this.isTreeLoading = true
          const map = {}
          const tree = { childrenDel: [], tagId: null }
          this.checkedList.forEach(item => {
            map[item.tagId] = item
          })
          this.checkedList.forEach(item => {
            if (item.parentId && map[item.parentId]) {
              const parent = map[item.parentId]
              if (!parent.childrenDel) {
                parent.childrenDel = []
              }
              parent.childrenDel.push(item)
            } else {
              tree.childrenDel.push(item)
            }
          })
          this.removeTreeCode(tree, map, tree, ifFailure => {
            this.getTags()
            !ifFailure && this.$message.success('删除成功')
          })
        })
        .catch(e => {})
    },
    addClass() {
      this.isEdit = false
      this.addStr = ''
      this.addTagGroup = ''
      this.addPro = ''
      this.editassociatedTags = []
      this.editTitle = '创建标签分类：'
      this.addType = 'class'
      this.editColor = ''
      this.editBackgroundColor = ''
      this.dialogVisible = true
    },
    addClassGroup() {
      this.addType = 'group'
      this.addGroupValue = ''
      this.editTitle = '创建分组：'
      this.dialogVisible = true
    },
    addTag() {
      this.currentParentId = [this.editTag.tagId]
      this.relatedCatalogs = this.findCatalogIds(this.editTag.catalogId) || []
      this.isEdit = false
      this.editTitle = '在分类 ' + this.editTag.name + ' 内创建标签：'
      this.addType = 'tag'
      this.addStr = ''
      this.addTagGroup = ''
      this.addPro = ''
      this.editassociatedTags = []
      this.editColor = ''
      this.editBackgroundColor = ''
      this.dialogVisible = true
    },
    handleEditTag() {
      this.isEdit = true
      if (this.editTag.group) {
        this.addType = 'group'
        this.addGroupValue = this.editTag.name
      } else {
        this.addType = this.editTag.category ? 'class' : 'tag'
      }
      this.editTitle = '编辑'
      this.addStr = this.editTag.name
      this.addTagGroup = this.editTag.tagGroup
      this.addPro = this.editTag.description
      this.relatedCatalogs = this.findCatalogIds(this.editTag.catalogId) || []
      this.editassociatedTags = this.editTag.associatedTags || []
      this.editColor = this.editTag.color ? this.editTag.color : ''
      this.editBackgroundColor = this.editTag['background-color']
        ? this.editTag['background-color']
        : ''
      this.dialogVisible = true
    },
    handleDeleteLevel() {
      this.$DatablauCofirm(`确认删除安全等级 ${this.editTag.name}?`, '提示', {
        confirmButtonText: this.$t('common.button.ok'),
        cancelButtonText: this.$t('common.button.cancel'),
        type: 'warning',
      }).then(() => {
        this.deleteDataLevel(this.editTag.tagId)
      })
    },
    findCatalogIds(id) {
      const catalogsMap = new Map()
      const forEach = array => {
        array.forEach(item => {
          catalogsMap.set(item.id, item)
          if (item.children) {
            forEach(item.children)
          }
        })
      }
      forEach(this.options)
      const returnArray = []
      let currentId = id
      do {
        returnArray.push(currentId)
        if (catalogsMap.get(currentId)) {
          currentId = catalogsMap.get(currentId).parentId
        } else {
          currentId = null
        }
      } while (currentId)
      return returnArray.reverse()
    },
    saveDes() {
      this.isDes = true
      let properties = {
        description: '',
      }
      if (typeof this.curTagMap.properties === 'string') {
        properties = JSON.parse(this.curTagMap.properties)
      } else {
        properties = this.curTagMap.properties
      }
      properties.description = this.curDescription
      this.curTagMap.properties = JSON.stringify(properties)

      this.editTag = {}
      this.initTag(this.editTag, this.curTagMap)
      const url = this.$url + '/service/accessLevel/update'
      const successHandle = () => {
        this.dialogVisible = false
        this.$message.success('描述信息保存成功')
        // 更新标签
        this.updateTags()
      }
      this.updataTag(url, this.curTagMap, successHandle, true)
    },
    conEdi() {
      this.isDes = false
      let url = ''
      let data = {}
      let isEditTag = false
      const propertiesObj = {
        description: this.addPro,
      }
      propertiesObj.buildInCode = this.editTag.builtInCode
      if (this.editColor) {
        propertiesObj['css:color'] = this.editColor
      }
      if (this.editBackgroundColor) {
        propertiesObj['css:background-color'] = this.editBackgroundColor
      }
      const properties = JSON.stringify(propertiesObj)
      if (this.isEdit) {
        if (this.addType === 'group') {
          const requestBody = {
            name: this.addGroupValue,
            id: this.editTag.id,
          }
          this.$http
            .post(this.$url + '/service/tags/group', requestBody)
            .then(res => {
              this.getTagGroupList()
              this.getTags()
              this.dialogVisible = false
              const msg = '分组'
              this.$message.success('编辑' + msg + '成功')
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          url = this.$url + '/service/accessLevel/update'
          isEditTag = true
          data = this.editTag
          delete data.description
          data.name = this.addStr
          data.associatedTags = this.editassociatedTags
          data.catalogId = this.relatedCatalogs[this.relatedCatalogs.length - 1]
          data.properties = properties
          data.tagGroup = this.addTagGroup
          const successHandle = () => {
            this.dialogVisible = false
            const msg = this.addType === 'class' ? '目录' : '标签'
            this.$message.success('编辑' + msg + '成功')
            // 更新标签
            this.updateTags()
          }
          this.updataTag(url, data, successHandle, isEditTag)
        }
      } else {
        if (this.addType === 'group') {
          const requestBody = {
            name: this.addGroupValue,
          }
          this.$http
            .post(this.$url + '/service/tags/group', requestBody)
            .then(res => {
              this.getTagGroupList()
              this.getTags()
              this.dialogVisible = false
            })
            .catch(e => {
              this.$showFailure(e)
            })
        } else {
          if (this.addType === 'class') {
            url = this.$url + '/service/tags/category'
            let tagGroupId = null
            if (this.editTag.category) {
              tagGroupId = this.editTag.tagGroupId
            } else {
              tagGroupId = this.editTag.id
            }
            data = {
              name: this.addStr,
              properties: properties,
              tagGroupId: tagGroupId,
            }
          } else {
            url = this.$url + '/service/tags/'
            data = {
              name: this.addStr,
              parentId: this.editTag.parentId
                ? this.editTag.parentId
                : this.editTag.tagId,
              properties: properties,
              catalogId: this.relatedCatalogs[this.relatedCatalogs.length - 1],
              tagGroup: this.addTagGroup,
            }
          }
          this.$http
            .post(url, data)
            .then(res => {
              const msg = this.addType === 'class' ? '目录' : '标签'
              this.$message.success('创建' + msg + '成功')
              this.getTags()
              this.dialogVisible = false
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      }
    },
    getDescription(properties) {
      let propertiesObj = {
        description: '',
      }
      if (typeof properties === 'string') {
        propertiesObj = JSON.parse(properties)
      } else {
        propertiesObj = properties
      }
      this.curDescription = propertiesObj.description
    },
    handleNodeClick(tag, node, tree) {
      this.curTagMap = tag
      this.curLevel = tag.name
      this.getDescription(tag.properties)
      this.showOptionPop = false
      this.showAddCatlog = false
      if (!tag.category) {
        this.details = {}
        this.showQuoteTable = false
        this.initTag(this.details, tag)
        this.showQuoteTable = true
        // this.getTagDetails();
      }
      if (!tag.category) {
        this.$router.replace({
          name: 'dataLevel',
          query: {
            tagId: tag.tagId,
          },
        })
      }
      this.$refs.columnsTable && this.$refs.columnsTable.refreshData()
      this.selection = [] // 切换树时，选择清空
    },
    handleMoveTag() {
      this.$refs.chooseTree && this.$refs.chooseTree.showDialog()
    },
    handleChooseRelTag() {
      this.$refs.chooseTag.reInit()
      this.$refs.chooseTag.showDialog()
    },
    choosedTagChanged(tagIds) {
      this.editassociatedTags = tagIds
    },
    handleSkipTo(scope, type) {
      const obj = {
        modleId: scope.row.modleId,
        keyword: '',
        type: 'table',
      }
      switch (type) {
        case 'modle':
          obj.modle = scope.row.tableObjectId
          return
        case 'table':
          obj.table = scope.row.tableObjectId
          break
        case 'column':
          obj.column = scope.row.columnObjectId
          break
      }
      this.$router.push({
        name: 'meta',
        query: obj,
      })
    },
    handleTableSelectionChange(val) {
      this.selection = val
    },
    handleRemoveTagQuote() {
      const arr = [...this.selection]
      const deletNext = () => {
        if (arr.length > 1) {
          arr.pop()
          this.deleteTagQuo(arr[arr.length - 1], deletNext)
          // this.getTagDetails();
        } else {
          this.$message.success('移除标签成功')
          this.getTagDetails()
          this.$refs.columnsTable.getPageData()
        }
      }
      this.$DatablauCofirm(
        `选中“${this.selection.length}条”，是否确认取消引用`,
        '提示',
        {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        }
      )
        .then(res => {
          this.tableLoading = true
          this.deleteTagQuo(arr[arr.length - 1], deletNext)
        })
        .catch(e => {
          console.log(e)
        })
    },
    // new table
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi
      this.initAgGrid()
    },
    initAgGrid() {
      // this.$refs.columnsTable.sizeColumnsToFit()
    },
    cellClicked(eventData) {
      const a = eventData
      if (eventData.column.colId === 'tableName' && eventData.value) {
        this.handleSkipTo(
          {
            row: eventData.data,
          },
          'table'
        )
      } else if (eventData.column.colId === 'columnName' && eventData.value) {
        this.handleSkipTo(
          {
            row: eventData.data,
          },
          'column'
        )
      }
    },
    datablauSelectionChanged(para) {
      if (para.api) {
        const api = para.api
        const selection = api.getSelectedRows()
        this.selection = selection
      } else {
        this.selection = para
      }
    },
    getShowData(para) {
      return new Promise((resolve, reject) => {
        this.tableLoading = true
        const p = para.currentPage
        const s = para.pageSize
        if (this.details.tagId) {
          this.$http
            .post(`${this.$url}/service/tags/usages/page`, {
              name: this.searchQuery,
              typeId: this.type,
              tagId: this.details.tagId,
              currentPage: p,
              pageSize: s,
            })
            .then(res => {
              this.tableLoading = false
              const data = res.data
              this.totalShow = data.totalItems
              const arr = []
              if (data.content && Array.isArray(data.content)) {
                data.content.forEach(item => {
                  let obj = {}
                  const typeId = item.typeId
                  item = item.object
                  if (this.$commentPreCode.Domain == typeId) {
                    // 信息项 标准
                    obj = {
                      name:
                        item.englishName +
                        (item.chineseName ? '(' + item.chineseName + ')' : ''),
                      logicalName: item.chineseName, // 中文名字
                      tableName: item.englishName, // 英文名字
                      description: item.description, // 描述
                      descriptionDepartmentName: item.descriptionDepartmentName, // 业务定义部门
                      firstPublish: this.$timeFormatter(item.firstPublish), // 首次发布时间
                      level: this.curLevel,
                      type: '数据标准',
                      dataType: 'domain',
                      id: item.domainId,
                    }
                  } else if (this.$commentPreCode.Service == typeId) {
                    // 数据服务
                    const type =
                      this.$citicDataService.type[item.serviceType] || {}
                    obj = {
                      name: item.name,
                      logicalName: item.logicalName, // 中文名字
                      tableName: item.tableName, // 英文名字
                      description: item.description, // 描述
                      level: this.curLevel,
                      type: '数据服务',
                      dataType: 'function',
                      id: item.dataServiceId,
                    }
                  } else if (this.$commentPreCode.Entity == typeId) {
                    // 表
                    obj = {
                      name:
                        item.tableName +
                        (item.logicalName ? '(' + item.logicalName + ')' : ''),
                      logicalName: item.logicalName, // 中文名字
                      tableName: item.tableName, // 英文名字
                      description: item.description, // 描述
                      modelCategoryId: this.getSystem(item.modelCategoryId), // 业务系统
                      creationTime: this.$timeFormatter(item.creationTime), // 创建时间
                      level: this.curLevel,
                      dataManagers: this.dealdataManagers(item.dataManagers), // 数据管家
                      type: '表',
                      dataType: 'table',
                      id: item.tableObjectId,
                    }
                  } else if (this.$commentPreCode.Attribute == typeId) {
                    // 字段
                    obj = {
                      name:
                        item.columnName +
                        (item.logicalName ? '(' + item.logicalName + ')' : ''),
                      logicalName: item.logicalName, // 中文名字
                      tableName: item.tableName, // 所在表名
                      description: item.description, // 描述
                      level: this.curLevel,
                      domains: item.domains, // 数据标准（可能为数组，需要处理）
                      domainCode: item.domainCode, // 标准代码
                      type: '字段',
                      dataType: 'column',
                      id: item.columnObjectId,
                    }
                  } else if (this.$commentPreCode.Function == typeId) {
                    // 函数
                    obj = {
                      name: item.columnName,
                      logicalName: item.logicalName, // 中文名字
                      tableName: item.tableName, // 英文名字
                      description: item.description, // 描述
                      level: this.curLevel,
                      type: '函数',
                      dataType: 'function',
                      id: item.columnObjectId,
                    }
                  } else if (this.$commentPreCode.StoredProcedure == typeId) {
                    // 存储过程
                    obj = {
                      name: item.columnName,
                      logicalName: item.logicalName, // 中文名字
                      tableName: item.tableName, // 英文名字
                      description: item.description, // 描述
                      level: this.curLevel,
                      type: '存储过程',
                      dataType: 'storedProcedure',
                      id: item.columnObjectId,
                    }
                  } else if (this.$commentPreCode.View == typeId) {
                    // 视图
                    obj = {
                      name:
                        item.columnName +
                        (item.logicalName ? '(' + item.logicalName + ')' : ''),
                      logicalName: item.logicalName, // 中文名字
                      tableName: item.tableName, // 英文名字
                      description: item.description, // 描述
                      modelCategoryId: this.getSystem(item.modelCategoryId), // 业务系统
                      level: this.curLevel,
                      dataManagers: this.dealdataManagers(item.dataManagers), // 数据管家
                      creationTime: this.$timeFormatter(item.creationTime), // 创建时间
                      type: '视图',
                      dataType: 'view',
                      id: item.columnObjectId,
                    }
                  } else if (this.$commentPreCode.ShareFile == typeId) {
                    // 非结构化数据/文件类数据
                    obj = {
                      name: item.name,
                      logicalName: item.logicalName, // 中文名字
                      tableName: item.tableName, // 英文名字
                      description: item.description, // 描述
                      level: this.curLevel,
                      type: '文件类资产',
                      dataType: 'file',
                      id: item.id,
                    }
                  } else if (this.$commentPreCode.Schema === String(typeId)) {
                    obj = {
                      name: item.columnName,
                      logicalName: item.logicalName, // 中文名字
                      tableName: item.tableName, // 英文名字
                      description: item.description, // 描述
                      level: this.curLevel,
                      type: 'Schema',
                      dataType: 'schema',
                      id: item.columnObjectId,
                    }
                  } else if (LDMTypes.Report == typeId) {
                    // this.getName(item.owner).then(res => {
                    //   console.log(res)
                    // })
                    obj = {
                      name: item.name, // 报表名称
                      logicalName: item.name, // 中文名字
                      description: item.description, // 描述
                      level: this.curLevel,
                      code: item.code, // 报表编号
                      createTime: this.$timeFormatter(item.createTime), // 创建时间
                      owner: item.owner, // 负责人
                      type: 'Report',
                      dataType: 'report',
                      id: item.id,
                    }
                  } else {
                    const type = typeMap[typeId]
                    obj = {
                      name: item.columnName,
                      logicalName: item.logicalName, // 中文名字
                      tableName: item.tableName, // 英文名字
                      description: item.description, // 描述
                      level: this.curLevel,
                      type,
                      id: item.columnObjectId,
                    }
                  }
                  // obj.id && arr.push(obj);
                  if (obj.id) {
                    obj.typeId = typeId
                    obj.itemId = `${typeId}/${item.id}`
                    arr.push(obj)
                  }
                })
              }
              resolve(arr)
            })
            .catch(e => {
              this.tableLoading = false
              this.$showFailure(e)
              resolve([])
            })
        }
      })
    },
    getSystem(val) {
      if (val) {
        return this.$modelCategoriesDetailsMap[val]
          ? this.$modelCategoriesDetailsMap[val].displayName
          : '--'
      } else {
        return '--'
      }
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
        return '--'
      }
    },
    /* 拖拽 */
    handleDrag(e) {
      this.drag.start = e.clientX
      this.drag.mousedown = true
      this.drag.startWidth = parseInt($('.tagPage .tree-area').css('width'))
      $(document).bind('mouseup', this.handleDragEnd)
    },
    onDrag(e) {
      if (this.drag.mousedown) {
        this.drag.offset = e.clientX - this.drag.start
        const w = this.drag.startWidth + this.drag.offset
        this.resetColStyle(w)
        this.dragHandler()
      }
    },
    handleDragEnd() {
      this.drag.mousedown = false
    },
    dragHandler() {
      // this.$refs.columnsTable.sizeColumnsToFit()
    },
    resetColStyle(x) {
      if (x < 280 || x > 800) {
        return
      }
      $('.tagPage .tree-area').css({
        width: x,
      })
      $('.tagPage .tree-area-margin-right').css({
        left: x - 2,
      })
      $('.tagPage .content-area').css({
        left: x,
      })
    },

    /** set view, 处理与直接显示的数据,函数 */
    filterNode(value, data, node) {
      if (!value) return true
      let current = node
      do {
        if (this.$MatchKeyword(current.data, value, 'name')) {
          return true
        }
        current = current.parent
      } while (current && current.data.name)
      return false
    },
    getTagDetails() {
      if (this.$refs.columnsTable && this.$refs.columnsTable.setCurrentPara) {
        this.$refs.columnsTable.setCurrentPara({
          currentPage: 1,
          pageSize: 20,
        })
      }
      const params = {
        currentPage: 1,
        pageSize: 20,
      }
      // this.getShowData(params)
    },
    updateTreeBoxScrollbar(time) {
      if (!this.treeBox) return
      const self = this
      /* setTimeout(function () {
          Ps.update(self.treeBox);
        }, time ? time : 800); */
    },
    dataIconFunction(data, node) {
      if (data.group) {
        if (node.expanded) {
          return 'iconfont icon-openfile'
        } else {
          return 'iconfont icon-file'
        }
      } else if (data.category) {
        return 'tree-icon tagGroup'
      } else if (this.tagRuleSetSet.has(data.tagId)) {
        return 'tree-icon tag in-use rule-set'
      } else {
        return 'iconfont icon-biaoqian'
      }
    },
    dataOptionsFunction(data) {
      const options = []
      let label = ''
      if (data.name) {
        label =
          data.name.length < 10 ? data.name : data.name.slice(0, 8) + '...'
      }
      if (this.$auth.MAIN_DATA_AUTH_TAG) {
        options.push({
          icon: 'el-icon-edit',
          label: '编辑',
          callback: () => {
            this.editTag = {}
            this.initTag(this.editTag, data)
            this.defaultExpanded = [data.tagId]
            this.handleEditTag()
          },
          args: 'folder',
        })
        options.push({
          icon: 'el-icon-delete',
          label: '删除',
          disabled: !data.showDelete,
          tooltip: true,
          text: '只能从尾部删除',
          callback: () => {
            this.editTag = data
            this.handleDeleteLevel()
          },
          args: 'folder',
        })
      }
      return options
    },
    renderContent(h, { node, data, store }) {
      const getIcons = () => {
        if (data.group) {
          return [
            h('span', { class: 'icon-i-folder' }, [
              h('span', { class: 'path1' }),
              h('span', { class: 'path2' }),
            ]),
          ]
        } else if (data.category) {
          return [
            h('i', { attrs: { class: 'tree-icon tagGroup' } }),
            // h('span', {class: 'icon-i-folder icon-i-folder2'}, [
            //   // h('span', {class: 'path1'}),
            //   // h('span', {class: 'path2'}),
            //   h('span', {class: 'pathImg'}),
            // ])
          ]
        } else if (this.tagRuleSetSet.has(data.tagId)) {
          return [h('i', { attrs: { class: 'tree-icon tag in-use rule-set' } })]
        } else {
          return [h('i', { attrs: { class: 'tree-icon tag' } })]
        }
      }

      const getMoreBtn = () => {
        if (
          (this.hasAccess && this.$auth.TAGES_VIEW_ADD) ||
          this.$auth.TAGES_VIEW_MODIFY ||
          this.$auth.TAGES_VIEW_DELETE
        ) {
          return h(
            'span',
            {
              on: {
                click: evt => {
                  evt.stopPropagation()
                  evt.preventDefault()
                  this.editTag = {}
                  this.initTag(this.editTag, data)
                  this.showEditPop(evt, node)
                  this.defaultExpanded = [data.tagId]
                },
              },
              // class: 'float-right-hover',
            },
            [
              h('span', {
                class: 'more el-icon-more',
                style: 'position:relative;',
              }),
            ]
          )
        } else {
          return null
        }
      }
      return h(
        'span',
        {
          class: 'tree-item-outer',
        },
        [
          getIcons(),
          h(
            'span',
            {
              attrs: {
                class: 'oneline-eclipse tree-label',
              },
            },
            [data.name]
          ),
          getMoreBtn(),
        ]
      )
    },
    moveCatalog(tag) {
      const url = this.$url + '/service/tags/' + this.editTag.tagId
      this.editTag.parentId = tag.id
      this.editTag.parentName = tag.label
      this.editTag.properties = JSON.stringify({
        description: this.editTag.description,
      })
      delete this.editTag.description
      const successed = () => {
        this.$refs.chooseTree && this.$refs.chooseTree.close()
      }
      const obj = _.cloneDeep(this.editTag)
      this.updataTag(url, obj, successed)
    },
    setPageDefault(tag) {
      this.showOptionPop = false
      this.showAddCatlog = false
      this.details = {}
      this.showQuoteTable = false
      this.initTag(this.details, tag)
      if (!tag.category) {
        this.showQuoteTable = true
        this.getTagDetails()
      }
    },
    resetTableHeight() {
      if ($('.table-box')[0]) {
        this.tableHeight = $('.table-box')[0].offsetHeight
      }
    },
    // deal with data
    // 获得所有标签
    initTagData() {
      let tag = {}
      if (this.defaultTag && this.tagMap[this.defaultTag]) {
        tag = this.tagMap[this.defaultTag]
        this.setPageDefault(tag)
        this.defaultExpanded = [tag.tagId]
      } else if (
        this.tagsTreeData &&
        this.tagsTreeData[0] &&
        this.tagsTreeData[0].children &&
        this.tagsTreeData[0].children.length > 0
      ) {
        try {
          tag = this.tagsTreeData[0].children[0]
          this.defaultExpanded.push(tag.tagId)
          // this.handleNodeClick(tag)
          this.$nextTick(() => {
            $('.el-tree > .el-tree-node .el-tree-node:first-child').click()
          })
        } catch (e) {}
      } else if (this.tagsTreeData && this.tagsTreeData[0]) {
        tag = this.tagsTreeData[0]
        // this.handleNodeClick(tag)
        this.$nextTick(() => {
          $('.el-tree > .el-tree-node:first-child').click()
        })
      }
      this.tagsTreeData.map(item => {
        if (item.tagId === this.defaultExpanded[0]) {
          this.getDescription(item.properties)
          this.curTagMap = item
          this.curLevel = item.name
        }
      })
    },
    // delete single tag
    deleteTag(tag, map, tree, callback) {
      if (!tag.tagId) {
        callback && callback()
        return
      }
      this.$http
        .delete(this.$url + '/service/tags/' + tag.tagId)
        .then(res => {
          // if (map[tag.parentId] && map[tag.parentId].childrenDel && map[tag.parentId].childrenDel > 0) {
          if (map[tag.parentId] && map[tag.parentId].childrenDel) {
            map[tag.parentId].childrenDel.length--
          } else {
            tree.childrenDel.length--
          }
          this.removeTreeCode(tree, map, tree, callback)
        })
        .catch(e => {
          this.$showFailure(e)
          callback && callback(true)
        })
    },
    getTagGroupList() {
      this.$http
        .get(this.$url + '/service/tags/group')
        .then(res => {
          res.data.sort((a, b) => {
            if (typeof a.order === 'number' && typeof b.order === 'number') {
              return a.order - b.order
            }
            if (!a.order) {
              return 1
            }
            if (!b.order) {
              return -1
            }
          })
          this.tagGroupList = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getTags(callback) {
      this.$getCatAndTags(
        () => {
          this.options = this.$globalData.catalogs.children
          const res = {}
          res.data = this.$globalData.securityTagsRawData
          this.isTreeLoading = false
          const treeData = []
          if (res.data && Array.isArray(res.data)) {
            this.catalogTree = []
            const map = {}
            const nameMap = {}
            res.data.forEach(item => {
              map[item.tagId] = item
              const name2low = item.name.toLowerCase()
              if (!nameMap[name2low]) {
                nameMap[name2low] = item
              }
            })
            res.data.forEach(item => {
              if (item.parentId) {
                var parent = map[item.parentId]
                if (!parent.children) {
                  parent.children = []
                }
                parent.children.push(item)
              } else {
                treeData.push(item)
                const tagNode = {
                  id: item.tagId,
                  label: item.name,
                  type: 'folder',
                }
                this.catalogTree.push(tagNode)
              }
            })
            this.tagMap = map
            this.nameMap = nameMap
            // this.$utils.sort.sortConsiderChineseNumber(treeData);
            // this.$utils.sort.sortConsiderChineseNumber(this.catalogTree, 'label');
            // treeData.forEach(item => {
            //   if (item.children) {
            //     this.$utils.sort.sortConsiderChineseNumber(item.children);
            //   }
            // });
            for (const li in this.tagGroupList) {
              this.tagGroupList[li].group = true
              const tagGroupListChildren = []
              for (const key in treeData) {
                if (treeData[key].tagGroupId === this.tagGroupList[li].id) {
                  tagGroupListChildren.push(treeData[key])
                  this.$set(
                    this.tagGroupList[li],
                    'children',
                    tagGroupListChildren
                  )
                }
              }
            }
            // 去重
            const hasId = new Set()
            let newArr
            newArr = this.nameMap['数据安全等级'].children.filter(item => {
              if (hasId.has(item.tagId)) {
                return false
              } else {
                hasId.add(item.tagId)
                return true
              }
            })
            newArr.sort((a, b) => {
              return parseInt(a.tagId) - parseInt(b.tagId)
            })
            newArr.forEach((v, i) => {
              if (i !== newArr.length - 1) {
                // 只有最后一个展示删除按钮
                v.showDelete = false
              } else {
                v.showDelete = true
              }
            })
            this.tagsTreeData = newArr
            this.getDescription(this.tagsTreeData[0].properties)
            this.curLevel = this.tagsTreeData[0].name
            this.curTagMap = this.tagsTreeData[0]

            // this.$utils.sort.sortConsiderChineseNumber(this.tagsTreeData, 'name')
            if (this.$route && this.$route.query && this.$route.query.tagId) {
              const currentTreeNode = this.$route.query.tagId
              this.$nextTick(() => {
                if (this.$refs.tree) {
                  this.$refs.tree.setCurrentKey(currentTreeNode)
                }
              })
            }
          }
          callback && callback()
        },
        () => {
          callback && callback()
        }
      )
    },
    // 递归删除树
    // 参数: nodes, tree, callback
    removeTreeCode(node, map, tree, callback) {
      if (node.childrenDel && node.childrenDel.length > 0) {
        this.removeTreeCode(
          node.childrenDel[node.childrenDel.length - 1],
          map,
          tree,
          callback
        )
      } else {
        this.deleteTag(node, map, tree, callback)
      }
    },
    showEditPop(evt, node) {
      this.showOptionPop = false
      this.optionShowFolderGroup = node.data.group
      this.optionShowFolder = !!node.data.category
      const popHeight = evt.target.parentNode.parentNode.offsetTop
      $('.fix-pos-popover').css('top', popHeight)
      evt.stopPropagation()
      evt.preventDefault()
      this.$nextTick(() => {
        this.showOptionPop = true
      })
    },
    initTag(obj, tag) {
      // obj 为this的属性,指向一个 object
      for (const key in tag) {
        if (key !== 'properties') {
          this.$set(obj, key, tag[key])
        } else if (tag[key]) {
          if (this.$utils.isJSON(tag[key])) {
            const obj2 = JSON.parse(tag[key])
            for (const key2 in obj2) {
              if (/css/.test(key2)) {
                this.$set(obj, key2.replace('css:', ''), obj2[key2])
              } else {
                this.$set(obj, key2, obj2[key2])
              }
            }
          } else {
            this.$set(obj, key, tag[key])
          }
        }
      }
    },
    updataTag(url, data, successed, isEditTag = false) {
      let promise
      if (isEditTag) {
        promise = this.$http.post(url, data)
      } else {
        promise = this.$http.put(url, data)
      }
      promise
        .then(res => {
          if (data.tagId === this.details.tagId) {
            if (this.isDes) {
              this.handleNodeClick(this.curTagMap)
            } else {
              this.handleNodeClick(this.editTag)
            }
          }
          this.getTags()
          successed && successed()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    /**
     * 获取列表每一行的具体信息
     * @param {table row data} tableRow
     */
    getRowDetail(tableRow) {
      const obj = tableRow
      if (obj.modelId && false) {
        // this.$http.get(this.$url + '/service/entities/'+obj.modelId+'/summary')
        // .then(res => {
        //   obj.modelData = {
        //     name: res.data.modelName,
        //   };
        // })
        // .catch(e => this.$showFailure(e));
      }
      if (obj.tableObjectId) {
        this.$http
          .get(
            this.$url + '/service/entities/' + obj.tableObjectId + '/summary'
          )
          .then(res => {
            const properties = res.data.properties
            obj.tableData = {
              colCnt: properties.ColumnOrderArray.length,
              RowCount: properties.RowCount,
            }
          })
          .catch(e => this.$showFailure(e))
      }
      false &&
        this.$http
          .get(this.$url + '/service/entities/' + id + '/summary')
          .then(res => {})
          .catch(e => this.$showFailure(e))
    },
    deleteTagQuo(tag, callback) {
      let fault = false
      if (tag) {
        const itemIds = [tag.id]
        const tagIds = [this.details.tagId]
        const url = `${this.$url}/service/tags/removeTagsToItems`
        const para = {
          itemIds,
          tagIds,
          type: tag.typeId,
        }
        this.$http
          .post(url, para)
          .then(res => {
            callback && callback()
          })
          .catch(e => {
            this.$showFailure(e)
            this.getTagDetails()
          })
        // let objId = (tag.columnObjectId || tag.columnObjectId === 0) ? tag.columnObjectId : tag.tableObjectId;
        // let json = [{
        //   global: true,
        //   name: this.details.name,
        //   objectId: objId,
        // }];
        // if (objId) {
        //   this.$http.put(this.baseUrl + objId + '/tags/delete', json)
        //   .then(res => {
        //     callback && callback();
        //   })
        //   .catch(e => {
        //     this.$showFailure(e);
        //     this.getTagDetails();
        //   });
        // } else {
        //   fault = true;
        // }
      } else {
        fault = true
      }
      if (fault) {
        this.getTagDetails()
      }
    },
    updateTags() {
      this.getTags(this.reload)
    },
    deleteDataLevel(id) {
      HTTP.deleteDataLevel(id)
        .then(res => {
          this.updateTags()
          this.$message.success('删除成功')
        })
        .catch(err => {
          this.$showFailure(err)
        })
    },
    createDataLevel() {
      const isTrue = this.tagsTreeData.find(item => {
        return item.name == this.createform.newName
      })
      if (isTrue) {
        this.$datablauMessage({
          message: '数据分级名字重复',
          type: 'info',
        })
        return
      }
      HTTP.createDataLevel({
        name: this.createform.newName,
        description: this.createform.newDisc,
      })
        .then(res => {
          this.$message.success('数据安全等级创建成功')

          this.updateTags()
        })
        .catch(err => {
          console.error(err)
          this.$showFailure(err)
        })
    },
    submitNewLevel() {
      this.$refs.createForm.validate(valid => {
        if (valid) {
          this.createDataLevel()
        } else {
          return false
        }
      })
    },
    handleCancelNewLevel() {
      this.showCreate = false
    },
  },
  watch: {
    keyword(val) {
      this.$refs.tree.filter(val)
    },
    selection(val) {
      this.disableCommitButton = val.length === 0
    },
    tagGroupList: {
      // 监听的对象
      handler(newVal) {},
      deep: true,
      immediate: true,
    },
    searchQuery(val) {
      this.$refs.columnsTable.refreshData()
    },
    type(val, oldVal) {
      if (oldVal !== '89900000') {
        this.$refs.columnsTable.refreshData()
        this.selection = [] // 切换tab时，选择清空
      }
      switch (parseInt(val)) {
        case 80000004:
        case 80500008:
          this.columnDefs = [
            {
              headerName: '',
              field: 'icon',
              isIcon: true,
              tooltipField: 'icon',
            },
            {
              headerName: '资产名称',
              field: 'name',
              tooltipField: 'name',
            },
            {
              headerName: '业务系统',
              field: 'modelCategoryId',
              tooltipField: 'modelCategoryId',
            },
            {
              headerName: '数据管家',
              field: 'dataManagers',
              tooltipField: 'dataManagers',
            },
            {
              headerName: '创建时间',
              field: 'creationTime',
              tooltipField: 'creationTime',
            },
            {
              headerName: '安全等级',
              field: 'level',
              tooltipField: 'level',
            },
          ]
          break
        case 80000005:
          this.columnDefs = [
            {
              headerName: '',
              field: 'icon',
              isIcon: true,
              tooltipField: 'icon',
            },
            {
              headerName: '资产名称',
              field: 'name',
              tooltipField: 'name',
            },
            {
              headerName: '数据类型',
              field: 'type',
              tooltipField: 'type',
            },
            // {
            //   headerName: '数据标准',
            //   field: 'domains',
            //   tooltipField: 'domains',
            // },
            {
              headerName: '安全等级',
              field: 'level',
              tooltipField: 'level',
            },
          ]
          break
        case 80010066:
          this.columnDefs = [
            {
              headerName: '',
              field: 'icon',
              isIcon: true,
              tooltipField: 'icon',
            },
            {
              headerName: '标准名称',
              field: 'name',
              tooltipField: 'name',
            },
            {
              headerName: '业务定义部门',
              field: 'descriptionDepartmentName',
              tooltipField: 'descriptionDepartmentName',
            },
            {
              headerName: '发布时间', // 首次发布时间
              field: 'firstPublish',
              tooltipField: 'firstPublish',
            },
            {
              headerName: '安全等级',
              field: 'level',
              tooltipField: 'level',
            },
          ]
          break
        case 82800002:
          this.columnDefs = [
            {
              headerName: '',
              field: 'icon',
              isIcon: true,
              tooltipField: 'icon',
            },
            {
              headerName: '报表名称',
              field: 'name',
              tooltipField: 'name',
            },
            {
              headerName: '报表编号',
              field: 'code',
              tooltipField: 'code',
            },
            {
              headerName: '报表类型',
              field: 'type',
              tooltipField: 'type',
            },
            {
              headerName: '安全等级',
              field: 'level',
              tooltipField: 'level',
            },
            {
              headerName: '负责人',
              field: 'owner',
              tooltipField: 'owner',
            },
            {
              headerName: '创建时间',
              field: 'createTime',
              tooltipField: 'createTime',
            },
          ]
          break
        default:
          break
      }
    },
  },
  filters: {},
}
</script>

<style lang="scss" scoped="scoped">
$grey-border: 1px solid #eaecf1;
$border-grey: 1px solid #eceff4;
$blue: #268bd3;
$tree-line-height: 44px;
$tree-box-width: 240px;
$border-test: 1px solid #aaa;
.level-markdown {
  position: absolute;
  top: 55px;
  bottom: 0;
  left: 0;
  right: 0;
  /deep/ .row-content {
    left: 20px;
    right: 20px;
  }
}
.tagPage {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  .option-popover {
    position: absolute;
    // border: 1px solid red;
  }
  .move-tree-box {
    height: 400px;
    overflow: auto;
  }
  .tree-area {
    width: $tree-box-width;
    .tree-search-box {
      position: relative;
      border-bottom: var(--border-color-lighter);
      height: 45px;
      // border: 1px solid red;
      .search-input {
        width: auto;
        position: absolute;
        top: 10px;
        left: 10px;
        right: 40px;
      }
      i {
        line-height: 40px;
        font-size: 16px;
        color: grey;
        margin: 0 0.7em;
        cursor: pointer;
        float: right;
      }
    }
    .tree-box {
      position: absolute;
      top: 10px;
      left: 0;
      right: 0;
      bottom: 0;
      .tree-title {
        margin: 10px;
        margin-top: 0;
        height: 24px;
        line-height: 24px;
        span {
          font-weight: bold;
          font-size: 14px;
        }
        i {
          float: right;
          line-height: 24px;
          color: grey;
          cursor: pointer;
        }
      }
      .fix-pos-popover {
        position: absolute;
        top: 0;
        right: 0;
        visibility: hidden;
      }
      &.full {
        bottom: 0;
      }
    }
    .manage-box {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 48px;
      border-top: var(--border-color-lighter);
      padding: 10px;
      span {
        position: absolute;
        right: 10px;
        top: 15px;
        color: #9b9ea2;
      }
    }
  }
  .tree-area-margin-right {
    position: absolute;
    top: 10px;
    bottom: 10px;
    left: $tree-box-width;
    width: 10px;
    background-color: transparent;
    cursor: e-resize !important;
    z-index: 1;
  }
  .content-area {
    left: $tree-box-width;
    .details {
      $padding-left: 30px;
      min-width: 700px;
      position: absolute;
      top: 0px;
      left: 0px;
      right: 0px;
      bottom: 0px;
      // border: 1px solid #aaa;
      .tag-name {
        font-weight: normal;
        height: 40px;
        padding-top: 8px;
        font-size: 16px;
        line-height: 24px;
      }
      .tags-container {
        display: inline-block;
        white-space: nowrap;
        // width: 100%;
        // overflow: hidden;
        // text-overflow: ellipsis;
      }
      .tag-item {
        margin: 0 0px 0 10px;
      }
      p {
        font-size: 12px;
        line-height: 24px;
      }
      .quo-table {
        padding-left: $padding-left;
        border: 2px solid var(--border-color-lighter);
        line-height: 44px;
        font-weight: bold;
        border-bottom: none;
        .quote-count {
          font-weight: normal;
          padding-right: 40px;
          float: right;
          span {
            margin: 0 16px 0 0;
          }
        }
      }
      .table-container {
        position: absolute;
        top: 56px;
        left: 0;
        right: 0;
        bottom: 0px;
        overflow: hidden;
        .table-box {
          position: absolute;
          top: 88px;
          left: 0px;
          right: 0px;
          bottom: 0px;
          padding: 0 20px;
          overflow: auto;
        }
        .coverMask {
          display: none; // background-color: red;
          color: $blue;
          font-size: 40px;
          background-color: rgba(
            211,
            211,
            211,
            0.246
          ); // border: 1px solid #aaa;
          text-align: center;
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          i {
            margin-top: 30%;
          }
        }
      }
      .bottom-line {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px;
        border-top: 1px solid #eee;
        background-color: #fff;
        .tab-button {
          margin-left: 30px;
          margin-top: 10px;
        }
      }
    }
  }
  .creat {
    margin-left: 0;
  }
}
.list-search-content {
  /deep/ .datablau-tabs {
    padding-bottom: 10px;
    .el-tabs__content {
      display: none;
    }
  }
}
/deep/
  .ag-grid-default-style
  .ag-root
  .ag-header
  .ag-header-row
  .ag-header-cell {
  background-color: #fff;
}
/deep/
  .ag-grid-default-style
  .ag-root
  .ag-header
  .ag-header-row:hover
  .ag-header-cell {
  background-color: var(--table-hover-bgc);
}
/deep/ .ag-grid-default-style .ag-root .ag-row {
  background-color: #fff;
}
/deep/ .ag-grid-default-style .ag-root .ag-row:hover {
  background-color: var(--table-hover-bgc);
}
/deep/ .ag-theme-balham .ag-header-cell {
  padding-left: 20px;
}
/deep/ .ag-theme-balham .ag-cell {
  padding-left: 20px;
}
.light-blue-tree /deep/ .el-tree-node.is-current > .el-tree-node__content {
  background-color: #ebf4ff;
}
.light-blue-tree /deep/ .el-tree-node__content:hover {
  background-color: #f8f9fc;
}
.create-button {
  position: absolute;
  bottom: 10px;
  left: 50%;
  margin-left: -47px;
}
</style>
<style lang="scss">
.context-menu-tree {
  .tree-item {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
  }
}
.content-area {
  .select-con {
    margin-left: 16px;
  }
}
//for tree node option.
.tree-item-outer {
  flex: 1;
  align-items: center;
  justify-content: space-between;
  display: block !important;
}
.tree-item-outer .more {
  display: none;
  position: absolute;
  right: 0;
  padding: 0 8px 0 12px;
  z-index: 2;
  background: inherit;
  float: right;
  line-height: 34px;
}
</style>
