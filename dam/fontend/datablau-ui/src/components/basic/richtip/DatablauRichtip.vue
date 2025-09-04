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
import LDMTypes from '@/constant/LDMTypes'
import axios from 'axios'
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
    }
  },
  created() {
    window.getDataTimer = null
  },
  mounted() {},
  computed: {},
  methods: {
    jumpTo() {
      if (this.$route.query.isAssets) {
        // 从资产跳转过来的禁止跳转
        return
      }
      if (this.dataType === LDMTypes.CODE && this.dataId) {
        let query = {
          name: 'code',
          query: {
            code: this.dataId,
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
      this.$skip2Domain(obj.domainId)
    },
    async getCategoryAuth(categoryId) {
      let bool = false
      if (categoryId < 4) {
        bool = true
      } else {
        let auth = await (this.$http || axios).post(
          `/domain/domains/category/getGrant?username=${this.$user.username}&folderId=${categoryId}`
        )
        if (auth.data !== 'NONE') {
          bool = true
        }
      }
      return bool
    },
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
@import '../../color.sass';
@import './richtip.scss';
</style>
