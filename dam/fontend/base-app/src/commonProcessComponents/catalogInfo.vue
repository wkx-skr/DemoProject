<template>
  <div class="apply-form">
    <div class="apply-reason" v-if="formData.reason || formData.applyReason">
      <div class="reason-title">
        <span class="iconfont icon-change change-icon"></span>
        <span class="change-text">{{ $t('userPane.myTodo.applyReason') }}</span>
      </div>
      <div class="reason-content">
        <is-show-tooltip
          :content="
            formData.reason ? formData.reason.value : formData.applyReason.value
          "
        ></is-show-tooltip>
      </div>
    </div>

    <datablau-detail :column="1" labelWidth="120px">
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
  name: 'CatalogInfo',
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
      catalogProcessAttrLabel: {
        catalogName: this.$t('userPane.myTodo.directoryName'),
        catalogType: this.$t('userPane.myTodo.catalogType'),
        catalogPath: this.$t('userPane.myTodo.directoryPath'),
        catalogKeywords: this.$t('userPane.myTodo.keywords'),
        applyReason: this.$t('userPane.myTodo.applyReason'),
        department: this.$t('userPane.myTodo.ownerShip'),
        shareType: this.$t('userPane.myTodo.accessiblePerson'),
        editablePerson: this.$t('userPane.myTodo.editablePerson'),
        abbreviation: this.$t('userPane.myTodo.abbreviation'),
        approverName: this.$t('userPane.myTodo.approverName'),
        directoryStructure: this.$t('userPane.myTodo.directoryStructure'),
        dataSteward: this.$t('userPane.myTodo.dataSteward'),
        describe: this.$t('userPane.myTodo.describe'),
        currentStatus: this.$t('userPane.myTodo.currentStatus'),
        catalogExtensions: this.$t('userPane.myTodo.catalogExtensions'),
        applyName: this.$t('userPane.myTodo.applyName'),
        catalogCode: this.$t('userPane.myTodo.catalogCode'),
        authorityType: this.$t('userPane.myTodo.authorityType'),
      },
    }
  },
  watch: {
    getDetailData: {
      async handler(data) {
        if (data) {
          // const originFormDtos = data.formDtos
          // const dataSteward = originFormDtos.find(
          //   item => item.code == 'dataSteward'
          // )
          // if (dataSteward.value) {
          // const dataStewardRes = await this.$http.post(
          //   `/user/usermanagement/user/getUsersByUsernames`,
          //   [dataSteward.value]
          // )
          // const currentDataSteward = dataStewardRes.data[0]
          // dataSteward.value = `${currentDataSteward.firstName}(${currentDataSteward.username})`
          // }
          const formDtos = await this.handleCatalogProcessAttr(data.formDtos)
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
  methods: {
    // 资产目录发布/资产目录下线 展示的属性
    async handleCatalogProcessAttr(formDtos) {
      let defaultAttrKeys = [
        'catalogName',
        'abbreviation',
        'department',
        'catalogPath',
        'directoryStructure',
        'catalogType',
        'applyName',
        'catalogKeywords',
        'dataSteward',
        'describe',
        'catalogCode',
        'reason',
        'authorityType',
        'catalogExtensions',
      ]

      const attrs = []
      defaultAttrKeys.forEach(async key => {
        const target = formDtos.find(item => item.code === key)
        if (target) {
          if (key === 'catalogExtensions') {
            const extensionValues = JSON.parse(target.value)
            extensionValues.forEach(extension => {
              attrs.push({
                name: extension.proName,
                value: extension.proValue || '-',
                readable: true,
              })
            })
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
    width: calc(100% - 170px);
  }
}
</style>
