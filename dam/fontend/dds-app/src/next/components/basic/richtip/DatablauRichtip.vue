<template>
  <div class="db-richtip" v-loading="showLoading">
    <el-popover
      :test-name="testName"
      :placement="placement"
      :width="`${width}`"
      trigger="hover"
      :open-delay="500"
      :offset="30"
      popper-class="richtip-popper"
      @show="showPopover"
      @mouseover.native="getData"
      @click.native="jumpTo"
      :disabled="!typesSupportTooltip.includes(this.dataType)"
    >
      <component
        v-bind="$attrs"
        v-on="$listeners"
        ref="componentRef"
        :is="LDMTypes[dataType]"
        :data-id="dataId"
        :data-object="dataObject"
        :categoryId="categoryId"
      ></component>
      <span
        class="popBase"
        :class="{
          'support-click': typesSupportJump.includes(this.dataType),
        }"
        slot="reference"
      >
        {{ label }}
      </span>
    </el-popover>
  </div>
</template>

<script>
import components from './components/components'
import LDMTypes from '@constant/LDMTypes'
import HTTP from '@/http/main'
export default {
  name: 'DatablauLink',
  props: {
    testName: String,
    dataType: {
      type: Number,
    },
    categoryId: {
      type: [String, Number],
      default: 1,
    },
    dataId: {
      type: [String, Number],
      default: '',
    },
    dataObject: {
      type: Object,
      required: false,
    },
    label: {
      type: String,
    },
    placement: {
      type: String,
      default: 'right',
    },
    width: {
      type: [String, Number],
      default: 480,
    },
  },
  components: {
    ...components,
  },
  data() {
    return {
      LDMTypes: LDMTypes,
      visible: true,
      showLoading: false,
      // 将tooltip已开发的资产类型放置在下面的数组中
      typesSupportTooltip: [LDMTypes.CODE, LDMTypes.ModelMart],
      // 将支持跳转的资产类型放置在下面的数组中
      typesSupportJump: [LDMTypes.CODE, LDMTypes.Domain],
      isAssets: '',
    }
  },
  created() {
    window.getDataTimer = null
  },
  mounted() {
    if (this.$route.query.isAssets) {
      this.isAssets = this.$route.query.isAssets
    }
  },
  computed: {},
  methods: {
    jumpTo() {
      if (this.dataType === LDMTypes.CODE && this.dataId) {
        let query = {
          name: 'code',
          query: {
            code: this.dataId,
            isAssets: this.isAssets,
          },
        }
        this.$skip2(query)
      } else if (this.dataType === LDMTypes.Domain) {
        this.jumpToDomains(this.dataObject)
      } else {
        throw new Error('unhandled type' + LDMTypes[this.dataType])
      }
    },
    jumpToDomains(obj) {
      console.log('跳转')
      // 暂注释
      // this.$skip2Domain(obj.domainId, this.isAssets)
    },
    async getCategoryAuth(categoryId) {
      let bool = false
      if (categoryId < 4) {
        bool = true
      } else {
        let auth = await HTTP.getFolderAuthService({
          username: this.$user.username,
          folderId: categoryId,
        })
        if (auth.data !== 'NONE') {
          bool = true
        }
      }
      return bool
    },
    /* setWidth() {
      let dom = $(this.$refs.componentRef.$el).find('.topInfo .info-form')
      dom.each((idx, d1) => {
        $(d1)
          .find('.el-form-item.info-form-span')
          .each((i, d) => {
            const formWidth = $(d).width()
            const labelWidth = $(d).find('.el-form-item__label').width()
            const content = $(d).find('.el-form-item__content')
            content.css('width', formWidth - labelWidth)
          })
        // 单行
        $(d1)
          .find('.el-form-item.info-form-span.form_oneline')
          .each((i, d) => {
            const formWidth = $(d1).width()
            const labelWidth = $(d).find('.el-form-item__label').width()
            const content = $(d).find('.el-form-item__content')
            content.css('width', formWidth - labelWidth)
          })
      })
    }, */
    showPopover() {
      this.$nextTick(() => {
        // this.setWidth()
      })
    },
    getData() {
      clearTimeout(window.getDataTimer)
      window.getDataTimer = setTimeout(() => {
        if (this.typesSupportTooltip.includes(this.dataType)) {
          this.$refs.componentRef.getData()
        }
      }, 500)
    },
  },
}
</script>

<style lang="scss">
@import '../../basic/color.sass';
@import './richtip.scss';
</style>
