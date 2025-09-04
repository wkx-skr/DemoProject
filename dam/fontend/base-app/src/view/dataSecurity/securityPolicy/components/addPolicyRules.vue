<template>
  <div class="rules">
    <datablau-form-submit class="formSub">
      <datablau-detail-subtitle
        title="敏感数据"
        mt="20px"
      ></datablau-detail-subtitle>
      <datablau-form
        label-width="180px"
        ref="form"
        :validateNoScroll="true"
        :model="searchForm"
        class="formBox"
        :rules="rules"
      >
        <el-form-item :label="'数据内容描述'" prop="describes">
          <datablau-input
            v-model="searchForm.describes"
            clearable
            type="textarea"
            :iconfont-state="true"
            style="width: 640px; height: 100px"
            :placeholder="'请输入'"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          :label="'数据安全分类'"
          prop="securityTypeName"
          :rules="{
            trigger: ['change', 'blur'],
            required: true,
            message: '数据安全分类必填',
          }"
        >
          <datablau-select
            v-model="searchForm.securityTypeName"
            clearable
            class="width"
            maxlength="100"
            readonly
            @focus="selectClass"
            style="width: 240px"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item :label="'数据安全等级'" prop="securityLevelAName">
          <datablau-select
            v-model="searchForm.securityLevelAName"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="item in gradeList"
              :key="item.tagId"
              :label="item.name"
              :value="item.tagId + '|' + item.name"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item :label="'敏感内容描述'" prop="sensitiveDesc">
          <datablau-input
            v-model="searchForm.sensitiveDesc"
            clearable
            type="textarea"
            :iconfont-state="true"
            style="width: 640px; height: 100px"
            :placeholder="'请输入'"
          ></datablau-input>
        </el-form-item>
        <datablau-detail-subtitle
          title="数据授权规则"
          mt="20px"
        ></datablau-detail-subtitle>
        <el-form-item
          :label="'数据接收部门'"
          prop="receivingDeptName"
          :rules="{
            trigger: ['change', 'blur'],
            required: true,
            message: '数据接收部门必填',
          }"
        >
          <datablau-select
            v-model="searchForm.receivingDeptName"
            clearable
            class="width"
            maxlength="100"
            readonly
            @focus="addBm"
            style="width: 240px"
          >
            <el-option
              v-for="item in bum"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item :label="'事件影响程度'" prop="impactDegree">
          <datablau-select
            v-model="searchForm.impactDegree"
            clearable
            style="width: 240px"
          >
            <el-option
              v-for="item in impactDegree"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item :label="'白名单'" prop="name">
          <datablau-input
            v-model="searchForm.name"
            clearable
            readonly
            @focus="addPersonnel"
            style="width: 640px"
          ></datablau-input>
          <!--          <datablau-select-->
          <!--            v-model="searchForm.whiteList"-->
          <!--            clearable-->
          <!--            readonly-->
          <!--            class="width"-->
          <!--            @focus="addPersonnel"-->
          <!--            style="width: 640px"-->
          <!--          >-->
          <!--            <el-option-->
          <!--              v-for="item in gradeList2"-->
          <!--              :key="item.value"-->
          <!--              :label="item.label"-->
          <!--              :value="item.value"-->
          <!--            ></el-option>-->
          <!--          </datablau-select>-->
        </el-form-item>
        <el-form-item :label="'备注'" prop="remarks">
          <datablau-input
            v-model="searchForm.remarks"
            clearable
            type="textarea"
            :iconfont-state="true"
            style="width: 640px; height: 100px"
            :placeholder="'请输入'"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <div class="strategyControl">
        <div class="">
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="el-dropdown-link batch">
              批量修改
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-for="k in policyList"
                :key="k.value"
                :command="k.value"
              >
                <span :class="[k.value, 'spanBox']"></span>
                {{ k.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <div class="control">策略管控</div>
        </div>
        <div class="strategy">
          <div class="boxBg">
            <div>
              <span v-for="item in policyList" :key="item.value">
                {{ item.label }}
              </span>
            </div>
          </div>
          <ul>
            <li v-for="item in strategyList" :key="item.titleName">
              <span>
                <i class="iconfont icon-Policyctrl celveguankong"></i>
                {{ item.titleName }}
              </span>
              <div>
                <div
                  v-for="k in policyList"
                  :key="k.value"
                  :class="['default', { checked: item.rulesType === k.value }]"
                  @click="setValue(item, k.value)"
                ></div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <template slot="buttons">
        <div class="left-button">
          <datablau-button
            type="important"
            @click="primary"
            :disabled="this.noEmpty.length !== 0"
          >
            {{ $t('common.button.save') }}
          </datablau-button>
          <datablau-button
            type="cancel"
            class="white-btn"
            @click="cancel"
          ></datablau-button>
        </div>
      </template>
    </datablau-form-submit>
    <selectClassification
      :fication="fication"
      @close="close"
      @sure="sure"
    ></selectClassification>
  </div>
</template>

<script>
import selectClassification from './selectClassification'
import HTTP from '@/view/dataSecurity/util/api'
import {
  AttrsTypeEnum,
  assetsTypeEnum,
} from '@/view/dataSecurity/util/attrEnum.ts'
export default {
  components: { selectClassification },
  props: {
    rulesItem: {
      type: Object,
      default: () => {},
    },
    oldRulesItem: {
      type: Object,
      default: () => {},
    },
    gradeList: {
      type: Array,
    },
  },
  watch: {
    rulesItem: {
      handler(val) {
        let { item, list } = val
        this.$nextTick(() => {
          this.$refs.form && this.$refs.form.clearValidate()
        })
        if (!item) {
          return
        }
        item.name =
          item.whiteListName &&
          JSON.parse(item.whiteListName)
            .map(k => k.fullUserName)
            .join('，')
        this.searchForm = (item && _.cloneDeep(item)) || {}
        this.getControl(this.searchForm)
      },
      deep: true,
      immediate: true,
    },
    strategyList: {
      handler() {
        this.noEmpty = this.strategyList.filter(item => !item.rulesType)
      },
      deep: true,
      immediate: true,
    },
  },
  data() {
    return {
      searchForm: {},
      options: [], /// 数据安全分类
      // gradeList: [], /// 数据安全等级
      impactDegree: [
        { label: '高', value: 'HIGH' },
        { label: '中', value: 'MIDDLE' },
        { label: '低', value: 'LOW' },
      ], /// 数据安全等级
      gradeList2: [], /// 数据安全等级
      bum: [],
      batch: '',
      // batchList: [],
      rules: {
        describes: [
          {
            message: '数据内容描述必填',
            trigger: ['change', 'blur'],
            required: true,
          },
        ],
        // typeId: [
        //   {
        //     message: '数据安全分类必填',
        //     trigger: 'blur',
        //     required: true,
        //   },
        // ],
        securityLevelAName: [
          {
            message: '数据安全等级必填',
            trigger: ['change', 'blur'],
            required: true,
          },
        ],
        impactDegree: [
          {
            message: '事件影响程度必填',
            trigger: ['change', 'blur'],
            required: true,
          },
        ],
      },
      strategyList: [
        { titleName: 'WEB', rulesType: '' },
        { titleName: '邮件', rulesType: '' },
        { titleName: 'IM', rulesType: '' },
        { titleName: '云应用', rulesType: '' },
        { titleName: 'USB', rulesType: '' },
        { titleName: 'FTP', rulesType: '' },
        { titleName: '打印', rulesType: '' },
        { titleName: '共享目录', rulesType: '' },
      ],
      defaultstrategyList: [], // 接口请求的strategyList中的label
      policyList: [
        { value: 'DETER', label: '阻止' },
        { value: 'RELEASE', label: '放行' },
        { value: 'ENCRYPT', label: '加密' },
        { value: 'ALARM', label: '告警' },
        { value: 'APPROVAL', label: '审批' },
        { value: 'AUDIT', label: '审计' },
      ],
      fication: false,
      noEmpty: [],
      // whiteListName: [],
    }
  },
  methods: {
    primary() {
      this.searchForm.securityLevel =
        this.searchForm.securityLevelAName &&
        this.searchForm.securityLevelAName.split('|')[0]
      this.searchForm.securityLevelName =
        this.searchForm.securityLevelAName &&
        this.searchForm.securityLevelAName.split('|')[1]
      // let noEmpty = this.strategyList.filter(item => !item.rulesType)
      if (this.noEmpty.length !== 0) {
        this.$blauShowSuccess('策略管控必需全部选择', 'warning')
        return
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          let flag = true
          this.rulesItem.list &&
            this.rulesItem.list.forEach((item, index) => {
              if (!this.rulesItem.item || index !== this.rulesItem.item.index) {
                if (
                  item.receivingDeptId === this.searchForm.receivingDeptId &&
                  item.securityTypeName === this.searchForm.securityTypeName
                ) {
                  flag = false
                }
              }
            })
          if (!flag) {
            this.$blauShowSuccess('策略规则重复，不允许添加', 'warning')
            return
          }
          this.$emit('addRules', {
            ...this.searchForm,
            securityPolicyControls: this.strategyList,
          })
        }
      })
    },
    cancel() {
      let obj = {
        ...this.searchForm,
        securityPolicyControls: this.strategyList,
      }
      delete obj.name
      delete this.oldRulesItem.item.name
      if (JSON.stringify(this.oldRulesItem.item) !== JSON.stringify(obj)) {
        this.$DatablauCofirm('您还有未保存的内容，确定要取消吗?', '提示', {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        })
          .then(res => {
            this.$emit('cancelbtn', 'noUpdate')
          })
          .catch(e => {})
        return false
      }
      this.$emit('cancelbtn', 'cancelbtn')
      return true
    },
    // 选择安全分类
    selectClass() {
      this.fication = true
    },
    close() {
      this.fication = false
    },
    sure(val) {
      console.log()
      this.$set(this.searchForm, 'securityTypeName', val.name)
      this.$set(this.searchForm, 'typeId', val.id)
      this.fication = false
      this.searchForm.typeId &&
        HTTP.getClassifyDetail(this.searchForm.typeId).then(res => {
          let obj = res.data.securityLevel
          obj &&
            this.$set(
              this.searchForm,
              'securityLevelAName',
              obj.tagId + '|' + obj.name
            )
        })
    },
    addBm() {
      this.$utils.branchSelect.open().then(res => {
        this.$set(this.searchForm, 'receivingDeptId', res.bm)
        this.$set(this.searchForm, 'receivingDeptName', res.fullName)
      })
    },
    addPersonnel() {
      this.$utils.personnelSelect
        .open({
          onlyPeople: true,
          allSafeTags:
            (this.searchForm.whiteListName &&
              JSON.parse(this.searchForm.whiteListName)) ||
            [],
        })
        .then(res => {
          let ary = res.map(item => item.fullUserName)
          let username = res.map(item => item.username)
          this.searchForm.whiteListName = JSON.stringify(
            res.map(item => {
              return {
                fullUserName: item.fullUserName,
                id: item.id,
                username: item.username,
              }
            })
          )

          // this.$set(this.searchForm, 'whiteListName', ary.join('，'))
          this.$set(this.searchForm, 'name', ary.join('，'))
          this.$set(this.searchForm, 'whiteList', username.join(','))
        })
    },
    setValue(item, val) {
      item.rulesType = val
    },
    handleCommand(val) {
      this.strategyList.forEach(item => (item.rulesType = val))
    },
    getControl() {
      let obj = {}
      if (this.searchForm.securityPolicyControls) {
        this.searchForm.securityPolicyControls.forEach(item => {
          let key = item.titleName || item.securityPolicyControlTitleName
          obj[key] = item.rulesType + '|' + (item.id || '')
        })
      }
      HTTP.getControl()
        .then(res => {
          // this.defaultstrategyList = res.data.data
          let data = res.data.data
          this.strategyList = []
          data.forEach(item => {
            let json = {
              titleId: item.id,
              titleName: item.name,
              securityPolicyControlRulesId:
                item.rulesType[0].securityPolicyControlId,
              rulesType: obj[item.name] ? obj[item.name].split('|')[0] : '',
            }
            let ids = obj[item.name]
              ? Number(obj[item.name].split('|')[1])
              : null
            ids && (json.id = ids)
            this.strategyList.push(json)
          })
          this.oldRulesItem.item.securityPolicyControls = _.cloneDeep(
            this.strategyList
          )
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  mounted() {},
}
</script>

<style scoped lang="scss">
.formSub {
  margin-top: 44px;
}

/deep/.row-content {
  padding: 0 20px;
}

/deep/.completeSearch,
/deep/.el-textarea {
  height: 100%;
}
/deep/.formBox .el-textarea__inner {
  height: 100% !important;
}

.strategyControl {
  width: 1254px;
}
.batch {
  float: right;
}
.control {
  width: 170px;
  text-align: right;
  line-height: 32px;
}
.strategy {
  width: 1074px;
  margin-top: 16px;
  margin-left: 180px;
  padding-bottom: 50px;
  .boxBg {
    height: 40px;
    background: #f5f5f5;
    position: relative;
    & > div {
      /*position: absolute;*/
      line-height: 40px;
      transform: translateX(50%);
      /*inset: 0 249px;*/
      display: inline-block;
      margin: 0 auto;
      font-size: 12px;
      color: #555555;
      span {
        display: inline-block;
        width: 96px;
        text-align: center;
      }
    }
  }
  li {
    overflow: hidden;
    border-bottom: 1px solid #dddddd;
    position: relative;
    span {
      /*float: left;*/
      position: absolute;
      left: 10px;
      top: 3px;
      line-height: 48px;
      i {
        margin-right: 5px;
        font-size: 24px;
        color: #dddddd;
        position: relative;
        top: 4px;
      }
    }
    & > div {
      float: left;
      transform: translateX(50%);
      display: inline-block;
    }
    .default {
      cursor: pointer;
      width: 96px;
      height: 48px;
      display: inline-block;
      background: url('~@/assets/images/unCheck.svg') no-repeat center center;
    }
    .checked {
      background: url('~@/assets/images/check.svg') no-repeat center center;
    }
  }
}
/deep/.el-dropdown {
  float: right;
  height: 32px;
  border: 1px solid #ddd;
  text-align: center;
  line-height: 31px;
  font-size: 12px;
  padding: 0 9px;
  cursor: pointer;
}
.spanBox {
  width: 8px;
  height: 8px;
  display: inline-block;
  margin-right: 4px;
  &.DETER {
    background: #a05ee8;
  }
  &.RELEASE {
    background: #f2220a;
  }
  &.ENCRYPT {
    background: #ff7519;
  }
  &.ALARM {
    background: #66bf16;
  }
  &.APPROVAL {
    background: #409eff;
  }
  &.AUDIT {
    background: #02abe0;
  }
}
</style>
