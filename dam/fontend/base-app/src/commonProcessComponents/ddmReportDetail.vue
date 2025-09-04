<template>
  <div class="apply-form">
    <div class="apply-reason" v-if="(formData.reason || formData.applyReason) && ready">
      <div class="reason-title">
        <span class="iconfont icon-change change-icon"></span>
        <span class="change-text">{{$t('userPane.myTodo.applyReason')}}</span>
      </div>
      <div class="reason-content">
        <is-show-tooltip
          :content="
            formData.reason ? formData.reason.value : formData.applyReason.value
          "
        ></is-show-tooltip>
      </div>
    </div>

    <datablau-detail column="1" labelWidth="120px" v-if="ready">
      <el-form-item
        v-for="item in Object.values(formData).filter(
          item => item.code !== 'reason'
        )"
        class="jjjjjj"
        :label="item.name || catalogProcessAttrLabel[item.code]"
        :key="item.code"
        style="width: 45%"
      >
        <span
          v-if="item.name || catalogProcessAttrLabel[item.code]"
          :style="{
            display: 'inline-block',
            width:
              410 -
              (item.name || catalogProcessAttrLabel[item.code]).length * 20 +
              'px',
          }"
        >
          <is-show-tooltip
            :content="item.value"
            :style="{
              width:
                410 -
                (item.name || catalogProcessAttrLabel[item.code]).length * 20 +
                'px',
            }"
          ></is-show-tooltip>
        </span>
      </el-form-item>
    </datablau-detail>
  </div>
</template>

<script>
import IsShowTooltip from '@/view/dataProperty/meta/isShowTooltip.vue'
export default {
  name: 'ddmReportDetail',
  components: { IsShowTooltip },
  props: {
    getDetailData: {
      type: Object,
      default() {
        return {}
      },
    },
    commonData: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      formData: null,
      catalogProcessAttrLabel: {
        id: '模型报告id',
        name: '模型报告名称',
        // catalogType: '目录类型',
      },
      instanceData: null,
      ready: false,
    }
  },
  watch: {
    commonData: {
      handler(val) {
        // console.log(val, 'val')
        if (val.processInstanceId) {
          this.getInstanceDetail(val.processInstanceId)
        }
      },
      deep: true,
      immediate: true,
    },
    getDetailData: {
      handler(data) {
        // console.log(data, 'data')
        if (data) {
          const formDtos = this.handleCatalogProcessAttr(data.formDtos)
          const formData = {}
          formDtos.forEach(item => {
            formData[item.code] = item
          })
          this.formData = formData
          this.dataFormatter()
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    // 资产目录发布/资产目录下线 展示的属性
    handleCatalogProcessAttr(formDtos) {
      let defaultAttrKeys = [
        '模型报告id',
        '模型报告名称',
      ]
      // let defaultAttrKeys = [
      //   'catalogName',
      //   'abbreviation',
      //   'department',
      //   'catalogPath',
      //   'directoryStructure',
      //   'catalogType',
      //   'applyName',
      //   'catalogKeywords',
      //   'dataSteward',
      //   'describe',
      //   'catalogCode',
      //   'reason',
      //   'authorityType',
      // ]
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
    getInstanceDetail(processInstanceId) {
      this.$http.get(`/ddm/workflow/process/${processInstanceId}`)
        .then(res => {
          this.instanceData = res.data
          this.dataFormatter()

        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    dataFormatter() {
      if (!this.formData) return
      if (!this.instanceData) return
      let itemContent = this.instanceData.itemContent
      try {
        let formData = JSON.parse(itemContent)
        this.formData.id = {
          code: 'id',
          value: formData.id,
          readable: true,
        }
        this.formData.name = {
          code: 'name',
          value: formData.name,
          readable: true,
        }
        this.ready = true
      } catch (e) {
        console.log(e)
      }
    }
  },
}
</script>

<style lang="scss" scoped>
.apply-form {
  padding-top: 20px;
}
.apply-reason {
  height: 32px;
  line-height: 32px;
  margin-top: 10px;
  margin-bottom: 10px;
  .reason-title {
    float: left;
    padding-left: 7px;
    background-color: rgba(64, 158, 255, 0.1);
    width: 80px;
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
      left: 80px;
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
</style>
