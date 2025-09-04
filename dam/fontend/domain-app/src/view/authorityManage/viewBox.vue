<template>
  <el-card shadow="always" class="view-show-box">
    <div class="name-line view-item">
      <span class="view-name">
        <span-with-tooltip :content="viewData.name"></span-with-tooltip>
      </span>
    </div>
    <el-tooltip
      :content="viewData.description"
      placement="right"
      effect="light"
      :disabled="!viewData.description"
    >
      <div class="view-des view-item">
        <span class="item-title">描述:</span>
        <span class="item-msg view-des-text">
          {{ viewData.description }}
        </span>
      </div>
    </el-tooltip>
    <el-tooltip
      :content="viewData.modelCategoryName"
      placement="right"
      effect="light"
      :disabled="!viewData.modelCategoryName"
    >
      <div class="view-catelog view-item">
        <span class="item-title">所属系统:</span>
        <span class="item-msg view-catelog-text">
          {{ viewData.modelCategoryName }}
        </span>
      </div>
    </el-tooltip>
    <el-tooltip
      :content="viewData.modelName"
      placement="right"
      effect="light"
      :disabled="!viewData.modelName"
    >
      <div class="view-model view-item">
        <span class="item-title">所属数据源:</span>
        <span class="item-msg view-model-text">
          {{ viewData.modelName }}
        </span>
      </div>
    </el-tooltip>
    <el-tooltip
      :content="expireTime"
      placement="right"
      effect="light"
      :disabled="!viewData.expire"
    >
      <div class="view-model view-item">
        <span class="item-title">过期时间:</span>
        <span class="item-msg view-model-text">
          {{ expireTime }}
        </span>
      </div>
    </el-tooltip>
    <div class="option-line">
      <!-- <el-button type="text" v-show="isCreater">编辑</el-button> -->
      <el-button
        type="text"
        v-show="isCreater"
        v-if="!isShared"
        @click="shareView"
      >
        发布
      </el-button>
      <!-- <el-button type="text" v-show="isCreater" v-else>撤销</el-button> -->
      <el-button type="text" v-if="isCreater" @click="handleDeleteView">
        {{ $t('common.button.delete') }}
      </el-button>
      <el-button type="text" v-if="hasAuth" @click="checkView">查看</el-button>
      <!-- <el-button type="text" v-if="hasAuth">复制</el-button> -->
      <!-- <el-button type="text" v-if="!hasAuth">申请</el-button> -->
    </div>
  </el-card>
</template>

<script>
import spanWithTooltip from '@/components/common/spanWithTooltip.vue'
import { setInterval } from 'timers'
export default {
  data() {
    return {
      viewData: null,
    }
  },
  components: {
    spanWithTooltip,
  },
  props: {
    oldviewData: {
      type: Object,
      required: true,
    },
  },
  computed: {
    isCreater() {
      return this.viewData.creator === this.$user.username
    },
    hasAuth() {
      let result = false
      let index = -1
      const sharedUsers = this.viewData.sharedUsers
      if (sharedUsers && Array.isArray(sharedUsers)) {
        index = sharedUsers.findIndex(item => {
          return item === this.$user.username
        })
      }
      if (index !== -1) {
        result = true
      }
      return result
    },
    isShared() {
      return this.viewData.shareable
    },
    expireTime() {
      return this.$timeFormatter(this.viewData.expire)
    },
  },
  beforeMount() {
    this.viewData = _.cloneDeep(this.oldviewData)
  },
  mounted() {},
  methods: {
    shareView() {
      const viewId = this.viewData.uuid
      this.$http
        .put(`${this.$url}/service/vdp/views/${viewId}/share`)
        .then(res => {
          this.viewData = res.data
          this.$showSuccess('发布成功')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    checkView() {
      this.$router.push({
        name: 'dataShow',
        query: {
          viewId: this.oldviewData.uuid,
        },
      })
      this.$emit('checkView', this.viewData)
    },
    deleteView() {
      const viewId = this.viewData.uuid
      this.$http
        .delete(`${this.$url}/service/vdp/views/${viewId}`)
        .then(res => {
          this.$emit('deteleView', this.viewData)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleDeleteView() {
      this.$confirm('视图删除后不可恢复，确认删除？', '提示', {
        type: 'warning',
      })
        .then(() => {
          this.deleteView()
        })
        .catch(e => {
          console.log('cancel')
        })
    },
  },
  watch: {},
}
</script>

<style lang="scss">
.view-show-box {
  // border: 1px solid red;
  // display: inline-block;
  // min-width: 200px;
  // max-width: 500px;
  // width: 33%;
  min-height: 260px;
  box-sizing: border-box;
  margin: 0 40px 30px;
  // border: 1px solid red;
  .name-line {
    margin-bottom: 10px;
  }
  .view-item {
    margin-bottom: 10px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    display: inline-block;
    width: 100%;
    .item-title {
      // display: inline-block;
      // margin-right: 20px;
      // padding-right: 10px;
    }
    .item-msg {
      display: inline-block;
      // max-width: 140px;
    }
  }
}
</style>
