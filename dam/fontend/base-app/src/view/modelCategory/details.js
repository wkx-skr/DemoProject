import ModelCategoryController from '../../../../base-components/http/baseController/ModelCategoryController.ts'
import UserDefinedPropertyController from '../../../../base-components/http/baseController/UserDefinedPropertyController'
import LDMTypes from '@constant/LDMTypes'
export default {
  props: ['data', 'itDepsArr', 'zoneArr', 'busDepArr'],
  data() {
    return {
      writable: true,
      category: {},
      bindedModels: null,
      freeModels: [],
      dialogVisible: false,
      bindModelTree: null,
      bindedModels2: [],
      freeModels2: [],
      dialog2Visible: false,
      businessDefaultProps: {
        label: 'name',
        id: 'id',
      },
      disableBindModel2: true,
      modelClicked: null,
      dialog3Visible: false,
      primaryModel: '',
      systemStatusOptions: [
        {
          value: '1',
          label: this.$t('meta.DS.treeSubOperation.onLine'),
        },
        {
          value: '0',
          label: this.$t('meta.DS.treeSubOperation.offLine'),
        },
      ],
      rules: {
        categoryName: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.modelCategory.formItemRequired').format(
            this.$t('meta.modelCategory.categoryName')
          ),
        },
        categoryAbbreviation: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.modelCategory.formItemRequired').format(
            this.$t('meta.modelCategory.categoryAbbreviation')
          ),
        },
        itDepartment: {
          required: true,
          trigger: 'change',
          message: this.$t('meta.modelCategory.formItemRequired').format(
            this.$t('meta.modelCategory.itDepartment')
          ),
        },
        businessDepartment: {
          required: true,
          trigger: 'change',
          message: this.$t('meta.modelCategory.formItemRequired').format(
            this.$t('meta.modelCategory.businessDepartment')
          ),
        },
        owner: {
          required: true,
          trigger: 'change',
          message: this.$t('meta.modelCategory.formItemRequired').format(
            this.$t('meta.modelCategory.owner')
          ),
        },
        status: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.modelCategory.formItemRequired').format(
            this.$t('meta.modelCategory.systemStatus')
          ),
        },
        jiraProject: {
          required: true,
          trigger: 'blur',
          message: this.$t('meta.modelCategory.JiraRequired'),
        },
      },
      emptyData: {
        businessDepartment: '',
        categoryAbbreviation: '',
        categoryId: '',
        categoryName: '',
        deployment: '',
        description: '',
        importance: '',
        itDepartment: '',
        owner: '',
        parentCategoryId: '',
        status: '',
        zone: '',
      },
      userArr: [],
      userMap: {}, // choosed users
      dialog4Visible: false,
      allUserArr: [],
      allUserArrShow: [],
      usersId: [], // choosed id
      userNameFilter: '',

      jiraArr: [],
      submitDisabled: false,
      // defaultProps:{
      //   children: 'children',
      //   label: 'fullName'
      // },
      treeDatas: [],
      bms: '',
      // filterText:"",
      // dialogVisible:false,
      ower: '',
      owers: '',
      oversd: '',
      udps: [],
      // dialogVisibles:false
    }
  },
  mounted() {
    if (this.$customerId === 'CMBC') {
      this.$set(this.emptyData, 'jiraProject', '')
      this.getJiraArr()
    }
    if (this.data) {
      this.category = _.clone(this.data)
      // console.log(this.category);
      this.handleEditUser()
      this.treeData()
      if (this.category.isSelf) {
        this.writable = true
      }
      this.ower = this.category.businessDepartmentName
      this.owers = this.category.itDepartmentName
      // this.getBindedModels()
    } else {
      this.$set(this.category, 'itDepartment', '')
    }
    // if (!this.category.zone) {
    //   this.$set(this.category, 'zone', '');
    // }
    for (const key in this.emptyData) {
      if (!this.category[key] && this.category[key] !== 0) {
        this.$set(this.category, key, undefined)
      }
    }
    this.getUdp()
  },
  beforeDestroy() {},
  methods: {
    clearAutocomplete() {
      this.$refs.cautocomplete.activated = true
    },
    treeData() {
      this.$http
        .get('/user/org/organization/tree')
        .then(res => {
          const data = res.data
          this.treeDatas = [data]
          this.forbusinessDepartment(this.treeDatas)
          // localStorage.setItem('treeDatas',JSON.stringify(this.treeDatas));
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    forbusinessDepartment(data) {
      for (var i = 0; i < data.length; i++) {
        //  console.log(data[i]);
        if (data[i].fullName == this.category.businessDepartment) {
          this.category.businessDepartment = data[i].bm
        } else {
          this.forbusinessDepartment(data[i].children)
        }
        if (data[i].fullName == this.category.itDepartment) {
          this.category.itDepartment = data[i].bm
        } else {
          this.forbusinessDepartment(data[i].children)
        }
      }
    },
    getBindedModels() {
      this.$http
        .get(this.$url + '/service/models/category/' + this.category.categoryId)
        .then(res => {
          this.bindedModels = res.data
          //      this.getPrimaryModel();
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    fillUdp() {
      const category = this.category
      category.udps = []
      this.udps.forEach(u => {
        category.udps.push({
          id: u.id,
          value: u.value,
        })
      })
    },
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return false
        } else {
          this.submitDisabled = true
          this.fillUdp()
          if (this.data) {
            ModelCategoryController.updateModelCategory({
              requestBody: this.category,
            })
              .then(res => {
                this.$message.success(
                  this.$t('meta.DS.message.dirModifySucceed')
                )
                this.$bus.$emit('removeTab', this.data.categoryName)
                this.$bus.$emit('reloadCategory', 'currentPage')
              })
              .catch(e => {
                this.submitDisabled = false
                this.$showFailure(e)
              })
          } else {
            ModelCategoryController.createModelCategory({
              requestBody: this.category,
            })
              .then(res => {
                this.$message.success(this.$t('meta.DS.message.sysCreated'))
                this.$bus.$emit('removeTab', 'add')
                this.$bus.$emit('reloadCategory')
              })
              .catch(e => {
                this.submitDisabled = false
                this.$showFailure(e)
              })
          }
        }
      })
    },
    // filterNode(value, data) {
    //   if (!value) return true
    //   return (data.fullName && data.fullName.indexOf(value) !== -1) || (data.bm && data.bm.indexOf(value) !== -1);
    // },
    addBm() {
      this.$utils.branchSelect.open().then(res => {
        // this.category.itDepartment = res.bm
        this.$set(this.category, 'itDepartment', res.bm)
        this.owers = res.fullName
      })
    },
    addBms() {
      this.$utils.branchSelect.open().then(res => {
        // this.category.businessDepartment = res.bm
        this.$set(this.category, 'businessDepartment', res.bm)
        this.ower = res.fullName
      })
    },
    // handleNodeClick(data) {
    //   this.category.businessDepartment = data.bm;
    //   this.ower = data.fullName
    // },
    // handleNodeClicks(data){
    //   this.category.itDepartment =data.bm;
    //   this.owers = data.fullName
    // },
    addUsers() {
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
        this.category.owner = arr[0].username
        this.oversd = arr[0].fullUserName
      })
    },
    // renderContent(h, { node, data, store }) {
    //   if(data.bm === '@ROOT'){
    //     return(
    //       <span style="width: 88%;position:relative;">
    //       <span class="icon-i-folder">
    //       <span class="path1"></span>
    //       <span class="path2"></span>
    //       </span>
    //       <span>{(node.label).indexOf('/') != -1 ? (node.label).split('/')[1] : node.label}</span>
    //       <span class='three-point' style="position: absolute;right: 5px;">
    //       <el-dropdown trigger="hover" style='float:right;margin-right:5px' size='mini' on-command={command => this.commandHandle(command, data)}>
    //       <el-dropdown-menu></el-dropdown-menu>
    //       </el-dropdown>
    //       </span>
    //       </span>
    //   );
    //   }else{
    //     return(
    //       <span style="width: 88%;position:relative;">
    //       <span class="icon-i-user">
    //       <span class="path1" style="margin-right:7px;"></span>
    //       <span class="path2" style="margin-right:7px;"></span>
    //       </span>
    //       &nbsp;
    //   <span>{(node.label).indexOf('/') != -1 ? (node.label).split('/')[1] : node.label}</span>
    //     <span class='three-point' style="position: absolute;right: 5px;">
    //       <el-dropdown trigger="hover" style='float:right;margin-right:5px' size='mini' on-command={command => this.commandHandle(command, data)}>
    //       <el-dropdown-menu></el-dropdown-menu>
    //       </el-dropdown>
    //       </span>
    //       </span>
    //   );
    //   }
    // },
    removeTab() {
      this.$bus.$emit('removeTab', this.data ? this.data.categoryName : 'add')
    },
    getUsers() {
      // 获得该用户
      this.$http
        .get(
          this.$url +
            '/service/modelCategories/' +
            this.category.categoryId +
            '/users'
        )
        .then(res => {
          const arr = []
          this.userMap = {}
          if (res.data && Array.isArray(res.data)) {
            const arr2 = [] // 被选中的id数组
            res.data.forEach(item => {
              arr.push(item)
              arr2.push(item.userId)
              this.$set(this.userMap, item.userId + '', true)
            })
            this.usersId = arr2
            this.$nextTick(() => {
              this.filterUserName(this.resetChoosedUser)
            })
          }
          this.userArr = arr
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    removeUser($index, row) {
      // this.userArr.splice($index, 1);
      // let arr = [];
      // this.userArr.forEach((item) => {
      //   arr.push(item.userId);
      // });
      // this.usersId = arr;
      const idIndex = this.usersId.findIndex(item => {
        return item == row.userId
      })
      this.usersId.splice(idIndex, 1)
      this.userArr = []
      this.allUserArr.forEach(item => {
        const index = this.usersId.findIndex(item2 => {
          return item2 == item.userId
        })
        if (index !== -1) {
          this.userArr.push(item)
        }
      })
    },
    addUser($index, row) {
      this.usersId.push(row.userId)
      this.userArr = []
      this.allUserArr.forEach(item => {
        const index = this.usersId.findIndex(item2 => {
          return item2 == item.userId
        })
        if (index !== -1) {
          this.userArr.push(item)
        }
      })
    },
    handleEditUser() {
      /* this.$http
        .get('/user/usermanagement/users')
        .then(res => {
          const arr = []
          const obj = res.data
          for (var key in obj) {
            if (!obj.hasOwnProperty(key)) {
              continue
            }
            arr.push(obj[key])
          }

          for (var i = 0; i < arr.length; i++) {
            if (this.category.owner == arr[i].username) {
             this.oversd = arr[i].fullUserName
            }
          }
        })
        .catch(e => this.$showFailure(e)) */
      this.$http
        .get('/user/usermanagement/users/' + this.category.owner)
        .then(res => {
          this.oversd = res.data.fullUserName
        })
        .catch(e => this.$showFailure(e))
    },
    // resetUsers(newVal) {
    //   // newVal: array of user id
    //   let arr = [];
    //   newVal.forEach(item => {
    //     arr.push(this.userMap[item]);
    //   });
    //   this.usersId = newVal;
    //   this.userArr = arr;
    // },
    saveUsers() {
      // let arr = [];
      // for(let key in this.userMap) {
      //   if (this.userMap[key]) {
      //     arr.push(key);
      //   }
      // }
      const json = {
        modelCategoryId: this.category.categoryId,
        userIds: this.usersId,
      }
      this.$http
        .put(
          this.$url +
            '/service/modelCategories/' +
            this.category.categoryId +
            '/users',
          json
        )
        .then(res => {
          this.dialog4Visible = false
          this.$message.success(this.$t('meta.DS.message.modifySucceed'))
        })
        .catch(e => this.$showFailure(e))
    },
    close() {
      this.dialog4Visible = false
    },
    filterUserName(callback) {
      this.$refs.usersTable.clearSort()
      this.allUserArrShow.splice(0, this.allUserArrShow.length)
      this.allUserArr.forEach(item => {
        if (
          this.$MatchKeyword(item, this.userNameFilter, 'username', 'firstName')
        ) {
          this.allUserArrShow.push(item)
        }
      })
      this.$utils.sort.sortConsiderChineseNumber(
        this.allUserArrShow,
        'username'
      )
      callback && callback()
    },
    handleSortUsers({ column, prop, order }) {
      if (!prop) {
        prop = 'username'
      }
      this.$utils.sort.sortConsiderChineseNumber(this.allUserArrShow, prop)
      if (order === 'descending') {
        this.allUserArrShow.reverse()
      }
    },
    resetChoosedUser() {
      this.$nextTick(() => {
        this.allUserArrShow.forEach(item => {
          // if (this.userMap[item.userId]) {
          //   this.$refs.usersTable.toggleRowSelection(item, true);
          // }
          const index = this.usersId.findIndex(userId => {
            return item.userId == userId
          })
          if (index !== -1) {
            this.$refs.usersTable.toggleRowSelection(item, true)
          }
        })
      })
    },
    // getChoosedUser() {
    //   // this.$refs.usersTable
    // },
    // isAdded(data) {
    //   return this.userMap[data.userId];
    // },
    handleUserChange(selection, row) {
      const index = selection.findIndex(item => {
        return item === row
      })
      const $index = this.allUserArr.findIndex(item2 => {
        return item2.userId === row.userId
      })
      if (index !== -1) {
        // 该项被选中
        this.addUser($index, this.allUserArr[$index])
      } else {
        // 该项取消选中
        this.removeUser($index, this.allUserArr[$index])
      }
      // this.userMap = {};
      // selection.forEach(item => {
      //   this.$set(this.userMap, item.userId + '', true);
      // });
    },
    querySearch(queryString, cb) {
      cb(this.$getSuggettionInputValue(queryString, cb, this.itDepsArr, 'name'))
    },
    getJiraArr() {
      if (this.$customerId === 'CMBC') {
        this.$http
          .get(`${this.$url}/service/jira/projects`)
          .then(res => {
            const arr = res.data
            if (arr && Array.isArray(arr)) {
              this.jiraArr = arr
            }
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    getUdp() {
      UserDefinedPropertyController.getTypeUdps({
        typeId: LDMTypes.ModelMart,
      }).then(res => {
        const udpsValues = this.category.udps
        const udps = res.data.sort((a, b) => a.order - b.order)
        udps.forEach(item => {
          if (Array.isArray(udpsValues) && udpsValues.length) {
            udpsValues.forEach(val => {
              if (item.id === val.id) {
                if (item.type === 'BOOL') {
                  item.value = val.value === 'true'
                } else {
                  item.value = val.value
                }
              }
            })
          }
        })
        this.udps = udps
      })
    },
  },
  watch: {
    userNameFilter(newVal) {
      this.$nextTick(() => {
        this.filterUserName(this.resetChoosedUser)
      })
    },
  },
}
