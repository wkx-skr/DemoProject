export default {
  data() {
    return {
      partSelect: {
        domain: false,
        dataSource: false,
        model: false,
      },
      favorArray: [],
      favorMap: {},
      menuMap: null,
      checkboxModel: {},
      typeIdReverseMap: {},
      timeout: null,
      showSetting: false,
    }
  },
  beforeMount() {
    for (const key in this.$version.navTypeId) {
      this.typeIdReverseMap[this.$version.navTypeId[key]] = key
    }
  },
  beforeDestroy() {
    this.$bus.$off('gotMenuMap')
  },
  mounted() {
    this.$bus.$on('gotMenuMap', menuMap => {
      for (const i in menuMap) {
        this.$set(this.checkboxModel, i, false)
      }
      this.menuMap = menuMap
    })
    this.$bus.$emit('getMenuMap')
    this.getData('firstTime')
  },
  methods: {
    goPreview(name) {
      if (name === 'home') {
        const base = location.href.split('#')[0]
        window.open(base + 'ddc.html')
      } else {
        this.$router.push({ name: name })
      }
    },
    setFalse(obj) {
      for (const i in obj) {
        obj[i] = false
      }
    },
    getData() {
      clearTimeout(this.timeout)
      this.timeout = setTimeout(
        () => {
          this.$http
            .get(this.$url + '/service/favor/')
            .then(res => {
              this.favorMap = {}
              this.setFalse(this.checkboxModel)
              res.data.forEach(item => {
                if (item.typeId.toString().includes('8270')) {
                  this.$set(
                    this.checkboxModel,
                    this.typeIdReverseMap[item.typeId],
                    true
                  )
                  this.favorMap[this.typeIdReverseMap[item.typeId]] = item
                }
              })
              this.favorArray = Object.keys(this.favorMap)
              if (this.favorArray.length === 0) {
                this.showSetting = true
              }
            })
            .catch(e => {})
        },
        arguments[0] === 'firstTime' ? 0 : 300
      )
    },
    subscribe(part) {
      if (!this.checkboxModel[part]) {
        this.$http
          .delete(this.$url + `/service/favor/${this.favorMap[part].id}`)
          .then(() => {
            //            this.$message.info('已取消订阅');
          })
          .catch(e => {
            this.$set(this.checkboxModel, 'part', !this.checkboxModel[part])
            this.$showFailure(e)
          })
          .then(() => this.getData())
      } else {
        this.$http
          .post(this.$url + '/service/favor/', {
            objId: 0,
            objectName: 'component:' + part,
            typeId: this.$version.navTypeId[part],
          })
          .then(() => {
            //            this.$message.success('已成功订阅');
          })
          .catch(e => {
            this.$showFailure(e)
            this.$set(this.checkboxModel, 'part', !this.checkboxModel[part])
          })
          .then(() => {
            this.getData()
          })
      }
    },
  },
}
