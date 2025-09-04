<template>
  <div>
    <div class="apply-reason" v-if="formData.reason || formData.applyReason">
      <div class="reason-title">
        <span class="iconfont icon-change change-icon"></span>
        <span class="change-text">
          {{ $t('userPane.myTodo.changeReason') }}
        </span>
      </div>
      <div class="reason-content">
        <is-show-tooltip
          :content="
            formData.reason ? formData.reason.value : formData.applyReason.value
          "
        ></is-show-tooltip>
      </div>
    </div>

    <el-row :gutter="10">
      <el-col :span="12">
        <div
          style="
            width: 450px;
            height: 34px;
            line-height: 34px;
            background: #f5f5f5;
            text-align: center;
          "
        >
          {{ $t('userPane.myTodo.beforeChange') }}
        </div>
        <datablau-detail
          :column="2"
          class="page-form"
          ref="form"
          :model="formData"
          inline
        >
          <el-form-item
            style="width: 40%"
            v-for="item in Object.keys(catalogChangeProcessAttrLabel)"
            label-width="100"
            class="jjjjjj"
            :class="{
              oldChange: isCatalogChange(
                item,
                formData.oldCatalogData[item],
                formData.newCatalogData[item]
              ),
            }"
            :key="item"
            :label="catalogChangeProcessAttrLabel[item]"
          >
            <span
              v-if="catalogChangeProcessAttrLabel[item]"
              :style="{
                display: 'inline-block',
              }"
            >
              <is-show-tooltip
                :content="
                  formatCatalogValue(item, formData.oldCatalogData[item])
                "
                :style="{
                  width:
                    220 -
                    catalogChangeProcessAttrLabel[item].length * 20 +
                    'px',
                }"
              ></is-show-tooltip>
            </span>
          </el-form-item>
        </datablau-detail>
      </el-col>
      <el-col :span="12">
        <div
          style="
            width: 450px;
            height: 34px;
            line-height: 34px;
            color: #66bf16;
            background: rgba(102, 191, 22, 0.1);
            text-align: center;
          "
        >
          {{ $t('userPane.myTodo.afterChange') }}
        </div>
        <datablau-detail
          :column="2"
          class="page-form"
          ref="form"
          :model="formData"
          inline
        >
          <el-form-item
            style="width: 40%"
            v-for="item in Object.keys(catalogChangeProcessAttrLabel)"
            label-width="100"
            class="jjjjjj"
            :class="{
              newChange: isCatalogChange(
                item,
                formData.oldCatalogData[item],
                formData.newCatalogData[item]
              ),
            }"
            :key="item"
            :label="catalogChangeProcessAttrLabel[item]"
          >
            <span
              v-if="catalogChangeProcessAttrLabel[item]"
              :style="{
                display: 'inline-block',
              }"
            >
              <is-show-tooltip
                :style="{
                  width:
                    220 -
                    catalogChangeProcessAttrLabel[item].length * 20 +
                    'px',
                }"
                :content="
                  formatCatalogValue(item, formData.newCatalogData[item])
                "
              ></is-show-tooltip>
            </span>
          </el-form-item>
        </datablau-detail>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import IsShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
export default {
  name: 'CatalogCompare',
  components: { IsShowTooltip },
  props: {
    getDetailData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      formData: {},
      catalogChangeProcessAttrLabel: {
        catalogName: '目录名称',
        catalogType: '目录类型',
        catalogPath: '目录路径',
        catalogKeywords: '关键词',
        // applyReason: '申请原因',
        department: '数据权属',
        abbreviation: '英文简称',
        // approverName: '数据审批人',
        approver: '数据审批人',
        directoryStructure: '资产目录空间',
        // dataSteward: '数据管家',
        butler: '数据管家',
        describe: '描述',
        currentStatus: '目录状态',
        // catalogExtensions: '扩展属性',
        catalogCode: '目录编号',
        applyType: '变更方式',
      },
    }
  },
  watch: {
    getDetailData: {
      async handler(data) {
        if (data) {
          const formDtos = this.handleCatalogProcessAttr(data.formDtos)
          const formData = {}
          formDtos.forEach(item => {
            formData[item.code] = item
          })
          let { oldCatalogData, newCatalogData } = formData
          oldCatalogData = JSON.parse(oldCatalogData.value)
          newCatalogData = JSON.parse(newCatalogData.value)
          const userRes = await this.$http.post(
            `/user/usermanagement/user/getUsersByUsernames`,
            [
              oldCatalogData.butler,
              oldCatalogData.approver,
              newCatalogData.butler,
              newCatalogData.approver,
            ]
          )
          ;['butler', 'approver'].forEach(key => {
            if (oldCatalogData[key]) {
              const currentUser = userRes.data.find(
                user => user.username === oldCatalogData[key]
              )
              if (currentUser) {
                oldCatalogData[
                  key
                ] = `${currentUser.firstName}(${currentUser.username})`
              }
            }
            if (newCatalogData[key]) {
              const currentUser = userRes.data.find(
                user => user.username === newCatalogData[key]
              )
              if (currentUser) {
                newCatalogData[
                  key
                ] = `${currentUser.firstName}(${currentUser.username})`
              }
            }
          })

          if (oldCatalogData.catalogExtensions) {
            const catalogExtensions = oldCatalogData.catalogExtensions
            catalogExtensions.forEach(item => {
              oldCatalogData[item.proName] = String(item.proValue)
              this.$set(
                this.catalogChangeProcessAttrLabel,
                item.proName,
                item.proName
              )
            })
          }
          if (newCatalogData.catalogExtensions) {
            const catalogExtensions = newCatalogData.catalogExtensions
            catalogExtensions.forEach(item => {
              newCatalogData[item.proName] = String(item.proValue)
              this.$set(
                this.catalogChangeProcessAttrLabel,
                item.proName,
                item.proName
              )
            })
          }
          formData.oldCatalogData = oldCatalogData
          formData.newCatalogData = newCatalogData
          ;[
            'deptId',
            'catalogId',
            'approver',
            'applyReason',
            'approverId',
            'reviewer',
            'bm',
          ].forEach(item => {
            delete formData.oldCatalogData[item]
            delete formData.newCatalogData[item]
          })
          this.formData = formData
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    // 资产目录发布/资产目录下线 展示的属性
    handleCatalogProcessAttr(formDtos) {
      let defaultAttrKeys = ['oldCatalogData', 'newCatalogData', 'reason']
      const attrs = []
      defaultAttrKeys.forEach(key => {
        const target = formDtos.find(item => item.code === key)
        if (target) {
          attrs.push({
            ...target,
            readable: true,
          })
        }
      })
      return attrs
    },
    isCatalogChange(key, oldVal, newVal) {
      return (
        this.formatCatalogValue(key, oldVal) !==
        this.formatCatalogValue(key, newVal)
      )
    },
    formatCatalogValue(key, value) {
      if (key === 'currentStatus') return this.transState(value)
      return value
    },
    transState(type) {
      if (type === 'UNPUBLISHED') {
        return '未发布'
      } else if (type === 'UNDER_REVIEW') {
        return '审核中'
      } else if (type === 'PUBLISHED') {
        return '已发布'
      } else if (type === 'OFFLINE') {
        return '已下线'
      } else {
        return '未发布'
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.apply-reason {
  height: 32px;
  line-height: 32px;
  margin-top: 10px;
  margin-bottom: 10px;
  .reason-title {
    float: left;
    padding-left: 7px;
    background-color: rgba(64, 158, 255, 0.1);
    // width: 80px;
    font-size: 12px;
    color: #555;
    font-weight: 500;
    &:after {
      content: '';
      width: 0px;
      height: 0px;
      border-top: 16px solid transparent;
      border-bottom: 16px solid transparent;
      border-left: 16px solid rgba(64, 158, 255, 0.1);
      position: absolute;
      top: 9px;
      // left: 80px;
    }
    .change-icon {
      font-size: 16px;
      color: #409eff;
      line-height: 32px;
      float: left;
    }
    .change-text {
      display: inline-block;
      line-height: 32px;
      margin-left: 7px;
    }
  }
  .reason-content {
    float: left;
    margin-left: 20px;
    width: calc(100% - 100px);
  }
}
.oldChange {
  background: rgb(254, 240, 240);
}
.newChange {
  background: rgb(240, 249, 235);
}
/deep/ .el-form--inline .el-form-item {
  margin-right: 0;
  padding-right: 10px;
}
</style>
