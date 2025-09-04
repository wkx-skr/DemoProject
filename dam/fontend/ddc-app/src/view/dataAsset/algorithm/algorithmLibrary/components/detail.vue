<template>
  <div class="algorithm-detail">
    <div class="content">
      <datablau-detail :column="1">
        <datablau-detail-subtitle
          title="基础属性"
          mt="0px"
          mb="10px"
        ></datablau-detail-subtitle>
        <el-form-item label="算法名称">
          {{ detailContent.algorithmName }}
        </el-form-item>
        <el-form-item label="父级算法">
          {{ detailContent.parentName }}
        </el-form-item>
        <el-form-item label="选择目录">
          {{ detailContent.catalogName }}
        </el-form-item>
        <el-form-item label="描述">
          {{ detailContent.algorithmDescription }}
        </el-form-item>
        <el-form-item label="识别算法类型">正则表达式</el-form-item>

        <el-form-item label="识别算法内容">
          {{ detailContent.algorithmContent.pattern || '' }}
        </el-form-item>
      </datablau-detail>
    </div>
  </div>
</template>

<script>
import API from '@/view/dataAsset/utils/s_api'
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
