export default {
  props: ['preData'],
  data() {
    return {
      authority: {
        roleFriendlyName: '',
        roleModuleClass: '',
        appName: 'DAM',
        roleModule: '',
        roleName: '',
        roleUrl: '',
        roleMethod: '',
        roleDescription: '',
      },
      roleModules: [],
      roleModuleClasss: [],
      dataBse: [],
      rules: {
        roleFriendlyName: [
          { required: true, message: '请输入权限名称', trigger: 'blur' },
        ],
        roleName: [
          { required: true, message: '请输入权限编码', trigger: 'blur' },
        ],
        roleModule: [
          { required: true, message: '请输入一级模块名称', trigger: 'blur' },
        ],
        roleModuleClass: [
          { required: true, message: '请输入二级模块名称', trigger: 'blur' },
        ],
        //   date1: [
        //     { type: 'date', required: true, message: '请选择日期', trigger: 'change' }
        //   ],
        //   date2: [
        //     { type: 'date', required: true, message: '请选择时间', trigger: 'change' }
        //   ],
        //   type: [
        //     { type: 'array', required: true, message: '请至少选择一个活动性质', trigger: 'change' }
        //   ],
        //   resource: [
        //     { required: true, message: '请选择活动资源', trigger: 'change' }
        //   ],
        //   desc: [
        //     { required: true, message: '请填写活动形式', trigger: 'blur' }
        //   ]
      },
    }
  },
  mounted() {
    this.options()
    if (this.preData) {
      this.authority = _.cloneDeep(this.preData)
    }
  },
  watch: {},
  methods: {
    options() {
      this.$http.get('/user/role/options').then(res => {
        const data = res.data
        this.dataBse = data
        for (const item in data) {
          this.roleModules.push(item)
        }
      })
    },
    changses(data) {
      this.authority.roleModuleClass = ''
      for (const item in this.dataBse) {
        if (item == data) {
          this.roleModuleClasss = this.dataBse[item]
        }
      }
    },
    confirm() {
      const body = _.cloneDeep(this.authority)
      if (body.id) {
        this.$http.put('/user/role/', body).then(res => {
          this.$message.success('修改成功')
          this.remove()
        })
      } else {
        this.$http.post('/user/role/', body).then(res => {
          this.$message.success('添加成功')
          this.remove()
        })
      }
    },
    remove() {
      if (this.preData) {
        this.$bus.$emit('removeTab', this.preData.roleFriendlyName)
      } else {
        this.$bus.$emit('removeTab')
      }
      this.$bus.$emit('reload')
    },
  },
}
