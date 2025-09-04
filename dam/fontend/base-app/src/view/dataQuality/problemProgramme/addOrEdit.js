export default {
  components: {},
  props: ['type', 'detailId'],
  data() {
    return {
      form: {
        name: '',
        description: '',
        dispatchData: [
          {
            data: '',
            owner: '',
          },
        ],
      },
      rules: {
        name: [
          {
            required: true,
            message: this.$t(
              'quality.page.problemProgramme.detail.schemePlaceholder'
            ),
            trigger: 'blur',
          },
        ],
        description: [
          {
            required: true,
            message: this.$t(
              'quality.page.problemProgramme.detail.descriptionPlaceholder'
            ),
            trigger: 'blur',
          },
        ],
      },
      disabledConfirm: true,
    }
  },
  mounted() {
    if (this.detailId) {
      this.getDetailDispatch()
    }
  },
  beforeDestroy() {},
  methods: {
    getDetailDispatch() {
      this.$http
        .post(
          this.$quality_url +
            `/quality/dispatch/getDetailDispatch?id=${this.detailId}`
        )
        .then(res => {
          let data = res.data
          this.form = data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    commitForm(form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          if (
            this.form.dispatchData[0].data === '' ||
            this.form.dispatchData[0].owner === ''
          ) {
            this.$message.warning(
              this.$t('quality.page.problemProgramme.detail.warningTip')
            )
            return false
          }
          for (var key in this.form.dispatchData) {
            if (
              (this.form.dispatchData[key].data === null ||
                this.form.dispatchData[key].data === '') &&
              (this.form.dispatchData[key].owner === null ||
                this.form.dispatchData[key].owner === '')
            ) {
              delete this.form.dispatchData[key]
            }
          }
          for (let i = 0; i < this.form.dispatchData.length; i++) {
            if (this.form.dispatchData[i] === undefined) {
              this.form.dispatchData.splice(i, 1)
              i = i - 1
            }
          }
          let obj = {
            name: this.form.name,
            description: this.form.description,
            dispatchData: this.form.dispatchData,
          }
          if (this.type === 'edit') {
            obj.id = this.form.id
          }
          this.$http
            .post(
              this.$quality_url + `/quality/dispatch/createOrUpdateDispatch`,
              obj
            )
            .then(res => {
              if (this.type === 'edit') {
                this.$message.success(
                  this.$t('quality.page.problemProgramme.detail.changed')
                )
              } else {
                this.$message.success(
                  this.$t('quality.page.problemProgramme.detail.appended')
                )
              }
              this.$emit('removeTab')
            })
            .catch(e => {
              this.$showFailure(e)
            })
        }
      })
    },
    cancel() {
      this.$emit('removeTab')
    },
    selectSubmitter2(index) {
      this.$utils.staffSelect.open([], true).then(res => {
        this.form.dispatchData[index].owner = res[0].username
      })
    },
    addClick(index) {
      this.form.dispatchData.splice(index + 1, 0, {
        data: '',
        owner: '',
      })
    },
    deleteClick(index) {
      this.form.dispatchData.splice(index, 1)
    },
  },
  computed: {},
  watch: {},
}
