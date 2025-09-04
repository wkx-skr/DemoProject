<template>
  <div class="policy">
    <datablau-detail-subtitle
      title="基本信息"
      mt="20px"
    ></datablau-detail-subtitle>
    <datablau-form
      class="add-form"
      label-position="right"
      label-width="176px"
      :validateNoScroll="true"
      :model="detailItem"
      ref="addForm"
      :rules="rules"
    >
      <el-form-item prop="name" :label="'安全策略名称'">
        <datablau-input
          v-model="detailItem.name"
          clearable
          style="width: 400px"
          :placeholder="'填写内容'"
        ></datablau-input>
      </el-form-item>
      <el-form-item
        prop="deptName"
        :label="'数据所属部门'"
        :rules="{
          required: true,
          trigger: ['change', 'blur'],
          message: '数据所属部门必填',
        }"
      >
        <datablau-select
          v-model="detailItem.deptName"
          clearable
          class="width"
          maxlength="100"
          readonly
          @focus="addBm"
          style="width: 400px"
        >
          <el-option
            v-for="item in bum"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </datablau-select>
      </el-form-item>
    </datablau-form>
    <datablau-detail-subtitle
      title="策略规则"
      mt="40px"
    ></datablau-detail-subtitle>
    <div>
      <datablau-form label-width="82px" :model="searchForm" :inline="true">
        <datablau-button
          type="important"
          class="documentBox iconfont icon-tianjia"
          @click="documentsClick"
          v-loading="policyLoading"
        >
          新建策略规则
        </datablau-button>
        <el-form-item>
          <datablau-input
            v-model="searchForm.searchContent"
            clearable
            :iconfont-state="true"
            style="width: 250px"
            :placeholder="'搜索数据安全分类、数据内容描述'"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="数据安全等级">
          <datablau-select
            v-model="searchForm.securityLevelName"
            clearable
            filterable
            style="width: 154px"
          >
            <el-option
              v-for="item in options"
              :key="item.tagId"
              :label="item.name"
              :value="item.name"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="事件影响程度">
          <datablau-select
            v-model="searchForm.impactDegree"
            clearable
            filterable
            style="width: 154px"
          >
            <el-option
              v-for="item in severityOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item>
          <datablau-button type="normal" @click="getRulesList">
            查询
          </datablau-button>
        </el-form-item>
      </datablau-form>
    </div>
    <datablau-form-submit class="formSub">
      <datablau-table
        height="100%"
        v-loading="policyLoading"
        :data-selectable="true"
        :show-column-selection="false"
        :data="rulesList"
        tooltip-effect="dark"
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column
          prop="securityTypeName"
          label="数据安全分类"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="securityLevelName"
          label="数据安全等级"
          show-overflow-tooltip
        >
          <template scope="{row}">
            {{ row.securityLevelName || row.securityLevelName }}
          </template>
        </el-table-column>
        <el-table-column
          prop="receivingDeptName"
          label="数据接收部门"
          show-overflow-tooltip
        >
          <!--          <template scope="{row}">-->
          <!--            {{ row.receivingDeptName || row.receivingDeptName }}-->
          <!--          </template>-->
        </el-table-column>
        <el-table-column
          prop="describes"
          label="数据内容描述"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="impactDegree"
          label="事件影响程度"
          show-overflow-tooltip
        >
          <template scope="{row}">
            {{ impactDegree[row.impactDegree] }}
          </template>
        </el-table-column>
        <el-table-column
          prop="impactDegree"
          label="策略管控"
          show-overflow-tooltip
        >
          <template scope="{row}">
            <el-tooltip
              placement="bottom"
              effect="light"
              :open-delay="200"
              popper-class="tooltipBox"
            >
              <div slot="content">
                <div class="controlBox">
                  <div class="conTop">
                    <span>阻止</span>
                    <span>放行</span>
                    <span>加密</span>
                    <span>告警</span>
                    <span>审批</span>
                    <span>审计</span>
                  </div>
                  <ul class="conBottom">
                    <li
                      v-for="item in row.securityPolicyControls"
                      :key="item.id"
                    >
                      <span>
                        <i class="iconfont icon-Policyctrl celveguankong"></i>
                        {{ item.securityPolicyControlTitleName }}
                      </span>
                      <div class="policyList">
                        <!--                        { checked: item.rulesType === k.value }]  @click="setValue(item, k.value)-->
                        <div
                          v-for="k in policyList"
                          :key="k.value"
                          :class="[
                            'default',
                            { checked: item.rulesType === k.value },
                          ]"
                        ></div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <datablau-button type="text">
                <i class="iconfont icon-Policyctrl celveguankong"></i>
                <span class="celveLook">查看</span>
              </datablau-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          prop="assetName"
          label="操作"
          show-overflow-tooltip
          width="80px"
        >
          <template scope="scope">
            <datablau-button type="icon">
              <i
                class="iconfont icon-bianji"
                @click="edit(scope.row, scope.$index)"
              ></i>
            </datablau-button>
            <datablau-button type="icon">
              <i
                :class="['iconfont', 'icon-delete']"
                @click="delet(scope.row, scope.$index)"
              ></i>
            </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
      <template slot="buttons">
        <div class="delectBtn" v-if="handleSelection.length > 0">
          <span class="check-info"></span>
          <span class="footer-row-info">
            当前选中“{{ handleSelection.length }}条”信息，是否
          </span>

          <datablau-button
            type="danger"
            class="el-icon-delete"
            @click="delectAry"
          >
            删除
          </datablau-button>
        </div>
        <div class="left-button" v-else>
          <datablau-button type="important" @click="primary">
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
  </div>
</template>

<script>
import HTTP from '@/view/dataSecurity/util/api'
import { AttrsTypeEnum } from '@/view/dataSecurity/util/attrEnum.ts'
export default {
  props: {
    securityPolicyRulesDtos: {
      type: Object,
    },
    detailItem: {
      type: Object,
      default: () => {},
    },
    oldPolicy: {
      type: Object,
      default: () => {},
    },
    options: {
      type: Array,
    },
  },
  watch: {
    securityPolicyRulesDtos: {
      handler(val) {
        // this.$refs.addForm && this.$refs.addForm.clearValidate()
        if (val.index !== undefined) {
          this.rulesList.forEach((item, index) => {
            if (index === val.index) {
              this.$set(this.rulesList, index, val)
            }
          })
        } else {
          this.rulesList.push(val)
        }
        this.oldList = _.cloneDeep(this.rulesList)
      },
      deep: true,
    },
  },
  data() {
    return {
      bum: [],
      policyLoading: false,
      oldList: [],
      searchForm: {
        // securityTypeName: '',
        // securityLevel: '',
        // impactDegree: '',
      },
      policyList: [
        { value: 'DETER', label: '阻止' },
        { value: 'RELEASE', label: '放行' },
        { value: 'ENCRYPT', label: '加密' },
        { value: 'ALARM', label: '告警' },
        { value: 'APPROVAL', label: '审批' },
        { value: 'AUDIT', label: '审计' },
      ],
      severityOptions: [
        { label: '高', value: 'HIGH' },
        { label: '中', value: 'MIDDLE' },
        { label: '低', value: 'LOW' },
      ], // 事件严重级别
      rules: {
        name: [
          {
            message: '安全策略名称必填',
            trigger: ['change', 'blur'],
            required: true,
          },
        ],
      },
      impactDegree: {
        HIGH: '高',
        MIDDLE: '中',
        LOW: '低',
      },
      rulesList: [],
      handleSelection: [],
      // securityPolicyRulesDtos: [{}], // 表格数据
    }
  },
  methods: {
    // 获取规则列表
    getRulesList() {
      this.policyLoading = true
      let obj = {}
      Object.keys(this.searchForm).forEach(item => {
        this.searchForm[item] && (obj[item] = this.searchForm[item])
      })
      if (Object.keys(obj).length !== 0 && this.oldList.length != 0) {
        let newAry = []
        newAry =
          (obj.searchContent &&
            this.oldList.filter(
              item =>
                item.securityTypeName.indexOf(obj.searchContent) !== -1 ||
                item.describes.indexOf(obj.searchContent) !== -1
            )) ||
          this.oldList
        newAry =
          (obj.securityLevelName &&
            newAry.filter(
              item => item.securityLevelName === obj.securityLevelName
            )) ||
          newAry
        newAry =
          (obj.impactDegree &&
            newAry.filter(item => item.impactDegree === obj.impactDegree)) ||
          newAry
        this.rulesList = newAry
        this.policyLoading = false
        return
      }
      HTTP.rulesList({
        ...obj,
        securityPolicyId: this.detailItem.id,
      })
        .then(res => {
          this.policyLoading = false
          let ary = this.oldList.filter(item => !item.id)
          this.rulesList = [...res.data.data, ...ary]
          this.oldPolicy.securityPolicyRulesDtos = _.cloneDeep([
            ...this.rulesList,
            ...ary,
          ])
        })
        .catch(e => {
          this.policyLoading = false
          this.$showFailure(e)
        })
    },
    // 部门
    addBm() {
      this.$utils.branchSelect.open().then(res => {
        this.$set(this.detailItem, 'deptId', res.bm)
        this.$set(this.detailItem, 'deptName', res.fullName)
      })
    },
    primary() {
      this.detailItem.securityPolicyName = this.detailItem.name
      this.oldList.forEach(item => {
        if (typeof item.whiteList === 'string') {
          item.whiteList = item.whiteList.split(',')
        }
      })
      this.$refs.addForm.validate(valid => {
        if (valid) {
          HTTP.addPolicy({
            ...this.detailItem,
            securityPolicyRulesDtos: this.oldList,
          })
            .then(res => {
              this.$blauShowSuccess('保存成功')
              this.$emit('cancelbtn', 'policyNo')
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      })
    },
    cancel() {
      this.rulesList.forEach(item => {
        delete item.index
        delete item.securityLevelAName
        delete item.name
      })
      let nowList = {
        ...this.detailItem,
        securityPolicyRulesDtos: this.rulesList,
      }
      !this.oldPolicy.securityPolicyRulesDtos &&
        (this.oldPolicy.securityPolicyRulesDtos = [])
      if (JSON.stringify(this.oldPolicy) !== JSON.stringify(nowList)) {
        this.$DatablauCofirm('您还有未保存的内容，确定要取消吗?', '提示', {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        })
          .then(res => {
            this.$emit('cancelbtn', 'policyNo')
          })
          .catch(e => {})
        return false
      }
      this.$emit('cancelbtn', 'policyNo')
      return true
    },
    documentsClick() {
      this.$emit('documentsClick', this.rulesList)
    },
    edit(item, index) {
      item.index = index
      item.securityLevelAName =
        item.securityLevel + '|' + item.securityLevelName
      // item.bum = item.receivingDeptName
      this.$emit('rulesDetail', { item, list: this.rulesList })
    },
    delet(item, index) {
      // 前端删
      if (!item.id && !item.ary) {
        this.$DatablauCofirm('确定要删除吗?', '提示', {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok'),
        })
          .then(() => {
            this.rulesList.splice(index, 1)
          })
          .catch(() => {})
        return
      }
      let ary = item.id ? [item.id] : item.ary
      // this.$DatablauCofirm('确定要删除吗?', '提示', {
      //   type: 'warning',
      //   cancelButtonText: this.$t('common.button.cancel'),
      //   confirmButtonText: this.$t('common.button.ok'),
      // })
      //   .then(res => {
      HTTP.delRules(ary)
        .then(res => {
          this.$blauShowSuccess('删除成功')
          this.getRulesList()
        })
        .catch(e => {
          this.$showFailure(e)
        })
      // })
      // .catch(e => {})
    },
    delectAry() {
      let ary = []
      // this.policyLoading = true
      this.$DatablauCofirm('确定要删除吗?', '提示', {
        type: 'warning',
        cancelButtonText: this.$t('common.button.cancel'),
        confirmButtonText: this.$t('common.button.ok'),
      })
        .then(() => {
          this.handleSelection.forEach((item, index) => {
            !item.id &&
              this.rulesList.forEach((old, key) => {
                if (JSON.stringify(old) == JSON.stringify(item)) {
                  this.rulesList.splice(key, 1)
                }
              })
            item.id && ary.push(item.id)
            this.oldList.forEach((old, key) => {
              if (JSON.stringify(old) == JSON.stringify(item)) {
                this.oldList.splice(key, 1)
              }
            })
          })
          ary.length != 0 && this.delet({ ary: ary })
        })
        .catch(() => {})
    },
    handleSelectionChange(row) {
      this.handleSelection = row
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.detailItem.id && this.getRulesList()
    })
  },
}
</script>

<style scoped lang="scss">
@import '~@/next/components/basic/color.sass';
.policy {
  padding: 0 20px;
}

.formSub {
  margin-top: 328px;
}
/deep/.row-content {
  padding: 0 20px;
}
.documentBox {
  float: right;
}
.check-info {
  width: 14px;
  height: 14px;
  display: inline-block;
  background: $primary-color;
  margin-right: -13px;
  vertical-align: middle;
}
.footer-row-info {
  height: 50px;
  margin-right: 10px;
  &:before {
    content: '\e6da';
    font-family: 'element-icons';
    font-size: 12px;
    font-weight: 200;
    margin-right: 5px;
    vertical-align: middle;
    line-height: 13px;
    color: white;
  }
}
.delectBtn {
  float: left;
  margin-right: 10px;
}

.celveLook {
  position: relative;
  top: -1px;
  left: 2px;
}
.controlBox {
  padding-top: 8px;
  .conTop {
    width: 480px;
    height: 32px;
    background: #f5f5f5;
    padding-left: 113px;
    line-height: 32px;
    span {
      margin-right: 36px;
      font-size: 12px;
    }
  }
  .conBottom {
    li {
      line-height: 32px;
      border-bottom: 1px solid #dddddd;
      span {
        margin-left: 12px;
        i {
          font-size: 20px;
          color: #dddddd;
          position: relative;
          top: 2px;
        }
      }
    }
    & > li:last-child {
      border: 0;
    }
  }
  .policyList {
    float: right;
    margin-right: 27px;
    height: 32px;
  }
  .default {
    /*cursor: pointer;*/
    width: 60px;
    height: 32px;
    display: inline-block;
    background: url('~@/assets/images/unCheck.svg') no-repeat center center;
  }
  .checked {
    background: url('~@/assets/images/check.svg') no-repeat center center;
  }
}
</style>
<style lang="scss">
.tooltipBox.el-tooltip__popper.is-light {
  border: 0 !important;
  box-shadow: 0 0 6px #ccc;
}
.tooltipBox {
  .popper__arrow {
    border: 0 !important;
    box-shadow: 0 0 6px #ccc;
  }
}
</style>
