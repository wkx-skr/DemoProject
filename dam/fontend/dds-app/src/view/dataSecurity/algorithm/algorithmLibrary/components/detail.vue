<template>
  <div class="algorithm-detail">
    <div class="content">
      <datablau-detail :column="1">
        <datablau-detail-subtitle
          :title="$t('algorithm.baseAttr')"
          mt="0px"
          mb="10px"
        ></datablau-detail-subtitle>
        <el-form-item :label="$t('algorithm.algorithmName')">
          {{ detailContent.algorithmName }}
        </el-form-item>
        <el-form-item :label="$t('algorithm.fatherAlName1')">
          {{ detailContent.parentName }}
        </el-form-item>
        <el-form-item :label="$t('securityModule.selectCatalog')">
          {{ detailContent.catalogName }}
        </el-form-item>
        <el-form-item :label="$t('securityModule.des')">
          {{ detailContent.algorithmDescription }}
        </el-form-item>
        <el-form-item :label="$t('algorithm.algorithmType')">
          {{ $t('algorithm.expression') }}
        </el-form-item>

        <el-form-item :label="$t('algorithm.algorithmContent')">
          {{ detailContent.algorithmContent.pattern || '' }}
        </el-form-item>
      </datablau-detail>
    </div>
  </div>
</template>

<script>
import API from '@/view/dataSecurity/util/api'
export default {
  props: {
    id: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      detailContent: {
        algorithmContent: {
          pattern: '',
        },
      },
    }
  },
  mounted() {
    this.getAlgorithmDetail()
  },
  methods: {
    getAlgorithmDetail() {
      API.getAlgorithmDetail(this.id, true)
        .then(res => {
          this.detailContent = res.data.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>

<style lang="scss" scoped>
.algorithm-detail {
  position: absolute;
  top: -8px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9;
  background: #fff;
  .content {
    margin-top: 20px;
    /deep/ .detail-form {
      .el-form-item {
        display: block;
      }
    }
  }
}
</style>
