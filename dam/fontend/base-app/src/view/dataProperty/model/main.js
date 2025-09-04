import Details from './details.vue'
import { UUID } from 'uuidjs'
export default {
  name: 'MetaModel',
  components: { Details },
  data() {
    return {
      uploadUrl: '',
      modelList: [],
      currentModelId: null,
      showDetails: false,
      showAddModelDialog: false,
      modelData: {
        Name: '',
        Definition: '',
        Code: '',
      },
      modelRules: {
        Code: [
          {
            required: true,
            trigger: 'blur',
            message: '请输入代码',
          },
        ],
        Name: [
          {
            required: true,
            trigger: 'blur',
            message: '请输入名称',
          },
        ],
      },
      uploadDialogVisible: false,
      formFile: [],
    }
  },
  mounted() {
    this.getModelList()
  },
  methods: {
    toShowUploadDialog(id) {
      this.uploadDialogVisible = true
      this.uploadUrl = `/metadata/mm/importMetaModel/${id}`
    },
    handleUploadChange(e) {
      // console.log(e)
      if (e.status === 'success') {
        // this.$bus.$emit('getTaskJobResult', res, 'import')
        this.uploadDialogVisible = false
      } else {
        this.formFile = [e]
      }
    },
    beforeRemove(e) {
      this.formFile = []
    },
    downloadTemplates() {},
    importAction() {
      this.uploadDialogVisible = false
      this.$refs.m1Import.$refs.upload.submit()
    },
    exportM1(id) {
      this.$datablauDownload('/metadata/mm/download', { id })
    },
    close() {
      this.showAddModelDialog = false
    },
    confirm() {
      this.$refs.modelForm.validate(valid => {
        if (valid) {
          // console.log(this.modelData)
          this.$http
            .post(`/metadata/mm/addOrUpdateMetaModel`, {
              builtIn: false,
              definition: JSON.stringify({
                Model: {
                  Type: '',
                  Property: [
                    {
                      Id: '90000015',
                      Type: 'System.String',
                      Value: '物理数据库',
                    },
                    {
                      Id: '90000014',
                      Type: 'System.Boolean',
                      Value: 'False',
                    },
                    {
                      Id: '80000002',
                      Type: 'System.String',
                      Value: 'VARCHAR()',
                    },
                    {
                      Id: '90000026',
                      Type: 'System.Boolean',
                      Value: 'False',
                    },
                    {
                      Id: '90000004',
                      Type: 'System.String',
                      Value: this.modelData.Definition,
                    },
                    {
                      Id: '90000007',
                      Type: 'System.Guid',
                      Value: UUID.generate(),
                    },
                    {
                      Id: '90000006',
                      Type: 'System.Guid',
                      Value: UUID.generate(),
                    },
                    {
                      Id: '90000001',
                      Type: 'System.Int32',
                      Value: '90000000',
                    },
                    {
                      Id: '91000001',
                      Type: '',
                      Value: this.modelData.Name,
                    },
                    {
                      Id: '90000003',
                      Type: 'System.String',
                      Value: this.modelData.Name,
                    },
                    {
                      Id: '90000002',
                      Type: 'System.Int32',
                      Value: null,
                    },
                  ],
                  Object: [],
                },
              }),
              description: this.modelData.Definition,
              status: '发布',
              code: this.modelData.Code,
              type: this.modelData.Name,
              name: this.modelData.Name,
              startVer: '',
              endVer: '',
              updateTime: '',
            })
            .then(res => {
              this.showAddModelDialog = false
              this.getModelList()
            })
        }
      })
    },
    toAddModel() {
      this.showAddModelDialog = true
    },
    async getModelList() {
      const res = await this.$http.post('/metadata/mm/getMetaModels')
      this.modelList = res.data
    },
    toEditModel(row) {
      // console.log(row)
      this.currentModelId = row.id
      this.showDetails = true
    },
    toDeleteModel(row) {
      // console.log(row)
      this.$http
        .post(`/metadata/mm/removeMetaModel`, row)
        .then(res => {
          this.getModelList()
        })
        .catch(error => {
          this.$blauShowFailure(error)
        })
    },
    handleDetailsBack() {
      this.currentModelId = null
      this.showDetails = false
    },
  },
  beforeDestroy() {},
}
