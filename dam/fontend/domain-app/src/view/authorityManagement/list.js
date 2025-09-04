import HTTP from '@/http/main'
export default {
  data() {
    return {
      rawDataMap: [],
      rawData: [],
      data: [],
      keyword: '',
      dataDisplay: [],
      formInline: {
        roleFriendlyName: '',
        roleName: '',
      },
      tableHeight: 100,
      currentPage: 1,
      pageSize: 20,
      total: 0,

      multipleSelection: [],
      deleteDisabled: true,

      showFindeDeleteUser: false,
      restoreUsername: '',
      deletedUsernames: '',
      showAllUser: true,
    }
  },
  watch: {
    // keyword () {
    //   this.filtData()
    // },
    // showAllUser() {
    //   this.loadData();
    // }
  },
  mounted() {
    setTimeout(() => {
      this.resize()
    })
    $(window).resize(this.resize)
    // this.$bus.$on('reload', this.loadData)
    this.loadData()
  },
  beforeDestroy() {
    this.$bus.$off('reload')
    $(window).unbind('resize', this.resize)
  },
  methods: {
    resize() {
      if ($('.table-row')[0].offsetHeight === 0) {
        return
      }
      this.tableHeight = $('.table-row')[0].offsetHeight
    },
    refresh() {
      this.loadData()
    },
    addTab() {
      this.$bus.$emit('addTab')
    },
    // handleShowDeletedUsers() {
    //   this.$http.get(this.$url + '/service/usermanagement/userstatus')
    //   .then(res => {
    //     this.restoreUsername = '';
    //     this.showFindeDeleteUser = true;
    //     let usernames = res.data;
    //     if (usernames) {
    //       let arr = [];
    //       for(let key in usernames) {
    //         if (key && usernames[key]===false) {
    //           arr.push(key);
    //         }
    //       }
    //       this.deletedUsernames = arr;
    //     }
    //   })
    //   .catch(e => {
    //     this.$showFailure(e);
    //   });
    // },
    // handleRestoreUser() {
    //   this.$http.put(this.$url + '/service/usermanagement/users/restore', this.restoreUsername)
    //   .then(res => {
    //     this.showFindeDeleteUser = false;
    //     this.refresh();
    //     this.$message.success('用户找回成功');
    //   })
    //   .catch(e => {
    //     this.$showFailure(e);
    //   })
    // },
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.deleteDisabled = this.multipleSelection.length === 0
    },
    loadData() {
      const body = {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
      }
      this.$http
        .post('/user/role/page', body)
        .then(res => {
          this.dataDisplay = res.data.content
          // console.log(this.dataDisplay);
          this.total = res.data.totalItems
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // filtData () {
    //   this.data = []
    //   this.rawData.forEach(item => {
    //     if (item.name.concat(item.firstName, item.emailAddress, item.phoneNumber).toLowerCase().indexOf(this.keyword.toLowerCase()) > -1) {
    //       this.data.push(item)
    //     }
    //   })
    //   this.total = this.data.length
    //   this.currentPage = 1
    //   this.changedataDisplay()
    // },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.loadData()
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.loadData(current)
    },
    // changedataDisplay (current) {
    //   const self = this
    //   self.dataDisplay = self.data.slice(self.pageSize * (self.currentPage - 1), self.pageSize * self.currentPage)
    // },
    // preDeleteRows () {
    //   this.$confirm('确定要执行删除操作吗？', '', {
    //     type: 'warning'
    //   }).then(() => {
    //     this.deleteRows()
    //   }).catch(() => {

    //   })
    // },
    // deleteRows () {
    //   const self = this
    //   let rows = self.multipleSelection
    //   let length = rows.length
    //   if (length === 0) {
    //     return
    //   } else {
    //     let ids = []
    //     rows.forEach((row, index) => {
    //       this.$http.delete(this.$url + '/service/usermanagement/users/' + row.userId, ids).then(res => {
    //         if (index === rows.length - 1) {
    //           this.$message.success(this.$version.common.operationSucceed)
    //           this.loadData()
    //         }
    //       }).catch(e => {
    //         this.$showFailure(e)
    //       })
    //     })
    //   }
    // },
    // disabledUsers() {
    //   this.$confirm('确定要执行禁用操作吗？', '', {
    //     type: 'warning'
    //   }).then(() => {
    //     let user = [];
    //     this.multipleSelection.forEach(item => {
    //       user.push(item.username);
    //     });
    //     let callback = () => {
    //       this.loadData();
    //     };
    //     if (user.length > 0) {
    //       let disableArr = () => {
    //         if (user.length > 0) {
    //           this.disabledUser(user[0], disableArr, callback);
    //           user.shift();
    //         } else {
    //           callback();
    //           this.$message.success('禁用用户成功');
    //         }
    //       };
    //       disableArr();
    //     }
    //   }).catch(() => {

    //   })
    // },
    // disabledFormatter(row, column, cellValue, index) {
    //   return cellValue ? '已启用' : '已禁用';
    // },
    // disabledUser(userName, successCallback, failureCallback) {
    //   this.$http.put(this.$url + '/service/usermanagement/users/disable', userName)
    //   .then(res => {
    //     successCallback && successCallback();
    //   })
    //   .catch(e => {
    //     this.$showFailure(e)
    //     failureCallback && failureCallback();
    //   })
    // },
    // disableRow({row}) {
    //   let success = () => {
    //     this.$message.success('用户已禁用');
    //     this.loadData();
    //   };
    //   this.disabledUser(row.username, success);
    // },
    // enableRow({row}) {
    //   this.$http.put(this.$url + '/service/usermanagement/users/restore', row.username)
    //   .then(res => {
    //     this.$message.success('用户已启用');
    //     this.loadData();
    //   })
    //   .catch(e => {this.$showFailure(e)});
    // },
    editDetails(data) {
      // console.log(1);

      this.$bus.$emit('addTab', data)
    },
    deletes(data) {
      const id = data.id
      this.$http
        .delete(`/user/role/${id}`)
        .then(res => {
          this.loadData()
          this.$message.success('删除成功')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // editAccess () {

    // },
    // selectable(row){
    //   return !(row.username === this.$user.username || !row.enabled);
    // }
  },
}
