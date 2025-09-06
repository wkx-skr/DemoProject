<template>
  <div>
    <div
      v-if="license.length"
      class="licenseWrap"
      v-for="item in license"
      :key="item.name"
    >
      <div class="proItem">
        <span>产品：</span>
        <span>{{ item.featureName }}</span>
      </div>
      <div class="proItem1">
        <span>到期时间：</span>
        <span>{{ moment(item.expireDate).format('YYYY-MM-DD') }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  props: {
    license: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data() {
    return {
      moment: moment,
    }
  },
}
</script>

<style scoped lang="scss">
.licenseWrap {
  display: flex;
  height: 36px;
  line-height: 36px;
  border-bottom: 1px solid #ddd;
  &:last-child {
    border: none;
  }
  .proItem {
    width: 136px;
    margin-right: 10px;
  }
}
</style>
