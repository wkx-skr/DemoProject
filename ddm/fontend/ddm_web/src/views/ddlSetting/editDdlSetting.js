import HTTP from '@/resource/http.js'
import ddlSetting from '@/views/list/script/ddlSetting.vue'

export default {
  name: 'editDdlSetting',
  props: {
    dbType: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      ddlType: 'create',
      optionAlter: null,
      optionCreate: null,
      hideAlterDbs: ['MongoDB', 'Cassandra'].map(item => item.toLowerCase()),
      loading: false
    }
  },

  components: {
    ddlSetting
  },

  computed: {},

  mounted () {
    this.dataInit()
  },
  destroyed () {
  },
  watch: {},
  methods: {
    changeDdlType (tab) {
      this.ddlType = tab.name
    },
    dataInit () {
      HTTP.getScriptOptionByDbType({ modelType: this.dbType })
        // HTTP.getScriptDefaultOption({ modelType: this.dbType })
        .then(data => {
          console.log(data, 'data')
          data.forEach(item => {
            if (item.type === 'CreateDDL') {
              this.optionCreate = JSON.parse(item.option)
            } else if (item.type === 'AlterDDL') {
              this.optionAlter = JSON.parse(item.option)
            }
          })
        }).catch(e => {
          this.$showFailure(e)
        }).finally(() => {
          this.loading = false
        })
    },
    forEachData (array, options) {
      const forEach = array => {
        array.forEach(item => {
          if (item.children && item.children.length > 0) {
            item.selected = options.has(item.id)
            forEach(item.children)
          } else {
            item.selected = options.has(item.id)
          }
        })
      }
      forEach(array)
    },
    confirmPost () {
      Promise.all([this.saveOptions('create'), this.saveOptions('alter')])
        .then(res => {
          this.$blauShowSuccess('配置保存成功')
          this.removeTab(true)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    saveOptions (type) {
      // {
      //   "id": 0,
      //   "type": "JPA",
      //   "option": "string",
      //   "createTime": "2023-07-10T09:14:11.941Z",
      //   "lastUpdateTime": "2023-07-10T09:14:11.941Z",
      //   "lastModifier": "string",
      //   "modelId": 0,
      //   "modelType": "HIVE"
      // }
      let refCom = type === 'create' ? this.$refs.ddlSettingCreate.$refs.tree : this.$refs.ddlSettingAlter.$refs.tree
      const keys = refCom.getCheckedKeys()
      const halfKeys = refCom.getHalfCheckedKeys()
      let options = new Set(_.concat(keys, halfKeys))
      let option = type === 'create' ? this.optionCreate : this.optionAlter
      this.forEachData(option.children, options)
      let requestBody = {
        // 'id': 0,
        'type': type === 'create' ? 'CreateDDL' : 'AlterDDL', // CreateDDL, JPA, AlterDDL
        'option': JSON.stringify(_.cloneDeep(option)),
        // 'createTime': '2023-07-10T09:14:11.941Z',
        // 'lastUpdateTime': '2023-07-10T09:14:11.941Z',
        // 'lastModifier': 'string',
        'modelId': 0,
        'modelType': this.dbType.toUpperCase()
      }
      return HTTP.saveScriptOptionByDbType({
        requestBody: requestBody
      })
    },
    handleRemoveTab () {
      this.removeTab()
    },
    removeTab (flushList = false) {
      this.$emit('closeEditTab', flushList)
    }
  }
}
