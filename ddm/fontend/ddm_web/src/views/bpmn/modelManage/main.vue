<template>
  <div class="bpmn-model-manage-wrapper">
    <datablau-dialog
      width="650px"
      height="390px"
      title="新建模型"
      :visible.sync="newModelModal"
      append-to-body
    >
      <div class="new-model-wrapper">
        <datablau-form
          ref="newModelFormRef"
          label-width="110px"
          :rules="rulesObj"
          :model="newModelObj"
        >
          <el-form-item
            label="目录"
          >
            <div class="path-wrapper">
              <i class="iconfont icon-file"></i>{{displayPath}}
            </div>
          </el-form-item>
          <el-form-item
            label="模型名称"
            prop="name"
            required
          >
            <datablau-input maxlength="100" show-word-limit placeholder="请输入" v-model="newModelObj.name" ></datablau-input>
          </el-form-item>
<!--          <el-form-item
            label="模型编码"
            required
            prop="id"
          >
            <datablau-input maxlength="100" show-word-limit placeholder="请输入" v-model="newModelObj.id" ></datablau-input>
          </el-form-item>-->
          <el-form-item
            label="描述"
          >
            <datablau-input style="width: 500px;" type="textarea" placeholder="请输入" v-model="newModelObj.description" ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <span slot="footer">
        <datablau-button type="cancel" @click="handleNewModelCancel"></datablau-button>
        <datablau-button type="primary" @click="handleNewModelSubmit">
          确定
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      width="650px"
      height="343px"
      title="新建组"
      :visible.sync="newCategoryModal"
      append-to-body
    >
      <div class="new-model-wrapper">
        <datablau-form
          ref="newDirFormRef"
          :rules="rulesObj"
          label-width="110px"
          :model="newCategoryObj"
        >
          <el-form-item
            label="目录"
          >
            <div class="path-wrapper">
              <i class="iconfont icon-file"></i>{{displayPath}}
            </div>
          </el-form-item>
          <el-form-item
            label="组名称"
            prop="name"
            required
          >
            <datablau-input maxlength="100" show-word-limit placeholder="请输入" v-model="newCategoryObj.name" ></datablau-input>
          </el-form-item>
          <el-form-item
            label="描述"
          >
            <datablau-input style="width: 500px;" type="textarea" placeholder="请输入" v-model="newCategoryObj.description" ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <span slot="footer">
        <datablau-button type="cancel" @click="handleNewCategoryCancel"></datablau-button>
        <datablau-button type="primary" @click="handleNewCategorySubmit">
          确定
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      width="650px"
      height="343px"
      title="编辑"
      :visible.sync="editCategoryModal"
      append-to-body
    >
      <div class="new-model-wrapper">
        <datablau-form
          ref="editDirFormRef"
          label-width="110px"
          :rules="rulesObj"
          :model="editCategoryObj"
        >
          <el-form-item
            label="目录"
          >
            <div class="path-wrapper">
              <i class="iconfont icon-file"></i>{{displayPath.split('/').slice(0, -1).join('/')}}
            </div>
          </el-form-item>
          <el-form-item
            label="组名称"
            prop="name"
            required
          >
            <datablau-input maxlength="100" show-word-limit placeholder="请输入" v-model="editCategoryObj.name" ></datablau-input>
          </el-form-item>
          <el-form-item
            label="描述"
          >
            <datablau-input style="width: 500px;" type="textarea" placeholder="请输入" v-model="editCategoryObj.description" ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <span slot="footer">
        <datablau-button type="cancel" @click="handleEditCategoryCancel"></datablau-button>
        <datablau-button type="primary" @click="handleEditCategorySubmit">
          确定
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-dialog
      width="950px"
      height="350px"
      title="扩展属性"
      :visible.sync="udpModal"
      append-to-body
    >
      <div class="new-model-wrapper">
        <datablau-tooltip
          style="position: absolute; left: 90px; top: -34px"
          content="修改扩展属性会影响所有模型，请谨慎操作！"
        >
          <i class="iconfont icon-tips"></i>
        </datablau-tooltip>
        <datablau-form
          ref="udpFormRef"
          label-width="0"
          :model="{udp: udpList}"
          :rules="rules"
        >
          <div v-for="(item, index) in udpList" :key="index + 'upd'">
            <el-form-item :key="index + 'targetTypes'" :label="''">
              <datablau-select
                v-model="item.targetTypes"
                style="width: 100px; display: inline-block"
                ref="thisSelect"
                placeholder="选择UDP类型"
                class="prop-item"
              >
                <el-option
                  v-for="type in udpType"
                  :key="type.value"
                  :value="type.value"
                  :label="type.label">
                </el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item :key="index + 'name'" :label="''" :prop="'name' + index">
              <datablau-input
                v-model="item.name"
                placeholder="请输入名字"
                style="width: 200px"
                class="prop-item"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :key="index + 'required'"
              :label="''"
            >
              <span
                class="is-required"
                style="display: inline-block; margin: 0 15px"
              >
                <span class="required-label">
                  必填
                </span>
                <datablau-checkbox style="display: inline-block" :checkboxType="'single'" v-model="item.needed">
                </datablau-checkbox>
              </span>
            </el-form-item>
            <el-form-item :key="index + 'valueType'" :label="''" prop="valueType">
              <datablau-select
                v-model="item.valueType"
                style="width: 100px; display: inline-block"
                class="prop-item"
              >
                <el-option
                  :key="1"
                  value="STRING"
                  label="枚举"
                ></el-option>
                <el-option
                  :key="2"
                  value="LONGTEXT"
                  label="字符串"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              v-if="item.valueType === 'STRING'"
              :key="index + 'candidates'"
              :label="''"
              :prop="'candidates' + index"
            >
              <datablau-input
                v-model="item.candidates"
                placeholder="请输入属性枚举，多个枚举以逗号分隔"
                style="width: 250px"
              ></datablau-input>
            </el-form-item>
            <el-form-item style="float: right" :key="index + 'button'" :label="''">
              <datablau-button :disabled="udpList.length === 1" type="icon" class="iconfont icon-delete" @click="removeUDP(index)"></datablau-button>
              <datablau-button type="icon" class="iconfont icon-tianjia" @click="addUDP(index)"></datablau-button>
            </el-form-item>
          </div>
        </datablau-form>
      </div>
      <span slot="footer">
        <datablau-button @click="handleEditUDPCancel">取 消</datablau-button>
        <datablau-button type="primary" @click="handleEditUDPSubmit">
          确 定
        </datablau-button>
      </span>
    </datablau-dialog>
    <div class="left-panel">
      <datablau-input placeholder="搜索" v-model="treeQuerySearch"></datablau-input>
      <datablau-tree
        class="model-tree"
        ref="modelTree"
        :data="treeData"
        :props="defaultProps"
        :filter-node-method="filterNode"
        @node-click="handleNodeClick"
        :default-expand-all="false"
        :default-expanded-keys="defaultKey"
        :expand-on-click-node="false"
        :highlight-current="true"
        :dataSupervise="true"
        node-key="id"
        :data-options-function="getModelCategoryOption"
        :data-icon-function="dataIconFunction"
        :showOverflowTooltip="true"
      ></datablau-tree>
    </div>
    <div class="right-panel" v-loading="loading">
      <div class="top-panel-wrapper">
        <i class="iconfont icon-file"></i>
        <div class="content-wrapper">
          <h2>{{currentCategory.name}}</h2>
          <div class="path">路径：{{categoryPath}}</div>
        </div>
        <datablau-button @click="showUdpsDialog" style="float: right" class="iconfont icon-expand" type="important">
          扩展属性
        </datablau-button>
      </div>
      <div class="model-detail-list-wrapper">
        <div class="search-wrapper">
          <datablau-input style="width: 264px;" v-model="modelSearchQuery" placeholder="搜索名称" @input="searchModelDebounce"></datablau-input>
          <datablau-button type="important" v-if="currentCategoryNode.level === 3 || currentCategoryNode.level === 4" @click="addChildModelWithPath(currentCategory)" style="float: right">新建模型</datablau-button>
        </div>
        <div class="model-list-wrapper">
          <datablau-form-submit class="list-outer-container">
            <datablau-table
              :data="tableData"
              height="100%"
              @sort-change="handleSortChange"
              :default-sort = "{prop: 'lastModificationTimestamp', order: 'descending'}"
            >
              <el-table-column
                show-overflow-tooltip
                label="名称"
                sortable="custom"
                prop="name"
                min-width="120"
              >
                <template slot-scope="scope">
                  <div class="name-wrapper">
                    <datablau-icon :data-type="'bpmnmodel'" icon-type="svg" :size="18" ></datablau-icon>
                    <span @click="handleShowModel(scope.row)">{{scope.row.name}}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                label="路径"
                prop="path"
                min-width="180"
              >
              </el-table-column>
              <el-table-column
                show-overflow-tooltip
                label="负责人"
                sortable="custom"
                prop="owner"
              >
              </el-table-column>
              <el-table-column
                width="190"
                label="更新时间"
                sortable="custom"
                show-overflow-tooltip
                :formatter="$timeFormatter"
                prop="lastModificationTimestamp"
              >
              </el-table-column>
              <el-table-column
                label="操作"
                width="180"
                fixed="right"
                header-align="center"
                align="center"
              >
                <template slot-scope="scope">
                  <datablau-button
                    type="icon"
                    class="iconfont icon-see"
                    @click.stop="handleShowModel(scope.row)"
                    tooltipContent="查看"
                  >
                  </datablau-button>
                  <datablau-button
                    type="icon"
                    class="iconfont icon-bianji"
                    @click.stop="handleEditModel(scope.row)"
                    tooltipContent="编辑"
                  >
                  </datablau-button>
                  <datablau-button
                    type="icon"
                    class="iconfont icon-delete"
                    @click.stop="handleDeleteModel(scope.row)"
                    tooltipContent="删除"
                  >
                  </datablau-button>
                </template>
              </el-table-column>
            </datablau-table>
            <template slot="buttons">
              <div class="bottom-pagination-container">
                <datablau-pagination
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="total"
                  :page-size="pageSize"
                  :page-sizes="[20, 50, 100]"
                  :current-page.sync="currentPage"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                ></datablau-pagination>
              </div>
            </template>
          </datablau-form-submit>
        </div>
      </div>
    </div>
    <model-detail
      v-if="currentModel.id"
      @refreshData="refreshModelData"
      :modelId="currentModel.id"
      @goBack="currentModel = {}"
    ></model-detail>
  </div>
</template>
<script>

import string from '@/resource/utils/string'
import _ from 'lodash'
import modelDetail from '@/views/bpmn/modelManage/modelDetail.vue'

export default {
  components: {
    modelDetail
  },
  computed: {
    rules () {
      let obj = {
        name: [
          {
            required: true,
            trigger: 'blur',
            validator: this.validator
          }
        ],
        candidates: [
          {
            required: true,
            message: '请输入枚举值',
            trigger: 'blur',
            validator: this.validator
          }
        ]
      }
      let newObj = {}
      this.udpList.forEach((item, index) => {
        newObj['name' + index] = obj.name
        newObj['candidates' + index] = obj.candidates
      })
      return newObj
    }
  },
  data () {
    return {
      rulesObj: {
        name: [
          {
            required: true,
            message: '请输入名称',
            trigger: ['blur', 'change']
          }
        ]
        // id: [
        //   {
        //     required: true,
        //     message: '请输入模型编码',
        //     trigger: ['blur', 'change']
        //   }
        // ]
      },
      udpType: [{
        label: 'Gateways',
        value: 80210051
      }, {
        label: 'Tasks',
        value: 80210052
      }, {
        label: 'SubProcesses',
        value: 80210053
      }, {
        label: 'Events',
        value: 80210054
      }, {
        label: 'Data',
        value: 80210055
      }, {
        label: 'Participants',
        value: 80210056
      }],
      udpList: [],
      udpModal: false,
      editCategoryObj: {
        name: '',
        description: ''
      },
      editCategoryModal: false,
      newCategoryObj: {
        name: '',
        description: ''
      },
      currentModel: {
        id: +this.$route.query.id
      },
      loading: false,
      searchModelDebounce: null,
      newCategoryModal: false,
      newModelObj: {
        name: '',
        id: '',
        description: ''
      },
      newModelModal: false,
      treeQuerySearch: '',
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      defaultKey: [],
      currentCategory: {},
      currentCategoryNode: {},
      categoryPath: '',
      displayPath: '',
      modalCategory: {},
      tableData: [],
      total: 0,
      pageSize: 20,
      currentPage: 1,
      modelSearchQuery: '',
      sortData: {
        order: 'descending',
        prop: 'lastModificationTimestamp'
      }
    }
  },
  mounted () {
    this.searchModelDebounce = _.debounce(this.searchModel, 500)
    this.getTreeData()
  },
  watch: {
    treeQuerySearch (value) {
      this.$refs.modelTree.filter(value)
    }
  },
  methods: {
    refreshModelData (val) {
      this.currentModel.name = val
    },
    handleSortChange (sortData) {
      this.sortData = sortData
      this.getModelListData()
    },
    handleEditUDPCancel () {
      this.udpModal = false
    },
    handleEditUDPSubmit () {
      this.$refs.udpFormRef.validate(valid => {
        if (valid) {
          this.$http.post(this.$bpmn + 'udps/save', this.udpList.map((item, index) => {
            if (item.valueType === 'LONGTEXT') {
              return {
                ...item,
                order: index
              }
            } else if (item.valueType === 'STRING') {
              return {
                ...item,
                order: index,
                enumValues: item.candidates.trim().split(',').map(i => {
                  let res = i.trim()
                  return {
                    i: res,
                    p: '',
                    n: res
                  }
                })
              }
            } else {
              return {
                ...item,
                order: index
              }
            }
          })).then(res => {
            console.log(res.data)
            this.udpModal = false
            this.$datablauMessage.success('保存成功')
          }).catch(err => {
            this.$showFailure(err)
          })
        }
      })
    },
    validator (rule, value, callback) {
      if (rule.field && rule.field.indexOf('name') === 0) {
        let updIndex = rule.field.replace('name', '')
        let standard = this.udpList[updIndex]
        if (standard.name) {
          if (this.udpList.filter(i => i.name === standard.name).length > 1) {
            callback(new Error('UDP名字重复'))
          } else {
            callback()
          }
        } else {
          callback(new Error('请输入UDP名字'))
        }
      }
      if (rule.field && rule.field.indexOf('candidates') === 0) {
        let updIndex = rule.field.replace('candidates', '')
        let standard = this.udpList[updIndex]
        if (standard.valueType === 'STRING' && !standard.candidates) {
          callback(new Error(rule.message))
        } else {
          callback()
        }
      }
    },
    removeUDP (index) {
      this.udpList.splice(index, 1)
    },
    addUDP (index) {
      this.udpList.splice(index + 1, 0, {
        'name': '',
        'targetTypes': 80210052,
        'valueType': 'LONGTEXT',
        'needed': false,
        'defaultValue': '',
        'multiSelect': false,
        'candidates': '',
        'category': ''
      })
    },
    getUdpsInfoList () {
      this.$http.get(this.$bpmn + 'udps/').then(res => {
        console.log('udps', res.data)
        if (res.data.length) {
          this.udpList = res.data.sort((a, b) => a.order - b.order).map(obj => ({
            ...obj,
            candidates: obj.enumValues?.map(i => i.i).join(',')
          }))
        } else { // 添加一行空udp
          this.udpList = [{
            'name': '',
            'targetTypes': 80210052,
            'valueType': 'LONGTEXT',
            'needed': false,
            'defaultValue': '',
            'multiSelect': false,
            'candidates': '',
            'category': ''
          }]
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    showUdpsDialog () {
      this.getUdpsInfoList()
      this.udpModal = true
    },
    handleDeleteModel (row) {
      this.$DatablauCofirm('模型删除后，不可恢复。确定要删除？').then(() => {
        this.$http.delete(this.$bpmn + `editor/model/${row.id}`).then(res => {
          this.$datablauMessage.success('删除成功')
          this.getModelListData()
        }).catch(err => {
          this.$showFailure(err)
        })
      }).catch()
    },
    deleteCategory (categoryData) {
      this.$DatablauCofirm('模型目录删除后，不可恢复。确定要删除？').then(() => {
        this.$http.delete(this.$bpmn + `categories/${categoryData.id}`).then(res => {
          this.$datablauMessage.success('删除成功')
          let node = this.$refs.modelTree.getNode(categoryData.id)
          this.$refs.modelTree.remove(node)
          let parent = this.$refs.modelTree.getNode(categoryData.parentId)
          let parentData = parent.data
          this.$refs.modelTree.setCurrentKey(parentData.id)
          this.defaultKey.push(parentData.id)
          this.handleNodeClick(parentData, parent)
          // this.getTreeData()
        }).catch(err => {
          this.$showFailure(err)
        })
      }).catch()
    },
    handleShowModel (row) {
      this.currentModel = row
    },
    searchModel () {
      this.currentPage = 1
      this.pageSize = 20
      this.getModelListData()
    },
    editCategory (categoryData, parentCategoryData) {
      this.modalCategory = _.cloneDeep(parentCategoryData)
      this.editCategoryObj = _.cloneDeep(categoryData)
      this.editCategoryModal = true
    },
    addChildCategory (categoryData) {
      this.modalCategory = _.cloneDeep(categoryData)
      this.newCategoryModal = true
    },
    handleEditModel (row) {
      this.$http.put(this.$bpmn + `editor/${row.id}/lock`).then(res => {
        console.log(res.data)
        if (res.data) {
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          window.open(baseUrl + `main/bpmnModelEdit?id=${row.id}`, '_blank')
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    handleEditCategoryCancel () {
      this.editCategoryModal = false
      this.editCategoryObj = {
        name: '',
        description: ''
      }
    },
    handleEditCategorySubmit () {
      // if (!this.editCategoryObj.name) {
      //   this.$datablauMessage.error('请输入目录名称')
      //   return
      // }
      this.$refs.editDirFormRef.validate(valid => {
        if (valid) {
          this.$http.put(this.$bpmn + `categories/${this.editCategoryObj.id}`, {
            name: this.editCategoryObj.name,
            description: this.editCategoryObj.description,
            id: this.editCategoryObj.id,
            parentId: this.modalCategory?.id || 0 // 根目录
          }).then(res => {
            console.log(res.data)
            this.editCategoryModal = false
            this.editCategoryObj = {
              name: '',
              description: ''
            }
            this.$datablauMessage.success('修改成功')
            let node = this.$refs.modelTree.getNode(res.data.id)
            Object.assign(node.data, res.data)
            this.$refs.modelTree.setCurrentKey(res.data.id)
            this.defaultKey.push(res.data.id)
            this.handleNodeClick(node.data, node)
            // this.getTreeData()
          }).catch(err => {
            this.$showFailure(err)
          })
        }
      })
    },
    handleNewCategoryCancel () {
      this.newCategoryModal = false
      this.newCategoryObj = {
        name: '',
        description: ''
      }
    },
    handleNewCategorySubmit () {
      // if (!this.newCategoryObj.name) {
      //   this.$datablauMessage.error('请输入目录名称')
      //   return
      // }
      this.$refs.newDirFormRef.validate((valid) => {
        if (valid) {
          this.$http.post(this.$bpmn + 'categories/', {
            name: this.newCategoryObj.name,
            description: this.newCategoryObj.description,
            parentId: this.modalCategory.id
          }).then(res => {
            console.log(res.data)
            this.newCategoryModal = false
            this.newCategoryObj = {
              name: '',
              description: ''
            }
            this.$datablauMessage.success('创建成功')
            this.$refs.modelTree.append(res.data, this.modalCategory.id)
            this.$refs.modelTree.setCurrentKey(res.data.id)
            this.defaultKey.push(res.data.id)
            let node = this.$refs.modelTree.getNode(res.data.id)
            this.handleNodeClick(node.data, node)
            // this.getTreeData()
          }).catch(err => {
            this.$showFailure(err)
          })
        }
      })
    },
    handleNewModelCancel () {
      this.newModelModal = false
      this.newModelObj = {
        name: '',
        id: '',
        description: ''
      }
    },
    handleNewModelSubmit () {
      this.$refs.newModelFormRef.validate((valid) => {
        if (valid) {
          this.$http.post(this.$bpmn + 'editor/', {
            modelInfo: {
              name: this.newModelObj.name,
              code: this.newModelObj.id,
              description: this.newModelObj.description,
              categoryId: this.modalCategory.id,
              type: 'BPMN process',
              owner: this.$store.state.user.name
            }
          }).then(res => {
            console.log(res.data)
            this.newModelObj = {
              name: '',
              id: '',
              description: ''
            }
            this.$datablauMessage.success('创建成功')
            this.newModelModal = false
            this.getModelListData()
          }).catch(err => {
            this.$showFailure(err)
          })
        }
      })
      // if (!this.newModelObj.name) {
      //   this.$datablauMessage.error('请输入模型名称')
      //   return
      // }
      // if (!this.newModelObj.id) {
      //   this.$datablauMessage.error('请输入模型编码')
      //   return
      // }
    },
    addChildModelWithPath (categoryData) {
      // 获取当前目录 路径层级
      let result = []
      let current = this.$refs.modelTree.getNode(this.$refs.modelTree.getCurrentKey())
      while (current.data && current.data.name) {
        result.push(current.data.name)
        current = current.parent
      }
      result = result.reverse()
      this.displayPath = result.join('/')
      this.addChildModel(categoryData)
    },
    addChildModel (categoryData) {
      this.modalCategory = _.cloneDeep(categoryData)
      this.newModelModal = true
    },
    getModelListData () {
      this.loading = true
      this.$http.post(this.$bpmn + `editor/modelObjects?currentPage=${this.currentPage}&pageSize=${this.pageSize}`, {
        name: this.modelSearchQuery,
        subjectId: this.currentCategory.id,
        orderColumn: this.sortData.prop,
        ascOrder: this.sortData.order === 'ascending'
      }).then(res => {
        console.log(res.data)
        this.tableData = res.data.content
        this.total = res.data.totalElements
      }).catch(err => {
        this.$showFailure(err)
      }).finally(() => {
        this.loading = false
      })
    },
    handleSizeChange (size) {
      this.pageSize = size
      this.getModelListData()
    },
    handleCurrentChange (current) {
      this.currentPage = current
      this.getModelListData()
    },
    getTreeData () {
      this.$http.get(this.$bpmn + 'editor/').then(res => {
        console.log(res.data)
        this.treeData = [res.data]
        this.defaultKey = [res.data.id]
        this.$nextTick(() => {
          let node = this.$refs.modelTree.getNode(res.data.id)
          this.$refs.modelTree.setCurrentKey(res.data.id)
          this.handleNodeClick(node.data, node)
        })
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    filterNode (value, data, node) {
      if (!value) {
        return true
      }
      if (!data.name) {
        return false
      }
      let hasValue = false
      if (string.matchKeyword(node.data, value, 'name')) {
        hasValue = true
      }
      return hasValue
    },
    handleNodeClick (data, node) {
      this.currentCategory = data
      this.currentCategoryNode = node
      // 获取当前目录 路径层级
      let result = []
      let current = node
      while (current.data && current.data.name) {
        result.push(current.data.name)
        current = current.parent
      }
      result = result.reverse()
      this.categoryPath = result.join('/')
      this.currentPage = 1
      this.pageSize = 20
      this.getModelListData()
    },
    getModelCategoryOption (data, node) {
      // 获取当前目录 路径层级
      let result = []
      let current = node
      while (current.data && current.data.name) {
        result.push(current.data.name)
        current = current.parent
      }
      result = result.reverse()
      this.displayPath = result.join('/')
      let resultArr = [] // 防止不显示...
      if (node?.level === 1) {
        // 根目录只能增加子目录
        resultArr = [
          {
            label: '新建组',
            icon: 'iconfont icon-tianjia',
            callback: () => {
              this.addChildCategory(data)
            }
          }
        ]
      } else if (node?.level === 2) {
        resultArr = [
          {
            label: '新建组',
            icon: 'iconfont icon-tianjia',
            callback: () => {
              this.addChildCategory(data)
            }
          },
          {
            label: '编辑',
            icon: 'iconfont icon-revise',
            callback: () => {
              this.editCategory(data, node.parent?.data)
            }
          },
          {
            label: '删除',
            icon: 'iconfont icon-delete',
            callback: () => {
              this.deleteCategory(data)
            }
          }
        ]
      } else if (node?.level === 3 || node?.level === 4) {
        resultArr = []
        if (node.level === 3) {
          resultArr.push({
            label: '新建组',
            icon: 'iconfont icon-tianjia',
            callback: () => {
              this.addChildCategory(data)
            }
          })
        }
        resultArr = resultArr.concat([
          {
            label: '新建模型',
            icon: 'iconfont icon-tianjia',
            callback: () => {
              this.addChildModel(data)
            }
          },
          {
            label: '编辑',
            icon: 'iconfont icon-revise',
            callback: () => {
              this.editCategory(data, node.parent?.data)
            }
          },
          {
            label: '删除',
            icon: 'iconfont icon-delete',
            callback: () => {
              this.deleteCategory(data)
            }
          }
        ])
      }
      return resultArr
    },
    dataIconFunction (data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    }
  }
}
</script>
<style scoped lang="scss">
.new-model-wrapper {
  .path-wrapper {
    font-size: 12px;
    .iconfont {
      font-size: 16px;
      color: #999;
      margin: 4px;
    }
  }
  /deep/ .el-form.db-form .el-form-item {
    display: inline-block;
    margin-right: 8px;
  }
}
.model-list-wrapper {
  position: absolute;
  top: 116px;
  left: 0;
  right: 0;
  bottom: 0;
}
.top-panel-wrapper {
  padding: 16px;
  background: #F6F8FF;
  & > .icon-file {
    display: inline-block;
    color: #409EFF;
    font-size: 40px;
    margin-right: 8px;
  }
  .content-wrapper {
    display: inline-block;
    h2 {
      color: #555;
      font-size: 16px;
      line-height: 16px;
    }
    .path {
      margin-top: 9px;
      color: #555;
      font-size: 12px;
      line-height: 14px;
    }
  }
}
.search-wrapper {
  margin: 8px 16px;
}
.left-panel {
  position: absolute;
  left: 0;
  width: 240px;
  bottom: 0;
  top: 0;
  border-right: 1px solid #ddd;
  .datablau-input {
    display: block;
    margin: 8px;
  }
}
.right-panel {
  position: absolute;
  right: 0;
  left: 240px;
  bottom: 0;
  top: 0;
}
.name-wrapper {
  span {
    display: inline-block;
    vertical-align: top;
    margin-left: 8px;
    cursor: pointer;
    &:hover {
      color: #4386f5;
    }
  }
}
</style>
