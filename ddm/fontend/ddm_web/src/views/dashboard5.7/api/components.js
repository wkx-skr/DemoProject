import store from '@/store'

/*
 *来自个人工作台页面的组件
 */
import dashboardModelHistory from '@/views/userPaneDashboard/dashboardModelHistory.vue'
// import dashboardMyApply from '@/views/userPaneDashboard/dashboardMyApply.vue'
// import dashboardMyMessage from '@/views/userPaneDashboard/dashboardMyMessage.vue'
// import dashboardMyReport from '@/views/userPaneDashboard/dashboardMyReport.vue'
// import dashboardMyTodo from '@/views/userPaneDashboard/dashboardMyTodo.vue'
import dashbordMyMessageAndMyApply from '@/views/userPaneDashboard/dashbordMyMessageAndMyApply'
import dashbordMyToDoAndMyReport from '@/views/userPaneDashboard/dashbordMyToDoAndMyReport'

const componentsOfVue = {
  components: {
    dashboardModelHistory,
    // dashboardMyApply,
    // dashboardMyMessage,
    // dashboardMyReport,
    // dashboardMyTodo
    dashbordMyToDoAndMyReport,
    dashbordMyMessageAndMyApply
  }
}

/*
组件的api调用可以通过下列配置进行托管。避免多重复调用相同API。组件使用rootData属性进行接收。
框架将确保rootData已经产生才渲染组件。
如果是专用API，你也可以在自己的组件内自行安排，不必在此处配置
 */
const componentsApiUrl = {
  // allOrganizations: '/service/org/organization/all',
}

/*
组件的默认格子占用,如果不设置，默认为 1 * 1,如果width或height缺省，也默认为 1
 */
const componentsDefaultSize = {
  dashboardModelHistory: {
    width: 9,
    height: 8
  },
  dashbordMyMessageAndMyApply: {
    width: 3,
    height: 4
  },
  dashbordMyToDoAndMyReport: {
    width: 3,
    height: 4
  }
  // dashboardMyMessage: {
  //   width: 3,
  //   height: 4
  // },
  // dashboardMyReport: {
  //   width: 3,
  //   height: 4
  // },
  // dashboardMyApply: {
  //   width: 3,
  //   height: 4
  // },
  // dashboardMyTodo: {
  //   width: 3,
  //   height: 4
  // }
}

// if (!store.state.featureMap.ddm_Messages) {
//   componentsDefaultSize.dashboardMyReport = {
//     width: 3,
//     height: 8
//   }
// }

export { componentsOfVue, componentsApiUrl, componentsDefaultSize }
