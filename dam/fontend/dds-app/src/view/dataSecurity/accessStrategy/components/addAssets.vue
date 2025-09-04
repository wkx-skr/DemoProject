<template>
  <div class="select-table-box">
    <div class="table-img"><img :src="imgSrc" /></div>
    <datablau-button
      type="normal"
      class="btn iconfont icon-tianjia"
      @click="showTable"
    >
      {{ name }}
    </datablau-button>
    <!-- <div class="btn" @click="showTable">
      <i class="iconfont icon-tianjia"></i>
      {{ name }}
    </div> -->
  </div>
</template>

<script>
import viewAll from '@/assets/images/strategy/viewAll.svg'
import fieldAll from '@/assets/images/strategy/fieldAll.svg'
export default {
  props: {
    clickAsset: {
      type: Function,
    },
    assetType: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      imgSrc: '',
      name: '',
    }
  },
  watch: {
    assetType(type) {
      this.getType(type)
    },
  },
  mounted() {
    this.getType(this.assetType)
  },
  methods: {
    showTable() {
      this.clickAsset('assetInfo')
    },
    getType(type) {
      switch (type) {
        case 'TABLE':
          this.imgSrc = viewAll
          this.name = this.$t('securityModule.selectTableView')
          break
        case 'COLUMN':
          this.imgSrc = fieldAll
          this.name = this.$t('securityModule.selectColumn')
          break
        default:
          this.imgSrc = viewAll
          break
      }
    },
  },
}
</script>

<style scoped lang="scss">
.select-table-box {
  position: absolute;
  top: 72px;
  left: 0;
  bottom: 0;
  right: 0;
  padding: 0 20px;
  text-align: center;
  .table-img {
    width: 98px;
    height: 112px;
    margin: 0 auto;
    margin-top: 150px;
    img {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
  .btn {
    margin: 0 auto;
    margin-top: 14px;
  }
}
</style>
