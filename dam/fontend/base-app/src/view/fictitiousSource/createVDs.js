import HTTP from '@/http/main.js'
const validatorName = (rule, value, callback) => {
  const reg = /^[a-zA-Z0-9_]*$/gi
  if (!value) {
    callback(new Error('请填写名称'))
  } else if (!reg.test(value)) {
    callback(new Error('名字仅能包含字母，数字，下划线'))
  }
}
export default {
  data() {
    return {
      fdsContent: {
        name: '',
        displayName: '',
        modelId: '',
        description: '',
      },
      modelsArr: [],
      modelIdChangeable: true,
      disabledModedMap: {}, // 已经创建虚拟数据源的数据源
      vdprules: {
        name: [
          {
            required: true,
            validator: validatorName,
            trigger: 'blur',
          },
        ],
      },
    }
  },
  props: {
    //    choosedObjectId: {
    //      type: Number,
    //      default: ''
    //    },
    currentDataSource: Object,
  },
  components: {},
  computed: {
    submitDisabled() {
      return (
        !this.fdsContent.name ||
        !this.fdsContent.displayName ||
        !this.fdsContent.modelId
      )
    },
  },
  mounted() {
    this.dataInit()
  },
  methods: {
    dataInit() {
      this.fdsContent.name = ''
      this.fdsContent.displayName = ''
      this.fdsContent.modelId = this.currentDataSource.modelId
      this.fdsContent.description = ''

      /* HTTP.getDataSource({
        succesedCallback: (data) => {
          // 过滤jdbc
          if (data && Array.isArray(data)) {
            let arr = [];
            data.forEach(item => {
              if (item.connectionInfo && item.connectionInfo.connectType === 'JDBC') {
                let obj = {
                  id: item.connectionInfo.modelId,
                  name: item.definition
                };
                arr.push(obj)
              }
            });
            this.modelsArr = arr;
          }
        },
        failureCallback: (e) => {
          this.$showFailure(e);
        },
      }); */
      //      this.getAllVds();
      //      this.handleCreateFds()
      /* if (this.choosedObjectId) {
        HTTP.getTableDetail({
          succesedCallback: (data) => {
            if (data.modelId) {
              this.fdsContent.modelId = data.modelId;
              this.modelIdChangeable = false;
            }
          },
          failureCallback: (e) => {
            this.$showFailure(e);
          },
          para: {
            objectId: this.choosedObjectId
          }
        });
      } */
    },
    handleCreateFds() {
      HTTP.createFds({
        succesedCallback: data => {
          this.$showSuccess('创建成功')
          this.$emit('handleCreated')
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
        postBody: this.fdsContent,
      })
    },
    handleCancel() {
      this.$emit('handleCreated')
    },
    getAllVds() {
      HTTP.getFds({
        succesedCallback: data => {
          if (data && Array.isArray(data)) {
            for (const key in this.disabledModedMap) {
              this.disabledModedMap[key] = false
            }
            data.forEach(item => {
              if (item.modelId || item.modelId === 0) {
                this.disabledModedMap[item.modelId + ''] = true
              }
            })
          }
        },
        failureCallback: e => {
          this.$showFailure(e)
        },
      })
    },
  },
  watch: {},
}
