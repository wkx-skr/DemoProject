/* To choose one user,you can add the following html sentence in your page,for
example:
<!--
*		 <UserSelect
*				variable="userSelect1"
*				roles="role_superuser,role_useradmin,role_dataadmin,role_user"
*				:max-display="20"
*		></UserSelect>
*	-->
variable prescribe a variable to save the result object,like this: * {
id:23,value:'admin'} * max-display prescribe the max amount items to display in
the dropdown list. * roles indicates which roles you want to search.If nothing
set, the component will return all roles. * * * created by wk in 2017/09/28
13:53:30 * * max-display property will be ignored. * updated by wk in 2020/04/02
16:23 */

<template>
  <div class="user-input">
    <el-autocomplete
      size="small"
      style="width: 100%"
      v-model="keyword"
      :fetch-suggestions="querySearch"
      :placeholder="placeholder"
      @select="handleSelect"
      @clear="handleClear"
      clearable
    ></el-autocomplete>
  </div>
</template>

<script>
export default {
  props: ['variable', 'roles', 'maxDisplay', 'placeholder', 'ignoreList'],
  data() {
    return {
      allUsers: [],
      keyword: '',
    }
  },
  mounted() {
    this.getUsers()
  },
  updated() {},
  watch: {
    ignoreList() {
      this.getUsers()
    },
  },
  methods: {
    getUsers() {
      const self = this
      let roles
      if (self.roles) {
        roles = '?roles=' + self.roles
      } else {
        roles = ''
      }
      self.$http
        .get(self.$url + '/service/main/users' + roles)
        .then(res => {
          self.allUsers = []
          for (const i in res.data) {
            const item = res.data[i]
            if (item.firstname) {
              self.allUsers.push({
                id: item.userId,
                value: this.$userNameFormatter(item),
                name: item.username,
              })
            } else {
              self.allUsers.push({
                id: item.userId,
                value: item.username,
                name: item.username,
              })
            }
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    deleteKeyword() {
      this.keyword = ''
    },
    filterUsers() {
      const self = this
      const finalRtn = []
      self.allUsers.forEach(item => {
        let insert = true
        self.ignoreList.forEach(ignore_item => {
          if (item.userId == ignore_item.userId) {
            insert = false
          }
        })
        if (insert) {
          finalRtn.push(item)
        }
      })

      return finalRtn
    },
    copyAllUsers() {
      const self = this
      const finalRtn = []
      self.allUsers.forEach(item => {
        finalRtn.push(item)
      })
      return finalRtn
    },
    querySearch(queryString, cb) {
      var restaurants = this.copyAllUsers()

      var results = queryString
        ? restaurants.filter(this.createFilter(queryString))
        : restaurants
      // if(results.length>this.maxDisplay)results.length = this.maxDisplay
      cb(results)
    },
    createFilter(queryString) {
      return restaurant => {
        return restaurant.value.indexOf(queryString.toLowerCase()) > -1
      }
    },
    handleSelect(item) {
      this.$bus.$emit('userNameChange', item)
      this.$parent[this.variable] = item
      this.$emit('change', item)
    },
    handleClear() {
      this.$bus.$emit('userNameChange', null)
    },
  },
}
</script>

<style scoped lang="scss">
.user-input {
  width: 96%;
  display: inline-block;
  /*width:240px;*/
  .default-input {
    /*width:100%;*/
  }
}
</style>
