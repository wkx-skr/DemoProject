<template>
  <div style="padding: 0 20px" class="allOut1">
    <div class="row-header">
      <datablau-breadcrumb
        @back="back"
        :node-data="nodeData"
        separator="/"
      ></datablau-breadcrumb>
    </div>
    <div
      style="
        position: absolute;
        top: 50px;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: auto;
      "
    >
      <div style="padding: 10px 20px">
        <datablau-form
          class="page-form multiple-column"
          inline
          label-position="right"
          label-width="180px"
          :rules="formRules"
          ref="form"
          :model="formData"
        >
          <div class="part-title">{{ $t('indicator.demand.basic') }}</div>
          <div>
            <el-form-item
              :label="$t('system.systemSetting.dir')"
              prop="categorys"
            >
              <datablau-cascader
                clearable
                v-model="formData.categorys"
                :options="options"
                filterable
                :props="{ checkStrictly: true }"
                @change="categoryChange"
                disabled="true"
                ref="cascader"
                style="margin-top: -5px"
              ></datablau-cascader>
            </el-form-item>
            <!-- <el-form-item label="维度编码" prop="dimensionCode">
              <datablau-input
                maxlength="200"
                v-model="formData.dimensionCode"
              ></datablau-input>
            </el-form-item> -->
            <!-- <el-form-item label="维度ID" prop="dimensionId">
              <datablau-input
                maxlength="200"
                v-model="formData.dimensionId"
              ></datablau-input>
            </el-form-item> -->
            <el-form-item :label="$t('indicator.dimension.requirement')">
              <datablau-select v-model="formData.requirementId" disabled="true">
                <el-option
                  v-for="item in requirementOption"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <el-form-item
              :label="$t('indicator.dimension.dimensionName')"
              prop="dimensionName"
            >
              <datablau-input
                maxlength="200"
                v-model="formData.dimensionName"
                disabled="true"
              ></datablau-input>
            </el-form-item>
            <!-- <el-form-item label="同义词" prop="synonym">
              <datablau-input v-model="formData.synonym"></datablau-input>
            </el-form-item> -->
            <el-form-item
              :label="$t('indicator.dimension.name')"
              prop="englishName"
            >
              <datablau-input
                maxlength="200"
                v-model="formData.englishName"
                disabled="true"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="$t('indicator.dimension.dataRange')"
              prop="serviceLife"
            >
              <!-- <datablau-date-picker
                v-if="showServiceLife"
                :dateTime="formData.serviceLife"
                v-model="formData.serviceLife"
                disabled="true"
              ></datablau-date-picker> -->
              <datablau-date-range
                ref="dataRange"
                v-model="formData.dateRange"
                readonly="true"
              ></datablau-date-range>
            </el-form-item>
            <el-form-item
              :label="$t('meta.DS.tableDetail.knowledgeGraph.edges.busiLeader')"
              prop="businessLeader"
            >
              <datablau-input
                maxlength="200"
                v-model="formData.businessLeader"
                disabled="true"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="$t('meta.DS.tableDetail.knowledgeGraph.edges.techLeader')"
              prop="technicalLeader"
            >
              <datablau-input
                maxlength="200"
                v-model="formData.technicalLeader"
                disabled="true"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="$t('indicator.demand.taskProps.managementLeader')"
              prop="managementLeader"
            >
              <datablau-input
                maxlength="200"
                v-model="formData.managementLeader"
                disabled="true"
              ></datablau-input>
            </el-form-item>
            <el-form-item
              :label="$t('indicator.dimension.state')"
              prop="stauts"
            >
              <datablau-select v-model="formData.stauts" disabled="true">
                <el-option
                  v-for="item in stautsOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </datablau-select>
            </el-form-item>
            <!-- <el-form-item label="标准引用" prop="standardReference">
              <datablau-input
                v-model="formData.standardReference"
              ></datablau-input>
            </el-form-item> -->
            <br />
            <el-form-item
              :label="$t('meta.lineageManage.desc')"
              prop="description"
            >
              <div
                style="width: 900px; padding-left: 10px; word-break: break-all"
              >
                {{ formData.description }}
              </div>
            </el-form-item>
            <el-form-item
              :label="udp.name"
              v-for="(udp, index) in udps"
              :key="index"
            >
              <div
                style="width: 900px; padding-left: 10px; word-break: break-all"
              >
                {{ formData.dimensionUdpValue[udp.id] }}
              </div>
            </el-form-item>
            <br />
            <el-form-item
              :label="$t('indicator.dimension.hierarchy')"
              prop="hierarchy"
              class="auto"
              style=""
            >
              <div style="width: 100px; height: 10px"></div>
            </el-form-item>
            <div style="float: right">
              <!-- <datablau-button
                style="float: right; margin-right: 10px"
                @click=""
              >
                维度映射
              </datablau-button> -->
              <!-- <datablau-button
                style="float: right; margin-right: 10px"
                @click="addHierarchy"
              >
                新增层级
              </datablau-button> -->
            </div>
            <div class="table-area">
              <datablau-table :data="formData.hierarchy">
                <el-table-column
                  min-width="60"
                  :label="$t('indicator.dimension.h.order')"
                  prop="order"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.order }}
                  </template>
                </el-table-column>
                <el-table-column
                  min-width="120"
                  :label="$t('indicator.dimension.h.alias')"
                  prop="chName"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.chName }}
                  </template>
                </el-table-column>
                <el-table-column
                  min-width="120"
                  :label="$t('indicator.dimension.h.name')"
                  prop="englishName"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.englishName }}
                  </template>
                </el-table-column>
                <el-table-column
                  min-width="140"
                  :label="$t('indicator.dimension.h.column')"
                  prop="dimensionColumn"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{ scope.row.dimensionColumn }}
                  </template>
                </el-table-column>
                <!-- <el-table-column
                  label="操作"
                  min-width="120"
                  fixed="right"
                  align="center"
                >
                  <template slot-scope="scope">
                    <datablau-button type="text" @click="hierarchyEdit(scope)">
                      <span>编辑</span>
                    </datablau-button>
                    <datablau-button
                      type="text"
                      @click="hierarchyDelete(scope)"
                    >
                      <span>删除</span>
                    </datablau-button>
                  </template>
                </el-table-column> -->
              </datablau-table>
            </div>
          </div>
        </datablau-form>
        <dimension-value
          v-if="!iscreate"
          :data-id="id"
          :hierarchy-table="hierarchyTable"
        ></dimension-value>
      </div>
      <div style="height: 50px"></div>
    </div>
  </div>
</template>
<script>
import dimensionValue from './dimensionValue'

export default {
  components: {
    dimensionValue
  },
  props: {
    iscreate: {
      type: Boolean,
      required: false
    },
    id: {
      type: Number,
      required: false
    },
    categoryId: {
      type: Number,
      required: false
    },
    udps: {}
  },
  data () {
    return {
      nodeData: [],
      formData: {
        hierarchy: [],
        categoryId: '',
        categorys: [],
        requirementId: '',
        dimensionName: '',
        englishName: '',
        technicalLeader: '',
        businessLeader: '',
        managementLeader: '',
        stauts: '',
        description: ''
      },
      formRules: {},
      // 层级表单
      hierarchyFormData: {},
      // 层级表单验证
      hierarchyRules: {
        chName: {
          required: true,
          trigger: 'blur',
          message: this.$t('indicator.demand.notNull')
        },
        englishName: {
          required: true,
          trigger: 'blur',
          message: this.$t('indicator.demand.notNull')
        }
      },
      showhierarchy: false,
      showValue: false,
      valueRules: {
        lvlId: {
          required: true,
          trigger: 'blur',
          message: this.$t('indicator.demand.notNull')
        },
        parentId: {
          required: true,
          trigger: 'blur',
          message: this.$t('indicator.demand.notNull')
        },
        valueTableData: {
          required: true,
          trigger: 'blur',
          message: this.$t('indicator.demand.notNull')
        }
      },
      valueFormData: {
        valueTableData: []
      },
      dimensionValueTable: [],
      // 目录
      options: [],
      categoryArr: [],
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
        preview: true // 预览
      },
      showAddValue: false,
      addValueRules: {
        name: {
          required: true,
          trigger: 'blur',
          message: this.$t('indicator.demand.notNull')
        },
        chineseName: {
          required: true,
          trigger: 'blur',
          message: this.$t('indicator.demand.notNull')
        },
        code: {
          required: true,
          trigger: 'blur',
          message: this.$t('indicator.demand.notNull')
        },
        dataOrder: {
          type: 'number',
          message: this.$t(
            'quality.page.ruleTemplate.generatesql.placeholder.number'
          )
        }
      },
      addValueForm: {},
      valueTree: [],
      parentOptions: [],
      showServiceLife: false,
      // 状态
      stautsOptions: [
        {
          value: 0,
          label: this.$t('indicator.dimension.stateOptions.0')
        },
        {
          value: 1,
          label: this.$t('indicator.dimension.stateOptions.1')
        },
        {
          value: 2,
          label: this.$t('indicator.dimension.stateOptions.2')
        }
      ],
      hierarchyOption: [],
      orderOption: [
        {
          order: 0,
          chName: this.$t('indicator.dimension.root')
        }
      ],
      requirementOption: [],
      hierarchyTable: null,
      dimensionValueTree: []
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.getTreeData()
      this.getRequirementData()
      if (this.id) {
        this.getTreeList(() => {
          this.getFormData()
        })
      } else {
        this.showServiceLife = true
        if (this.categoryId && this.categoryId != null) {
          this.getTreeList(() => {
            let categorys = this.sortCategory(this.categoryId).splice(1)
            this.$set(this.formData, 'categorys', categorys)
          })
        }
      }
    },
    back () {
      this.$emit('back')
    },
    // 筛选目录
    sortCategory (id) {
      this.categoryArr.unshift(id)
      if (Array.isArray(this.treeList)) {
        let c = this.treeList.filter(item => item.categoryId === id)[0]
        if (c.parentId) {
          this.sortCategory(c.parentId)
        }
      }
      return this.categoryArr
    },
    // 获取详情
    getFormData () {
      let url = `${this.$domains}dimension/get?id=${this.id}`
      this.$http
        .post(url)
        .then(res => {
          this.formData = _.cloneDeep(res.data)
          if (!this.formData.dimensionUdpValue) {
            this.$set(this.formData, 'dimensionUdpValue', {})
          }
          this.udps.forEach(e => {
            if (!this.formData.dimensionUdpValue[e.id]) {
              this.$set(this.formData.dimensionUdpValue, e.id, null)
            }
          })
          this.nodeData = [
            {
              name: this.$t('common.page.indexApply'),
              couldClick: false
            },
            {
              name: this.$t('common.page.dimensionDefinition'),
              couldClick: false
            },
            {
              name: this.formData.dimensionName
            }
          ]
          this.hierarchyTable = _.cloneDeep(res.data.hierarchy)
          if (this.formData.hierarchy === null) {
            this.formData.hierarchy = []
            this.hierarchyTable = []
          }
          this.formData.categorys = this.sortCategory(
            res.data.categoryId
          ).splice(1)
          this.showServiceLife = true
          this.formData.dateRange = [
            this.formData.serviceLifeStart,
            this.formData.serviceLifeEnd
          ]
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    categoryChange (val) {
      console.log(val, 'val')
    },
    treeSort (root) {
      let t = root.subNodes
      if (t) {
        t.forEach(item => {
          item.value = item.id
          item.label = item.name
          if (item.subNodes) {
            item.children = item.subNodes
            this.treeSort(item)
          }
        })
      }
      return t
    },
    // 获取目录树
    getTreeData () {
      let url = `${this.$domains}categories/tree?type=82800023`
      this.$http
        .post(url)
        .then(res => {
          this.options = this.treeSort(res.data.subNodes[0])
        })
        .catch(e => {
          this.$showFailure(e)
        })
      // setTimeout(() => {
      //   this.treeData = this.TREE_DATA
      // }, 1000)
    },
    // 获取目录列表
    getTreeList (callback) {
      let url = `${this.$domains}categories/get?type=82800023`
      this.$http
        .post(url)
        .then(res => {
          this.treeList = res.data
          if (callback) {
            callback()
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取需求列表
    getRequirementData () {
      let url = `${this.$domains}requirementmanagement/getall`
      this.$http
        .post(url)
        .then(res => {
          let data = _.cloneDeep(res.data)
          data.map(item => {
            if (item.name.length > 21) {
              item.name = item.name.slice(0, 20) + '...'
            }
          })
          this.requirementOption = data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    setOwner (property) {
      this.$utils.staffSelect.open([], true).then(res => {
        this.formData[property] = res[0].username
      })
    }
  },
  computed: {}
}
</script>

<style lang="scss" scoped>
@import '~@/next/components/basic/color.sass';
.row-header {
  padding: 10px 0 8px;
  border-bottom: 1px solid $border-color;
}
.part-title {
  border-left: 4px solid $primary-color;
  margin-bottom: 12px;
  margin-top: 10px;
  padding-left: 6px;
  color: $text-default;
  font-size: 14px;
}
.el-dialog .el-form-item {
  margin-bottom: 20px;
}
</style>
<style lang="scss">
.multiple-column {
  .el-form-item {
    min-width: 532px;
    font-size: 12px;
    &:nth-of-type(odd) {
      margin-right: 100px;
      /*outline: 1px solid indianred;*/
    }
    margin-right: 100px;
  }
  .el-form-item__error {
    padding-top: 0;
  }
  .auto {
    .el-form-item__label {
      width: auto !important;
    }
  }
}
.allOut1 .el-form-item {
  margin-bottom: 20px;
}
.allOut1 .el-input__inner {
  border: none;
}
.allOut1 .el-textarea__inner {
  border: none;
}
.allOut1 .el-input__prefix {
  display: none;
}
.allOut1 .el-range__icon {
  display: none;
}
</style>
