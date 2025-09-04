<template>
  <div v-if="recommendations && recommendations.length > 0">
    <!--<el-button
      size="small"
      @click="recommend"
    >标签推荐</el-button>-->
    {{ $t('meta.DS.tableDetail.tag.tagRecommend') }}
    <span
      v-for="r in recommendations.filter(i => $globalData.tagMap.has(i.tagId))"
      :key="r.id"
      class="item el-tag el-tag--plain el-tag--small"
      @click="bind(r)"
    >
      {{ $globalData.tagMap.get(r.tagId).name }}
    </span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      recommendations: [],
    }
  },
  props: {
    objectType: {
      required: true,
    },
    objectId: {
      required: true,
    },
    objectTags: {},
  },
  mounted() {
    this.recommend()
  },
  methods: {
    recommend() {
      const typeId = this.objectType
      const itemId = this.objectId
      this.$http
        .get(
          this.$url +
            `/service/tags/recommendations/types/${typeId}?itemId=${itemId}`
        )
        .then(res => {
          if (!res.data || res.data.length === 0) {
            this.recommendations = []
            // this.$message.debug('当前数据没有标签可以被推荐')
          } else {
            if (this.objectTags && Array.isArray(this.objectTags)) {
              this.recommendations = res.data.filter(recommendation => {
                return !this.objectTags.includes(recommendation.tagId)
              })
            } else {
              this.recommendations = res.data
            }
          }
        })
    },
    bind(recommendation) {
      this.$confirm(
        this.$t('meta.DS.tableDetail.tag.bindTagTips', {
          tag: this.$globalData.tagMap.get(recommendation.tagId).name,
        }),
        ''
      )
        .then(() => {
          const recommendationId = encodeURIComponent(recommendation.id)
          this.$http
            .post(
              this.$url +
                `/service/tags/recommendations/bind?recommendationId=${recommendationId}`
            )
            .then(() => {
              this.recommend()
              this.$emit('update-tags', {
                name: this.$globalData.tagMap.get(recommendation.tagId).name,
                tagId: recommendation.tagId,
              })
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(() => {
          this.$message.info(this.$t('meta.DS.message.operationCancelled'))
        })
    },
  },
}
</script>

<style scoped lang="scss">
.item {
  border-style: dashed;
  border-width: 1px;
  margin-left: 5px;
  margin-bottom: 5px;
  cursor: pointer;
  &:hover {
    font-weight: bold;
    border-style: solid;
  }
}
</style>
