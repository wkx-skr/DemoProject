<template>
  <div>
    <el-dialog
      :visible.sync="showDialog"
      append-to-body
      close-on-click-modal
      class="version-info"
    >
      <setting
        :processId="currentProcessId"
        :formData="formData"
        @saveSet="saveSet"
        @toReturn="toReturn"
        @forceReturn="forceReturn"
        :processName="processName"
      ></setting>
    </el-dialog>
  </div>
</template>

<script>
import HTTP from '@/http/main.js'
import setting from './setting.vue'
export default {
  data() {
    return {
      showDialog: true,
      formData: null,
      processName: '',
    }
  },
  props: {
    currentProcessId: {
      type: [String, Number],
      required: true,
    },
    currentProcessData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  components: {
    setting,
  },
  computed: {},
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      this.processName = this.currentProcessData.name
      const formId = this.currentProcessData.formId || ''
      if (formId) {
        HTTP.getFormDetail({ formId: formId })
          .then(res => {
            const data = res.data
            const arr = []
            if (data && Array.isArray(data)) {
              data.forEach(item => {
                arr.push(item)
              })
            }
            this.formData = arr
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    saveSet(config) {
      this.$emit('saveProcess', config)
    },
    toReturn() {
      this.$confirm('系统可能不会保存您所做的更改。', '确认离开这个页面?', {
        confirmButtonText: '离开',
        callback: action => {
          this.$emit('closeDesign')
          // this.showDialog = false
        },
      })
    },
    forceReturn() {
      this.$emit('closeDesign')
    },
  },
  watch: {},
}
</script>

<style lang="scss" scoped></style>
