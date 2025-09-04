import reStep1 from './reStep1.vue'
import reStep2 from './reStep2.vue'
import reStep3 from './reStep3.vue'
import HTTP from '@/http/main.js'
import Agent from '@/components/dataSource/agent'
import Compare from '@/components/dataSource/compare'
import DatasourceController from '../../../../../../base-components/http/baseController/DatasourceController'

export default {
  mixins: [Agent, Compare],
  props: [
    'tagTree',
    'tagMap',
    'dsEditing',
    'editRow',
    'isReport',
    'isFile',
    'isShareFile',
  ],
  data() {
    return {
      saveLoading: false,
      currentStep: 1,
      step1TestSucceed: false,
      isAdd: false,
      stepData: [
        {
          label: this.$t('meta.reManage.linkInfo'),
          done: false,
          step: 1,
        },
        {
          label: this.$t('meta.reManage.reInfo'),
          done: false,
          step: 2,
        },
        {
          label: this.$t('meta.reManage.reTask'),
          done: false,
          step: 3,
        },
      ],
    }
  },

  components: { reStep1, reStep2, reStep3 },

  computed: {
    step1CanNext() {
      return this.step1TestSucceed && this.$refs.step1?.canNext
    },
    pathArr() {
      let arr = [this.$t('common.page.dataSource')]
      if (!this.dsEditing) {
        arr.push(this.$t('meta.dataSource.add'))
      } else {
        arr.push(this.editRowData.definition)
      }
      return arr
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  methods: {
    noClick(row) {
      let result = false
      if (row.done || this.activeStep === row.step) {
        result = false
      } else {
        result = true
      }
      if (this.activeStep === 3) {
        result = true
      }
      return result
    },
    async changeStepTop(row) {
      if (this.currentStep === 3) return
      if (this.currentStep === row.step) return
      if (row.step < this.currentStep) {
        this.currentStep = row.step
      } else {
        if (!row.done) return
        this.currentStep = row.step
      }
    },
    changeSaveLoading(val) {
      this.saveLoading = val
    },
    // step1 触发的change
    changeStep(step) {
      this.currentStep = step
    },
    async nextStep() {
      if (this.isAdd) {
        let isOk =
          this.$refs.step1.$refs.reEditdsAdd.$refs.jdbcDS.reNextStepCheck()
        if (!isOk) {
          return
        }
        let res = await this.$refs.step1.$refs.reEditdsAdd.getReParam()
        this.$refs.step1.formatParams(res)
      } else {
        this.stepData[0].done = true
        this.$refs.step1.formatParams()
      }
    },
    preStep() {
      if (this.currentStep === 2) {
        this.currentStep = 1
      } else if (this.currentStep === 3) {
        this.currentStep = 2
      }
    },
    step1Test(val, fromTestServer) {
      this.step1TestSucceed = val
      this.isAdd = false
      if (!val && fromTestServer) {
        this.$datablauMessage.error(this.$t('meta.reManage.connectErro'))
      }
      if (!val) {
        this.stepData[1].done = false
      }
    },
    addStep1Test(val) {
      this.step1TestSucceed = val
      this.isAdd = true
    },
    preSave() {
      this.$refs.step2.preSave()
    },
    removetab() {
      this.$emit('removeReTab')
    },
    nodeClick() {
      this.removetab()
    },
    backClick() {
      this.removetab()
    },
  },
  watch: {
    currentStep(step) {
      switch (step) {
        case 1:
          this.$refs.step1.getDatasourceData()
          // this.$refs.step1.dsform.isOld = true
          break
        case 2:
          this.stepData[0].done = true
          break
        case 3:
          this.stepData[1].done = true
          break
      }
    },
    editRow: {
      handler: function (newVal) {
        if (newVal && this.dsEditing) {
          this.editRowData = newVal
        }
      },
      immediate: true,
    },
  },
}
