<template>
  <el-dialog
    width="500px"
    :title="$t('domain.code.sendEmailForChange')"
    :visible.sync="emailDialogVisible"
    append-to-body
  >
    {{ $t('domain.code.whetherSendEmail') }}
    <br />
    <el-checkbox v-model="emailForDam">
      {{ $t('domain.code.metaData') }}
    </el-checkbox>
    <el-checkbox v-model="emailForDdm">
      {{ $t('domain.code.modelLib') }}
    </el-checkbox>
    <span slot="footer" class="dialog-footer">
      <el-button size="mini" @click="adopt" type="text">
        {{ $t('domain.code.changeWithoutReport') }}
      </el-button>
      <el-button
        size="mini"
        type="primary"
        @click="adoptAndSendEmail"
        :disabled="!(emailForDam || emailForDdm)"
      >
        {{ $t('domain.code.changeWithReport') }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      emailDialogVisible: false,
      emailForDdm: true,
      emailForDam: true,
    }
  },
  components: {},
  computed: {},
  mounted() {},
  methods: {
    adopt() {
      const para = {
        emailForDam: false,
        emailForDdm: false,
      }
      this.$emit('ifSendMail', para)
    },
    adoptAndSendEmail() {
      const para = {
        emailForDam: this.emailForDam,
        emailForDdm: this.emailForDdm,
      }
      this.$emit('ifSendMail', para)
    },
    showDailog() {
      this.emailDialogVisible = true
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped></style>
