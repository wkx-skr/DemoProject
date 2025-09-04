<template>
  <div class="attr-item">
    <span class="item-key">
      <img :src="info.icon" alt="" />
      <!-- <el-tooltip
        v-if="isOpen"
        :content="info.key"
        :open-delay="200"
        placement="top"
      >
        <span>{{ info.key }}</span>
      </el-tooltip> -->
      <span v-if="isOpen">{{ info.key }}</span>
    </span>
    <span class="item-value" v-if="isOpen">
      <is-show-tooltip
        :content="info.value"
        :refName="'name'"
      ></is-show-tooltip>
      <!-- <el-tooltip :content="info.value" :open-delay="200" placement="top">
        <span>{{ info.value }}</span>
      </el-tooltip> -->
    </span>
  </div>
</template>

<script>
import isShowTooltip from '@/view/dataSecurity/components/isShowTooltip.vue'
export default {
  components: {
    isShowTooltip,
  },
  props: {
    info: {
      type: Object,
      default: () => {
        return {}
      },
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {}
  },
  mounted() {},
  methods: {},
}
</script>

<style scoped lang="scss">
.attr-item {
  width: 100%;
  height: 32px;
  line-height: 32px;
  display: flex;
  align-items: center;
  .item-key {
    width: 120px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    margin-right: 16px;
    img {
      margin-right: 4px;
      width: 24px;
      height: 24px;
    }
  }
  .item-value {
    display: flex;
    align-items: center;
    max-width: 192px;
    /deep/ .text-tooltip {
      height: 32px;
    }
  }
}
</style>
