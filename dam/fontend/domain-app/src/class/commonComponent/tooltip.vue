<template>
  <div>
    <!--    <el-tooltip-->
    <!--      placement="top"-->
    <!--    >-->
    <div>{{ displayName }}</div>
    <!--      <div slot="content">-->
    <!--        <categoryDetail-->
    <!--          v-if="TooltipType.CategoryDetail === type"-->
    <!--          :data-id="dataId"-->
    <!--        ></categoryDetail>-->
    <!--        <div v-else>else</div>-->
    <!--      </div>-->
    <!--    </el-tooltip>-->
  </div>
</template>

<script>
import TooltipType from '@/class/constant/TooltipType'
import categoryDetail from '@/class/category/categoryDetail.vue'
import { basicFormatter } from '@/class/category/CategoryFormatter'

export default {
  props: {
    type: {
      type: Number,
      required: true,
    },
    dataId: {
      type: Number,
      required: true,
    },
  },
  components: {
    categoryDetail,
  },
  data() {
    return {
      TooltipType: TooltipType,
    }
  },
  mounted() {
    switch (this.type) {
      case TooltipType.CategoryDetail:
        // this.get
        break
      default:
        break
    }
  },
  methods: {},
  computed: {
    displayName() {
      switch (this.type) {
        case TooltipType.CategoryDetail:
          return basicFormatter(this.dataId, this.$modelCategoriesDetailsMap)
        default:
          console.error(this.$t('meta.DS.message.tooltipError'))
          return ''
      }
    },
  },
}
</script>

<style scoped></style>
