<template>
  <div>
    <datablau-form
      size="mini"
      label-position="right"
      label-width="6em"
      :rules="rules"
      :model="dto"
      ref="mainForm"
    >
      <el-form-item :label="$t('system.systemSetting.enName')" prop="enName">
        <datablau-input
          v-model="dto.enName"
          style="width: 100%"
        ></datablau-input>
      </el-form-item>
      <el-form-item :label="$t('system.systemSetting.cnName')" prop="chName">
        <datablau-input
          v-model="dto.chName"
          style="width: 100%"
        ></datablau-input>
      </el-form-item>
      <el-form-item :label="$t('system.systemSetting.dir')" prop="menuLevel1">
        <el-cascader
          v-model="dto.menuLevel1"
          style="width: 100%"
          :props="{
            label: 'label',
            value: 'value',
            emitPath: true,
          }"
          :options="options"
        ></el-cascader>
      </el-form-item>
      <el-form-item :label="$t('system.systemSetting.type')">
        <!-- <el-radio v-model="dto.pageType" :label="UserPageType.Iframe">
          frame嵌入
        </el-radio>
        <el-radio v-model="dto.pageType" :label="UserPageType.Dashboard">
          驾驶舱
        </el-radio> -->
        <datablau-radio
          v-model="dto.pageType"
          @change="valuechange"
          class="edit-user-page-radio"
        >
          <el-radio :label="UserPageType.Iframe">
            {{ $t('system.systemSetting.frame') }}
          </el-radio>
          <el-radio :label="UserPageType.Dashboard">
            {{ $t('system.systemSetting.dashboard') }}
          </el-radio>
        </datablau-radio>
      </el-form-item>
      <el-form-item
        v-if="dto.pageType === UserPageType.Iframe"
        :label="$t('system.systemSetting.frameLink')"
      >
        <datablau-input
          v-model="dto.iframeSrc"
          style="width: 100%"
        ></datablau-input>
      </el-form-item>
    </datablau-form>
    <div
      class="dialog-bottom"
      slot="footer"
      style="margin-top: 0.1em; overflow: auto"
    >
      <datablau-button @click="removeDto" type="secondary">
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button @click="saveDto" type="important">
        {{ $t('common.button.save') }}
      </datablau-button>
    </div>
  </div>
</template>
<script>
import UserPageType from '@/next/constant/UserPageType'
export default {
  data() {
    const validateEnName = (rule, value, callback) => {
      const pPattern = /^[a-zA-Z]*$/
      if (pPattern.test(value)) {
        callback()
      } else {
        callback(new Error())
      }
    }
    return {
      UserPageType: UserPageType,
      dto: {
        id: null,
        enName: '',
        chName: '',
        menuLevel1: '',
        pageType: UserPageType.Iframe,
        iframeSrc: '',
      },
      options: [],
      rules: {
        enName: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('system.systemSetting.enNameRequired'),
          },
          {
            trigger: 'blur',
            message: this.$t('system.systemSetting.onlyEn'),
            validator: validateEnName,
          },
        ],
        chName: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('system.systemSetting.chNameRequired'),
          },
        ],
        menuLevel1: [
          {
            required: true,
            trigger: 'change',
            message: this.$t('system.systemSetting.dirRequired'),
          },
        ],
      },
    }
  },
  props: {
    preData: {
      required: false,
      type: Object,
    },
  },
  mounted() {
    this.prepareOptions()
    if (this.preData) {
      this.dto.enName = this.preData.enName
      this.dto.chName = this.preData.chName
      this.dto.menuLevel1 = this.preData.menuLevel1
      this.dto.id = this.preData.id
      this.dto.pageType = this.preData.pageType
      this.dto.iframeSrc = this.preData.iframeSrc
    }
  },
  methods: {
    prepareOptions() {
      this.options.push({
        value: 'ddg',
        label: this.$t('common.pageGroup.ddg'),
        children: [
          {
            value: 'domain',
            label: this.$t('common.page.domain'),
            children: [
              {
                value: 'dataStandardDashboard',
                label: this.$t('common.page.dataStandardDashboard'),
              },
              {
                value: 'domain',
                label: this.$t('common.page.domain'),
              },
              {
                value: 'index',
                label: this.$t('common.page.index'),
              },
              {
                value: 'domainLanding',
                label: this.$t('common.page.domainLanding'),
              },
              {
                value: 'statistical',
                label: this.$t('common.page.statistical'),
              },
              {
                value: 'domainSystemSetting',
                label: this.$t('common.page.domainSystemSetting'),
              },
            ],
          },
          {
            value: 'metaData',
            label: this.$t('common.page.metaData'),
            children: [
              {
                value: 'metaData',
                label: this.$t('common.page.metaData'),
              },
              {
                value: 'businessData',
                label: this.$t('common.page.businessData'),
              },
              {
                value: 'dataResource',
                label: this.$t('common.page.dataResource'),
              },
              {
                value: 'lineage',
                label: this.$t('common.page.lineage'),
              },
            ],
          },
          {
            value: 'dataQuality',
            label: this.$t('common.page.dataQuality'),
            children: [
              {
                value: 'dataQualityReport',
                label: this.$t('common.page.dataQualityReport'),
              },
              {
                value: 'ruleManagement',
                label: this.$t('common.page.ruleManagement'),
              },
              {
                value: 'qualityExamineJob',
                label: this.$t('common.page.qualityExamineJob'),
              },
              {
                value: 'repairJobManagement',
                label: this.$t('common.page.repairJobManagement'),
              },
              {
                value: 'settingList',
                label: this.$t('common.page.settingList'),
              },
            ],
          },
          {
            value: 'dataGovernanceIntelligentTools',
            label: this.$t('common.page.dataGovernanceIntelligentTools'),
            children: [
              {
                value: 'dataIntelligentRecognition',
                label: this.$t('common.page.dataIntelligentRecognition'),
              },
            ],
          },
        ],
      })
      // this.options.push({
      //   value: 'dda',
      //   label: this.$t('common.pageGroup.dda'),
      //   children: [
      //     {
      //       value: 'catalog',
      //       label: this.$t('common.page.catalog'),
      //     },
      //     {
      //       value: 'dataService',
      //       label: this.$t('common.page.dataService'),
      //       children: [
      //         {
      //           value: 'myApi',
      //           label: this.$t('common.page.myApi'),
      //         },
      //       ],
      //     },
      //   ],
      // })
      // this.options.push({
      //   value: 'ddm',
      //   label: this.$t('common.pageGroup.ddm'),
      //   children: [
      //     {
      //       value: 'dataModeling',
      //       label: this.$t('common.page.dataModeling'),
      //     },
      //     {
      //       value: 'dataModelingMgr',
      //       label: this.$t('common.page.dataModelingMgr'),
      //     },
      //   ],
      // })
      this.options.push({
        value: 'common',
        label: this.$t('common.pageGroup.common'),
        children: [
          {
            value: 'userPane',
            label: this.$t('common.page.userPane'),
          },
          {
            value: 'process',
            label: this.$t('common.page.process'),
          },
          {
            value: 'systemManage',
            label: this.$t('common.page.systemManage'),
          },
        ],
      })
    },
    saveDto() {
      this.$refs.mainForm.validate(valid => {
        if (valid) {
          this.$emit('save', this.dto)
          this.$emit('close')
        } else {
          return false
        }
      })
    },
    valuechange(val) {
      this.dto.pageType = val
    },
    // 取消按钮的事件
    removeDto() {
      this.$emit('close')
    },
  },
  watch: {
    // 'dto.menuLevel1' is for test
    // 'dto.menuLevel1': {
    //   handler(val) {
    //     this.dto.chName = '自定义页面-' + this.$t(`common.page.${val[val.length - 1]}`)
    //     this.dto.enName = 'User' + val[val.length - 1]
    //     this.dto.iframeSrc = 'http://datablau.cn'
    //   },
    // },
  },
}
</script>
<style scoped="scoped" lang="scss">
.edit-user-page-radio {
  height: 34px;
  line-height: 32px;
}
</style>
