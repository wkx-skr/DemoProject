export default {
  data() {
    return {
      rawData: [],
      title: ['业务系统', 'Sales', 'Bom', 'Hr System', 'Financial'],
      subTitle: ['Monitor'],
      complete: [0, 0, 2, 19, 0],
      isComplete: [true, true, false, false, 'success'],
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      this.$http
        .get(
          this.$url + '/service/datablau_jobs/?types=ModelCompareJobDescriptor'
        )
        .then(res => {
          this.rawData = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
