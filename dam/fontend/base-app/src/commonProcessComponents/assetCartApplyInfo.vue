<template>
  <div class="apply-form">
    <datablau-detail :column="1" labelWidth="120px">
      <el-form-item
        v-for="item in Object.values(formData)"
        class="jjjjjj"
        :label="item.name || applyAttrLabel[item.code]"
        :key="item.code"
        style="width: 45%"
      >
        <span
          v-if="item.name || applyAttrLabel[item.code]"
          :style="{
            display: 'inline-block',
            width: '290px',
          }"
        >
          <span v-if="item.code === 'urgency'">
            {{ item.value === 'true' ? '是' : '否' }}
          </span>
          <is-show-tooltip
            v-else-if="item.code !== 'attachmentName'"
            :content="item.value"
            :style="{
              width:
                410 -
                (item.name || applyAttrLabel[item.code]).length * 20 +
                'px',
            }"
          ></is-show-tooltip>

          <template v-else>
            <div style="margin-top: -8px; display: flex">
              <span style="display: inline-block; max-width: 255px">
                <is-show-tooltip
                  :content="item.value || '暂无附件'"
                  style="float: left; padding-top: 8px"
                ></is-show-tooltip>
              </span>
              <datablau-button
                v-if="item.code === 'attachmentName' && item.value"
                class="iconfont icon-download"
                type="icon"
                style="display: inline-block; margin-left: 4px"
                @click="download"
              ></datablau-button>
            </div>
          </template>
        </span>
      </el-form-item>
    </datablau-detail>
  </div>
</template>

<script>
import IsShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
export default {
  name: 'AssetCartApplyInfo',
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
      applyAttrLabel: {
        getWay: '数据提供方式',
        bm: '数据申请部门',
        purpose: '数据用途',
        urgency: '是否紧急申请',
        timeless: '数据使用有效期',
        expirationTime: '数据使用有效期',
        applyUser: '数据申请人',
        reason: '申请原因',
        remark: '数据资产详细描述',
        attachmentName: '附件',
      },
      purposeMap: {
        BUSINESS_ANALYSIS_AND_DECISION_MAKING: '经营分析与决策',
        DATA_DEVELOP_AND_OPTIMIZE: '数据开发与优化',
        RISK_MANAGE: '风险管理',
        COMPLIANCE_SUPERVISION: '合规监管',
        BUSINESS_EXPLORATION: '业务探索',
        BUSINESS_AUDIT: '业务审计',
        DATA_SUPERVISION_SUBMISSION: '数据监管报送',
        FINANCIAL_ANALYSIS: '财务分析',
        OTHER: '其他',
      },
      getWayMap: {
        ONLINE_ACCESS: '在线访问',
        API: 'API接口',
        BI_REPORT: 'BI报表',
        FILE_PACKAGE: '文件包',
        DB_PUSH: '数据库推送',
      },
      formData: {},
    }
  },
  methods: {
    handleApplyAttr(formDtos) {
      let defaultAttrKeys = [
        'getWay',
        'bm',
        'purpose',
        'urgency',
        'timeless',
        'expirationTime',
        'applyUser',
        'reason',
        'remark',
        'attachmentName',
        'attachmentId',
      ]

      const attrs = []
      defaultAttrKeys.forEach(key => {
        const target = formDtos.find(item => item.code === key)
        if (target) {
          if (key === 'purpose') {
            attrs.push({
              ...target,
              value: this.purposeMap[target.value],
              readable: true,
            })
          } else if (key === 'getWay') {
            attrs.push({
              ...target,
              value: this.getWayMap[target.value],
              readable: true,
            })
          } else if (key === 'attachmentId') {
            attrs.push({
              ...target,
              readable: false,
            })
          } else if (key === 'timeless') {
            // 长期或自定义
            // 30天/60天/90天
            // 30 * 24 * 3600 * 1000
            const days = target.value / (24 * 3600 * 1000)
            attrs.push({
              ...target,
              value: days + '天',
              readable: true,
            })
          } else if (key === 'expirationTime') {
            attrs.push({
              ...target,
              value:
                target.value.indexOf('2099') !== -1
                  ? '长期'
                  : this.$timeFormatter(new Date(target.value).getTime()),
              readable: true,
            })
          } else if (key === 'applyUser') {
            attrs.push({
              ...target,
              readable: true,
            })
            if (target.value) {
              this.$http
                .get(
                  `/user/usermanagement/user/getUserByUsername?username=${target.value}`
                )
                .then(res => {
                  this.formData.applyUser.value = res.data.fullUserName
                })
            }
          } else {
            attrs.push({
              ...target,
              readable: true,
            })
          }
        }
      })
      return attrs
    },
    download() {
      console.log(this.formData.attachmentId)
      const url =
        '/base/files/download?fileId=' + this.formData.attachmentId.value
      this.$downloadFilePost(url)
    },
  },
  watch: {
    getDetailData: {
      handler(data) {
        if (data) {
          const formDtos = this.handleApplyAttr(data.formDtos)
          const formData = {}
          formDtos.forEach(item => {
            formData[item.code] = item
          })
          this.formData = formData
        }
      },
      deep: true,
      immediate: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.apply-form {
  padding-top: 16px;
}
</style>
