<template>
  <div class="new-algorithm-page">
    <datablau-form-submit style="top: 10px">
      <datablau-form :model="formContent" ref="demoForm" :rules="rules">
        <el-form-item label="算法名称" prop="algorithmName">
          <datablau-input
            class="maxlength-input"
            style="width: 480px"
            v-model="formContent.algorithmName"
            show-word-limit
            maxlength="12"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="父级算法">
          <datablau-select
            filterable
            clearable
            remote
            v-model="formContent.parentId"
            v-selectLazyLoad="lazyloading"
            :remote-method="remoteMethod"
            @focus="algorithmSelect"
            style="display: inline-block; width: 480px"
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
        <el-form-item label="测试结果：" size="normal" v-show="showResult">
          <div
            class="tip-box"
            :class="{ 'err-tip-box': isError }"
            style="display: inline-block"
          >
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
import API from '@/view/dataSecurity/util/api'
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
  },
  data() {
    return {
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
        if (!result) {
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
      this.$refs.demoForm.validate(valid => {
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
      this.$refs.demoForm.validate(valid => {
        if (!valid) {
          // this.$blauShowFailure('表单校验未通过')
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
    'formContent.test'(val) {
      console.log(val)
      if (val) {
        this.disableTest = false
      } else {
        this.disableTest = true
      }
    },
  },
}
</script>

<style scoped lang="scss">
.new-algorithm-page {
  position: absolute;
  top: -8px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9;
  background: #fff;
  .tip-box {
    line-height: 34px;
    &.err-tip-box {
      color: #e6ad00;
      i {
        display: inline-block;
        color: #e6ad00;
      }
    }
    i {
      // color: $primary-color;
      margin-left: 10px;
      margin-right: 5px;
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
