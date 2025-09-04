import ourList from './list.vue'
import ourDetail from './detail.vue'
export default {
  components: {
    ourList,
    ourDetail,
  },
  data() {
    return {
      lastTab: 'list',
      currentTab: 'list',
      showAddTab: false,
      dataMap: {},
      dataArray: [],
      allRoles: [],
    }
  },
  mounted() {
    this.$bus.$on('addTab', detail => {
      if (detail) {
        this.addTab(_.clone(detail))
      } else {
        this.showAddTab = true
        this.currentTab = 'add'
      }
    })
    this.$bus.$on('removeTab', name => {
      if (name) {
        this.removeTab(name)
      } else {
        this.removeTab('add')
      }
    })
    // this.getAllRoles();
  },
  beforeDestroy() {
    this.$bus.$off('addTab')
    this.$bus.$off('removeTab')
  },
  methods: {
    // getAllRoles(){
    //   this.$http.get(this.$url + '/service/usermanagement/groups').then(res=>{
    //     let rawDataMap = res.data;
    //     this.allRoles = [];
    //     for(let user in rawDataMap){
    //       let item = rawDataMap[user];
    //       this.allRoles.push(item);
    //     }
    //   }).catch(e=>{
    //     this.$showFailure(e);
    //   });
    // },
    addTab(data) {
      if (this.dataMap[data.roleFriendlyName]) {
      } else {
        this.dataMap[data.roleFriendlyName] = data
        this.dataArray.push(data)
      }

      this.currentTab = data.roleFriendlyName
    },
    removeTab(tabName) {
      if (tabName == 'add') {
        this.currentTab = this.lastTab
        this.showAddTab = false
      } else {
        this.dataArray.forEach((rule, index) => {
          if (rule.roleFriendlyName == tabName) {
            this.dataArray.splice(index, 1)
            delete this.dataMap[tabName]
          }
        })
        this.currentTab = this.lastTab
      }
    },
  },
}
