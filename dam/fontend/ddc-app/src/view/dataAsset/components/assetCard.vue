<template>
  <el-card
    shadow="never"
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
import report from '@/assets/images/dataAssets/report.svg'
import data_object from '@/assets/images/dataAssets/items.svg'
import table from '@/assets/images/dataAssets/table.svg'
import file from '@/assets/images/dataAssets/file.svg'
import view from '@/assets/images/dataAssets/view.svg'
import index from '@/assets/images/dataAssets/index.svg'
import data_standard from '@/assets/images/dataAssets/standard.svg'
import data_standard_code from '@/assets/images/dataAssets/daima.svg'
import metamodel from '@/assets/images/search/metamodel.png'
import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum'

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
        report,
        data_object,
        table,
        file,
        view,
        index,
        data_standard,
        data_standard_code,
        metamodel,
      },
      dataAssetTypeMap: {
        DATA_OBJECT: this.$t('assets.generalSettings.object'),
        TABLE: this.$t('assets.generalSettings.table'),
        DATA_STANDARD: this.$t('assets.generalSettings.basicStandard'),
        INDEX: this.$t('assets.generalSettings.index'),
        REPORT: this.$t('assets.generalSettings.report'),
        FILE: this.$t('assets.generalSettings.file'),
        VIEW: this.$t('assets.generalSettings.view'),
        DATA_STANDARD_CODE: this.$t('assets.generalSettings.standardCode'),
        METAMODEL_OBJECT: '自定义对象',
      },
    }
  },
  mounted() {
    if (this.assetData.type === AssetsTypeEnum.META_MODEL) {
      this.getMeteObjIcon()
    }
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
    getMeteObjIcon() {
      let key = AssetsTypeEnum.META_MODEL.toLowerCase()
      this.$set(this.images, key, this.images.metamodel)
      // this.images[key] = this.images.view
      // const url = `/metadata/mm/${this.model.metaModelCode}/${this.metaModelObject}`
      // this.$http
      //   .get(url, { responseType: 'blob' })
      //   .then(res => {
      //     if (res.data && res.data.size > 0) {
      //       // 检查返回的blob是否有内容
      //       const blob = new Blob([res.data], { type: 'image/png' })
      //       const iconUrl = URL.createObjectURL(blob)
      //       this.metaModelIcon = iconUrl
      //
      //       this.$once('hook:beforeDestroy', () => {
      //         URL.revokeObjectURL(iconUrl)
      //       })
      //     } else {
      //       this.metaModelIcon = metaModelIcon // 设置默认图标
      //     }
      //   })
      //   .catch(e => {
      //     this.$showFailure(e)
      //   })
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
  background: url('../../../assets/images/dataAssets/tableBg.svg') no-repeat;
  background-size: cover;
}

.view,
.metamodel_object {
  background: url('../../../assets/images/dataAssets/viewBg.svg') no-repeat;
  background-size: cover;
}

.data_object {
  background: url('../../../assets/images/dataAssets/itemsBg.svg');
  background-size: cover;
}

.file {
  background: url('../../../assets/images/dataAssets/tableBg.svg');
  background-size: cover;
}
.doc {
  background: url('../../../assets/images/dataAssets/docBg.svg');
  background-size: cover;
}
.report {
  background: url('../../../assets/images/dataAssets/reportBg.svg');
  background-size: cover;
}
.data_standard {
  background: url('../../../assets/images/dataAssets/standardBg.svg');
  background-size: cover;
}
.data_standard_code {
  background: url('../../../assets/images/dataAssets/codeBg.svg');
  background-size: cover;
}
.index {
  background: url('../../../assets/images/dataAssets/indexBg.svg');
  background-size: cover;
}
</style>
<style>
.asset-card .el-card__body {
  padding: 0;
}
</style>
