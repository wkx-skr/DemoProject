<template>
  <el-card
    shadow="hover"
    class="asset-card"
    :class="[assetData.type.toLowerCase()]"
    @click="handleCardClick"
  >
    <div class="asset-item" @click="handleCardClick">
      <img
        class="asset-img"
        :src="images[assetData.type ? assetData.type.toLowerCase() : '']"
        alt=""
      />
      <div
        style="float: left; margin-top: 10px; margin-left: 10px; color: #555"
      >
        <p class="asset-name">{{ dataAssetTypeMap[assetData.type] }}</p>
        <p class="asset-count">{{ assetData.count }}</p>
      </div>
    </div>
  </el-card>
</template>

<script>
// import reportImg from '/static/images/dataAssets/report.svg'
// import indexImg from '/static/images/dataAssets/index.svg'
// import itemsImg from '/static/images/dataAssets/items.svg'
// import serviceImg from '/static/images/dataAssets/service.svg'
// import standardImg from '/static/images/dataAssets/standard.svg'
// import tableImg from '/static/images/dataAssets/table.svg'
// import fileImg from '/static/images/dataAssets/file.svg'
// import viewImg from '/static/images/dataAssets/view.svg'
// import codeImg from '/static/images/dataAssets/daima.svg'
export default {
  name: 'assetCard',
  props: {
    assetData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      images: {
        report: '/static/images/dataAssets/report.svg',
        index: '/static/images/dataAssets/index.svg',
        data_object: '/static/images/dataAssets/items.svg',
        data_service: '/static/images/dataAssets/service.svg',
        data_standard: '/static/images/dataAssets/standard.svg',
        data_standard_code: '/static/images/dataAssets/daima.svg',
        table: '/static/images/dataAssets/table.svg',
        file: '/static/images/dataAssets/file.svg',
        view: '/static/images/dataAssets/view.svg',
      },
      dataAssetTypeMap: {
        DATA_OBJECT: this.$t('assets.summaryInfo.object'),
        TABLE: this.$t('assets.summaryInfo.table'),
        DATA_STANDARD: this.$t('assets.summaryInfo.basicStandard'),
        INDEX: this.$t('assets.summaryInfo.index'),
        REPORT: this.$t('assets.summaryInfo.report'),
        FILE: this.$t('assets.summaryInfo.file'),
        DATA_SERVICE: this.$t('assets.summaryInfo.service'),
        VIEW: this.$t('assets.summaryInfo.view'),
        DATA_STANDARD_CODE: this.$t('assets.summaryInfo.standardCode'),
      },
    }
  },
  mounted() {
    // console.log(this.assetData)
  },
  methods: {
    handleCardClick() {
      return
      // console.log(this.assetData)
      this.$bus.$emit('changeCatalogTab', {
        name: 'second',
        data: this.assetData,
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.asset-card {
  width: 140px;
  height: 70px;
  margin-right: 10px;
  margin-bottom: 10px;
  border: none;
}
.asset-item {
  position: relative;
  width: 140px;
  height: 70px;
  border-radius: 2px;
  // cursor: pointer;
  .asset-img {
    // position: absolute;
    width: 32px;
    height: 32px;
    margin-top: 15px;
    margin-left: 20px;
    float: left;
  }
  .asset-name {
    font-size: 12px;
  }
  .asset-count {
    font-size: 18px;
  }
}
.table {
  background: url('/static/images/dataAssets/tableBg.svg') no-repeat;
  // border: 1px solid transparent;
  background-size: cover;
  // &:hover {
  //   border: 1px solid rgba(50, 149, 248, 1);
  // }
}
.view {
  background: url('/static/images/dataAssets/viewBg.svg') no-repeat;
  // border: 1px solid transparent;
  background-size: cover;
  // &:hover {
  //   border: 1px solid #4b5cc4;
  // }
}
.data_object {
  background: url('/static/images/dataAssets/itemsBg.svg');
  // border: 1px solid transparent;
  background-size: cover;
  // &:hover {
  //   border: 1px solid #c44ad1;
  // }
}
.file {
  background: url('/static/images/dataAssets/tableBg.svg');
  // border: 1px solid transparent;
  background-size: cover;
  // &:hover {
  //   border: 1px solid rgba(51, 151, 255, 1);
  // }
}
.doc {
  background: url('/static/images/dataAssets/docBg.svg');
  // border: 1px solid transparent;
  background-size: cover;
  // &:hover {
  //   border: 1px solid rgba(65, 194, 114, 1);
  // }
}
.data_service {
  background: url('/static/images/dataAssets/serviceBg.svg');
  // border: 1px solid transparent;
  background-size: cover;
  // &:hover {
  //   border: 1px solid rgba(239, 102, 102, 1);
  // }
}
.data_standard {
  background: url('/static/images/dataAssets/standardBg.svg');
  // border: 1px solid transparent;
  background-size: cover;
  // &:hover {
  //   border: 1px solid #38b48b;
  // }
}
.data_standard_code {
  background: url('/static/images/dataAssets/codeBg.svg');
  background-size: cover;
  border: 1px solid transparent;
  // &:hover {
  //   border: 1px solid #9d5b8b;
  // }
}
.index {
  background: url('/static/images/dataAssets/indexBg.svg');
  // border: 1px solid transparent;
  background-size: cover;
  // &:hover {
  //   border: 1px solid #d1af3e;
  // }
}
.report {
  background: url('/static/images/dataAssets/reportBg.svg');
  // border: 1px solid transparent;
  background-size: cover;
  // &:hover {
  //   border: 1px solid #008899;
  // }
}
</style>
<style>
.asset-card .el-card__body {
  padding: 0;
}
</style>
