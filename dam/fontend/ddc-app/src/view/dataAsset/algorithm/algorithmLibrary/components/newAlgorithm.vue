<template>
  <div class="new-algorithm-page">
    <!-- 新建算法时， 选择目录 -->
    <datablau-dialog
      :title="'选择目录'"
      size="s"
      :height="480"
      width="600px"
      :destroy-on-close="true"
      :visible.sync="showDirectory"
      v-if="showDirectory"
    >
      <div class="tree-search-box">
        <datablau-input
          style="width: 100%"
          v-model="treeKey"
          :iconfont-state="true"
          clearable
          placeholder="搜索"
        ></datablau-input>
      </div>
      <div class="tree-box">
        <datablau-tree
          v-loading="treeLoading"
          @node-click="handleNodeClick"
          :data-icon-function="dataIconFunction"
          :filter-node-method="filterNode"
          node-key="catalogId"
          :props="defaultProps"
          :data="treeData"
          :data-supervise="true"
          ref="tree"
          empty-text="暂无目录信息"
        ></datablau-tree>
      </div>

      <span slot="footer">
        <datablau-button type="secondary" @click="close">取消</datablau-button>
        <datablau-button
          type="important"
          :disabled="!selectGra.catalogId"
          @click="sure"
        >
          确定
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-form-submit style="top: 10px">
      <datablau-form :model="formContent" ref="algorithmForm" :rules="rules">
        <el-form-item label="算法名称" prop="algorithmName">
          <datablau-input
            class="maxlength-input"
            style="width: 500px"
            v-model="formContent.algorithmName"
            show-word-limit
            maxlength="12"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="父级算法" class="remote-form-item">
          <datablau-select
            filterable
            clearable
            remote
            v-model="formContent.parentId"
            v-selectLazyLoad="lazyloading"
            :remote-method="remoteMethod"
            @focus="algorithmSelect"
            style="display: inline-block; width: 500px"
          >
            <el-option
              v-for="algorith in algorithmList"
              :key="algorith.algorithmId"
              :label="algorith.algorithmName"
              :value="algorith.algorithmId"
            ></el-option>
            <el-option v-if="algorithmLoading" value="" class="table-option">
              加载中...
            </el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="选择目录" prop="catalogName">
          <datablau-input
            ref="selectGra"
            v-model="formContent.catalogName"
            placeholder="请选择目录"
            style="width: 500px"
            @focus="openDirector"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="描述">
          <datablau-input
            v-model="formContent.algorithmDescription"
            type="textarea"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="识别算法类型">
          <datablau-radio v-model="formContent.type">
            <el-radio label="REGEX">正则表达式</el-radio>
          </datablau-radio>
        </el-form-item>
        <el-form-item label="识别算法内容" prop="algorithmContent">
          <datablau-input
            placeholder="请输入正则表达式内容"
            v-model="formContent.algorithmContent"
            type="textarea"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="测试">
          <datablau-input
            placeholder="请输入测试内容"
            v-model="formContent.test"
            type="textarea"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="" size="normal">
          <datablau-button
            type="primary"
            @click="testRule"
            :disabled="disableTest"
          >
            测试
          </datablau-button>
        </el-form-item>
        <el-form-item label="测试结果" size="normal" v-show="showResult">
          <div class="tip-box" :class="{ 'err-tip-box': isError }">
            <i class="iconfont icon-gaojing" v-if="isError"></i>
            <i
              class="iconfont icon-chenggong"
              style="color: #66bf16"
              v-else
            ></i>
            {{ testResult }}
          </div>
        </el-form-item>
      </datablau-form>
      <div slot="buttons">
        <datablau-button type="important" @click="validate">
          确定
        </datablau-button>
        <datablau-button type="secondary" @click="cancel">取消</datablau-button>
      </div>
    </datablau-form-submit>
  </div>
</template>

<script>
import API from '@/view/dataAsset/utils/s_api'
export default {
  components: {},
  props: {
    algorithmClick: {
      type: Function,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    id: {
      type: [String, Number],
      default: '',
    },
    currentNode: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      treeKey: '',
      selectGra: {},
      showDirectory: false,
      treeLoading: false,
      defaultProps: {
        children: 'subNodes',
        label: 'name',
      },
      treeData: [],
      algorithmList: [],
      nowAlgorithmList: [],
      algorithmPage: 1,
      pageSize: 10,
      algorithmTotal: 0,
      algorithmName: '',
      algorithmLoading: false,
      rules: {
        algorithmName: [
          {
            required: true,
            message: '请输入算法名称',
            trigger: 'change',
          },
        ],
        catalogName: [
          {
            required: true,
            message: '请选择目录',
            trigger: 'change',
          },
        ],
        algorithmContent: [
          {
            required: true,
            message: '请输入正则表达式内容',
            trigger: 'change',
          },
        ],
      },
      formContent: {
        algorithmName: '',
        parentId: '',
        catalogId: '',
        catalogName: '',
        catalogId: '',
        algorithmDescription: '',
        type: 'REGEX',
        algorithmContent: '',
        test: '',
      },
      disableTest: true,
      showResult: false,
      isError: false,
      testResult: '',
      showItem: false,
      parentMap: {},
    }
  },
  async mounted() {
    await this.getAlgorithmList()
    if (this.isEdit) {
      this.$nextTick(() => {
        this.getAlgorithmDetail()
      })
    }
  },
  methods: {
    // 根据关键字过滤策略目录树
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    sure() {
      this.showDirectory = false
      this.formContent.catalogId = this.selectGra.catalogId
      this.formContent.catalogName = this.selectGra.name
    },
    close() {
      this.showDirectory = false
    },
    dataIconFunction(data, node) {
      if (node.expanded) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-file'
      }
    },
    openDirector() {
      this.$refs.selectGra.blur()
      this.showDirectory = true
      this.treeKey = ''
      this.selectGra = {}
      this.getTree()
    },
    getTree() {
      const type = 'DISCERN_ALGORITHM'
      API.getStrategyCatalog(type)
        .then(res => {
          this.treeData = res.data.data.subNodes || []
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleNodeClick(data) {
      this.selectGra = data
    },
    getAlgorithmDetail() {
      API.getAlgorithmDetail(this.id)
        .then(res => {
          let newMap = res.data.data
          newMap.algorithmContent = res.data.data.algorithmContent.pattern || ''
          Object.assign(this.formContent, newMap)
          this.parentMap = {
            algorithmId: newMap.parentId,
            algorithmName: newMap.parentName,
          }
          this.filterData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    lazyloading() {
      if (this.algorithmPage * this.pageSize >= this.algorithmTotal) return
      this.algorithmPage++
      this.getAlgorithmList()
    },
    algorithmSelect(val) {
      this.algorithmPage = 1
      // this.algorithmName = val
      this.getAlgorithmList()
    },
    remoteMethod(key) {
      this.algorithmPage = 1
      this.getAlgorithmList(key)
    },
    getAlgorithmList(key = '') {
      this.algorithmLoading = true
      const params = {
        catalogId: 0,
        searchStr: key,
        pageNum: this.algorithmPage,
        pageSize: this.pageSize,
      }
      API.getAlgorithmList(params)
        .then(res => {
          this.algorithmTotal = res.data.data.total
          this.algorithmLoading = false
          if (this.algorithmPage !== 1) {
            this.nowAlgorithmList = this.nowAlgorithmList.concat(
              res.data.data.algorithms
            )
          } else {
            this.nowAlgorithmList = res.data.data.algorithms
          }
          this.filterData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },

    filterData() {
      this.algorithmList = []
      if (this.isEdit) {
        this.algorithmList = this.nowAlgorithmList.filter(
          item => item.algorithmId !== parseInt(this.id)
        )
        const result = this.nowAlgorithmList.some(
          item => item.algorithmId === this.parentMap.algorithmId
        )
        if (!result && this.parentMap.algorithmId) {
          this.algorithmList.push(this.parentMap)
        }
      } else {
        this.algorithmList = this.nowAlgorithmList
      }
    },
    testRule() {
      const params = {
        type: 'REGEX',
        algorithmMap: {
          pattern: this.formContent.algorithmContent,
        },
        testStr: this.formContent.test,
      }
      this.$refs.algorithmForm.validate(valid => {
        if (!valid) {
          return false
        } else {
          API.testAlgorithm(params)
            .then(res => {
              this.showResult = true
              if (res.data.data) {
                this.testResult = `符合规则`
                this.isError = false
              } else {
                this.isError = true
                this.testResult = '没有识别到符合规则的内容'
              }
            })
            .catch(e => {
              this.showResult = false
              this.$showFailure(e)
            })
        }
      })
    },
    selectFname() {
      this.showItem = true
    },
    validate() {
      console.log('submit')
      this.$refs.algorithmForm.validate(valid => {
        console.log(valid)
        if (!valid) {
          // this.$datablauMessage.error('表单校验未通过')
          return false
        } else {
          this.submit()
        }
      })
    },
    submit() {
      const algorithmContent = {
        pattern: this.formContent.algorithmContent,
      }
      let params = {
        catalogId: this.formContent.catalogId,
        catalogName: this.formContent.catalogName,
        algorithmName: this.formContent.algorithmName,
        parentId: this.formContent.parentId,
        algorithmDescription: this.formContent.algorithmDescription,
        type: this.formContent.type,
        algorithmContent,
      }
      if (this.isEdit) {
        // 修改
        params.algorithmId = this.id
        API.modifyAlgorithm(params)
          .then(res => {
            this.$datablauMessage.success('编辑成功')
            this.algorithmClick('new', {
              type: 'cancel',
            })
          })
          .catch(e => {
            this.$showFailure(e)
          })
      } else {
        // 新建
        API.newAlgorithm(params)
          .then(res => {
            this.$datablauMessage.success('新建成功')
            this.algorithmClick('new', {
              type: 'cancel',
            })
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    cancel() {
      this.algorithmClick('new', {
        type: 'cancel',
      })
    },
    clickChild(name, options) {
      switch (name) {
        case 'selAlgorithm':
          if (options.type === 'close') {
          }
          if (options.type === 'submit') {
          }
          this.showItem = false
          break
        default:
          break
      }
    },
  },
  watch: {
    treeKey(val) {
      this.$nextTick(() => {
        this.$refs.tree.$refs.tree.filter(val)
      })
    },
    'formContent.test'(val) {
      if (val) {
        this.disableTest = false
      } else {
        this.disableTest = true
      }
    },
    currentNode: {
      handler(val) {
        if (val.catalogId) {
          this.formContent.catalogId = val.catalogId
          this.formContent.catalogName = val.name
        }
      },
      deep: true,
      immediate: true,
    },
  },
}
</script>

<style scoped lang="scss">
.tree-box {
  position: absolute;
  top: 42px;
  bottom: 0;
  left: 20px;
  right: 20px;
  overflow-y: auto;
}
/deep/ .el-form-item {
  .el-form-item__content {
    line-height: 32px;
  }
  .el-form-item__label {
    margin-top: 0;
  }
  &.remote-form-item {
    .el-select {
      // .el-select__caret::before {
      //   content: '\e6e1';
      // }
      // .is-focus {
      //   .el-select__caret:first-child {
      //     transform: rotateZ(0deg);
      //   }
      // }
    }
  }
}

.new-algorithm-page {
  position: absolute;
  top: 20px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9;
  background: #fff;
  .tip-box {
    line-height: 32px;
    display: flex;
    align-items: center;
    &.err-tip-box {
      i {
        color: #ff7519;
      }
    }
    i {
      color: #66bf16;
      margin-right: 4px;
    }
  }
}
</style>

<style lang="scss">
.datablau-option {
  .table-option {
    text-align: center;
  }
}
</style>
