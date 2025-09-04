<template>
  <datablau-dialog
    title="审批"
    :visible.sync="dialogVisible"
    width="400px"
    @close="handleClose"
    append-to-body
  >
    <div class="approval-content">
      <el-radio-group v-model="localApprovalStatus" class="approval-options">
        <el-radio :label="2" class="approval-option">
          <span class="approval-text">通过</span>
        </el-radio>
        <el-radio :label="3" class="approval-option">
          <span class="approval-text">驳回</span>
        </el-radio>
      </el-radio-group>
    </div>

    <span slot="footer" class="dialog-footer">
      <datablau-button @click="handleCancel">取消</datablau-button>
      <datablau-button
        type="primary"
        @click="handleConfirm"
        :disabled="!localApprovalStatus"
      >
        确定
      </datablau-button>
    </span>
  </datablau-dialog>
</template>

<script>
export default {
  name: 'ApprovalDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    approvalStatus: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      localApprovalStatus: null,
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(value) {
        if (!value) {
          this.$emit('cancel')
        }
      },
    },
  },
  watch: {
    approvalStatus: {
      handler(newVal) {
        this.localApprovalStatus = newVal
      },
      immediate: true,
    },
    visible: {
      handler(newVal) {
        if (newVal) {
          // 当弹窗打开时，重置选择状态
          this.localApprovalStatus = null
        }
      },
      immediate: true,
    },
  },
  methods: {
    handleConfirm() {
      if (!this.localApprovalStatus) {
        this.$message.warning('请选择审批结果')
        return
      }
      this.$emit('confirm', this.localApprovalStatus)
    },

    handleCancel() {
      this.$emit('cancel')
    },

    handleClose() {
      this.$emit('cancel')
    },
  },
}
</script>

<style scoped lang="scss">
.approval-content {
  padding: 20px 0;

  .approval-options {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .approval-option {
      display: flex;
      align-items: center;

      .approval-text {
        margin-left: 8px;
        font-size: 14px;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
