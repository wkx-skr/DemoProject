<template>
  <div style="width: calc(100% - 160px); margin-top: 0">
    <div class="tags" style="width: 100%">
      <el-tooltip
        v-if="steward"
        :content="steward"
        :open-delay="200"
        placement="top"
      >
        <el-tag
          size="small"
          :closable="editable"
          style="
            margin-right: 10px;
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-top: 5px;
            float: left;
            max-width: calc(100% - 30px);
          "
          @close="closeSteward"
        >
          {{ steward }}
        </el-tag>
      </el-tooltip>
      <el-button
        @click="editSteward"
        type="text"
        icon="iconfont icon-bianji"
        v-if="editable"
        size="mini"
        style="color: #409eff; font-size: 20px; padding: 0; float: left"
      ></el-button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    editable: {
      type: Boolean,
      default: true,
    },
    steward: {
      type: String,
      default: '',
    },
  },
  data() {
    return {}
  },
  mounted() {},
  methods: {
    // 添加
    editSteward() {
      this.$utils.staffSelect
        .open(
          this.steward,
          true,
          undefined,
          undefined,
          !window.setting.tooManyDepartments
        )
        .then(data => {
          this.$emit('saveSteward', data[0])
        })
    },
    closeSteward() {
      this.$emit('saveSteward', {})
    },
  },
}
</script>
<style></style>
