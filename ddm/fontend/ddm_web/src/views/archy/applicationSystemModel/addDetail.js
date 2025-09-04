import HTTP from '@/resource/http'
import udpFormLabel from '@/views/archy/enterpriseLogicalModel/udpFormLabel.vue'

export default {
  data () {
    return {
      nodeData: [],
      formData: {
        name: '',
        abbreviation: '',
        description: '',
        zone: '',
        itDepartment: '',
        businessDepartment: '',
        // deployment: '',
        // importance: '',
        owner: '',
        ownerfullName: ''
      },
      formRules: {
        name: {
          required: true,
          trigger: 'blur',
          message: '请输入系统名称'
        },
        abbreviation: {
          required: true,
          trigger: 'blur',
          message: '请输入系统简写'
        },
        itDepartment: {
          required: true,
          trigger: 'change',
          message: '请选择技术部门'
        },
        businessDepartment: {
          required: true,
          trigger: 'change',
          message: '请选择业务部门'
        },
        ownerfullName: {
          required: true,
          trigger: 'change',
          message: '请选择负责人'
        }
      },
      submitLoading: false,
      editModel: false, // 区分 新建与编辑
      dataInitFinish: false, // 是否完成数据初始化
      valueChange: false, // 初始化完成后，数据是否再次修改
      category: {},
      additionalPropertiesObj: {},
      departmentList: [],
      allDepartmentList: []
    }
  },
  props: {
    titlePath: {
      required: true
    },
    titlePathId: {
      required: true
    },
    detailObj: {

    },
    udps: {
      required: true
    }
  },
  mounted () {
    this.udps.forEach(e => {
      this.$set(this.additionalPropertiesObj, e.propertyId, null)
      if (e.required) {
        let validator = (rule, value, callback) => {
          if (!this.additionalPropertiesObj[e.propertyId]) {
            callback(
              new Error(
                this.$t('domain.common.itemRequiredInput', { name: e.name })
              )
            )
          } else {
            callback()
          }
        }
        this.$set(this.formRules, e.propertyId, {
          required: true,
          trigger: 'blur',
          message: this.$t('domain.common.itemRequiredInput', { name: e.name }),
          validator
        })
      }
    })
    if (this.detailObj) {
      this.editModel = true
      let path = []
      path = this.detailObj.path.split('/')
      path.forEach(element => {
        this.nodeData.push({
          name: element,
          couldClick: false
        })
      })
      this.nodeData.push({
        name: this.detailObj.name,
        couldClick: false
      })
      this.nodeData.push({
        name: '编辑',
        couldClick: false
      })
      this.formData = this.detailObj
      this.getUserName(this.detailObj.owner)
      this.category = _.clone(this.detailObj)
      if (this.detailObj?.additionalProperties !== null) {
        this.additionalPropertiesObj = this.detailObj?.additionalProperties
      } else {
        this.additionalPropertiesObj = {}
      }
    } else {
      this.editModel = false
      this.titlePath.forEach(element => {
        this.nodeData.push({
          name: element,
          couldClick: false
        })
      })
      this.nodeData.push({
        name: '新建',
        couldClick: false
      })

      this.$nextTick(() => {
        this.dataInitFinish = true
      })
    }
    this.getOrgList()
  },
  components: {
    udpFormLabel
  },
  methods: {
    getDepartmentByKeyword (key) {
      if (key) {
        key = key.toLowerCase()
        this.departmentList = this.allDepartmentList.filter(
          item =>
            (item.fullName + item.simpleName).toLowerCase().indexOf(key) > -1
        )
      }
    },
    // 获取所有的机构，并将返回的树形数据 转换成 数组
    getOrgList () {
      this.$http
        .get('/user/org/organization/tree/')
        .then(res => {
          this.allDepartmentList = this.flatten([res.data])
          this.departmentList = this.allDepartmentList
        })
    },
    // 将嵌套数据 拍平成 数组
    flatten (sourceArray, flattenedArray = []) {
      for (const element of sourceArray) {
        if (Array.isArray(element.children) && element.children.length > 0) {
          flattenedArray.push({
            ...element,
            children: []
          })
          this.flatten(element.children, flattenedArray)
        } else {
          flattenedArray.push(element)
        }
      }
      return flattenedArray
    },
    getUserName (name) {
      this.$http
        .get('/user/usermanagement/users/' + name)
        .then(res => {
          this.$set(this.formData, 'ownerfullName', res.data.fullUserName)
          this.$nextTick(() => {
            this.dataInitFinish = true
          })
        })
        .catch(e => this.$showFailure(e))
    },
    onSubmit () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.detailObj) {
            this.saveSystemUp()
          } else {
            this.saveSystem()
          }
        } else {
          return false
        }
      })
    },
    saveSystemUp () {
      let obj = this.formData
      obj.additionalProperties = []
      obj.additionalProperties = this.additionalPropertiesObj
      this.$http.put(`${HTTP.$archyServerUrl}system/system`, obj)
        .then(res => {
          this.$blauShowSuccess('修改成功')
          this.backConfirm()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    saveSystem () {
      let obj = this.formData
      obj.categoryId = this.titlePathId
      obj.additionalProperties = []
      obj.additionalProperties = this.additionalPropertiesObj
      //   categoryId/
      this.$http.post(`${HTTP.$archyServerUrl}system/system`, obj)
        .then(res => {
          this.$blauShowSuccess('新建成功')
          this.backConfirm()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    backClick () {
      let bool = false // 是否有未保存的数据
      if (this.editModel) {
        bool = this.valueChange
      } else {
        bool = true
      }
      if (bool) {
        this.$DatablauCofirm('数据未保存，确认要返回？', '提示', {
          type: 'warning',
          cancelButtonText: this.$t('common.button.cancel'),
          confirmButtonText: this.$t('common.button.ok')
        })
          .then(() => {
            this.backConfirm()
          })
          .catch(() => {
            console.log('cancel')
          })
      } else {
        this.backConfirm()
      }
    },
    backConfirm () {
      this.$emit('openDetail', '')
      this.$emit('serachList')
    },
    addBm () {
      this.$utils.branchSelect.open().then(res => {
        // this.category.itDepartment = res.bm
        // this.$set(this.category, 'itDepartment', res.bm)
        this.formData.itDepartment = res.bm
      })
    },
    addBms () {
      this.$utils.branchSelect.open().then(res => {
        // this.category.businessDepartment = res.bm
        //   this.$set(this.category, 'businessDepartment', res.bm)
        this.formData.businessDepartment = res.bm
      })
    },
    addUsers () {
      this.$utils.staffSelect.open([], true).then(data => {
        const response = []
        let arr = []
        data.forEach(element => {
          arr.push(element)
          response.push(element.id)
        })
        if (arr.length > 1) {
          arr = [arr[arr.length - 1]]
        }
        this.formData.owner = arr[0].username
        this.formData.ownerfullName = arr[0].fullUserName
      })
    }
  },
  watch: {
    additionalPropertiesObj: {
      deep: true,
      handler () {
        if (this.dataInitFinish) {
          this.valueChange = true
        }
      }
    },
    formData: {
      deep: true,
      handler () {
        if (this.dataInitFinish) {
          this.valueChange = true
        }
      }
    }
  }
}
