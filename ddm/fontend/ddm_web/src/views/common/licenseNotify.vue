<template>
  <div v-if="license && license.length > 0">
    <div
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
      }
    }
  },
  data () {
    return {
      moment: moment
    }
  }
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

  .proItem1 {
    width: 200px;
  }
}
</style>
<style lang="scss">
//@import '~@/assets/style/base.scss';
@import '~@/next/components/basic/color.sass';

.el-notification.license-notify-right {
  width: 350px;

  .el-notification__group {
    margin-left: 8px;
  }

  .el-notification__content {
    font-size: 12px;
  }

  .el-notification__closeBtn.el-icon-close {
    width: 24px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    margin-top: -4px;

    &:hover {
      color: #409eff;
      background: $table-hover-color;
    }
  }
}
</style>
