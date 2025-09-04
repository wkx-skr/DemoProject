#可视化组件使用指南
仅需下列四步，让你的组件库可以应用通用组件库。
1. 将你写的组件在，dashboard5.7/api/components.js中引入
    ```
    import problemStatistics from "@/view/dataQuality/dashboard/problemStatistics";
    const componentsOfVue = {
      components: {
        problemStatistics
      }
    }
    const componentsApiUrl = {
      problemStatistics: '/service/dashboard/quality/main'
    }
    const componentsDefaultSize = {
      problemDetail: {
        width: 5,
        height: 5
      }
    }
    ```
    1.1 先import; 
    1.2 然后加入到componentsOfVue.components列表;
    1.3 如果API请求需要托管（如多个组件依赖同一个API，每个组件自行调用会导致重复调用），可以填写componentsApiUrl;
    1.4 可以为组件指定默认尺寸，即纵横占用的格子数。缺省则默认为1

2. 在chinese.json dashboard属性中填写你的组件的中文名,在dashboardGroup中填写你组件的组名称
    ```typescript
    "dashboard": {
        "problemDetail": "问题发现情况",
        "importantProblem": "重点问题发现情况TOP5"
    }
   "dashboardGroup": {
       "problemStatistics": "数据质量",
       "ruleStatistics": "数据质量"
   }
    ```

3. 在dashboard5.7/api目录下创建你的页面对应的ts文件，可以参考dataCatalogDashboard.ts或qualityDashboard.ts

    ```typescript
    // 驾驶舱名称（请务必确保唯一，且一经确定不允许修改）,中文名允许修改
    export const dashboardName: string = "dataQuality"
    export const displayName: string = "数据质量驾驶舱";
    // 该驾驶舱包含的组件（仅为默认初始值，允许用户在UI上调整）
    export const defaultComponents: Array<string> = [
      'problemStatistics',
      'ruleStatistics',
      'systemStatistics',
      'otherStatistics',
      'problemDetail',
      'topPerson'
    ];
    // 该驾驶舱允许用户选择的组件
    export const selectableComponents: Array<string> = [
      'problemStatistics',
      'ruleStatistics',
      'systemStatistics',
      'otherStatistics',
      'problemDetail',
      'topPerson',
      'modelCategory',
      'dataSourceMapping',
      'report',
      'domain',
      'rule',
      'catalogCountList'
    ]
    
    // 窗口的最小宽度限制,暂未应用
    // export const pageMinWidth: number = 1200;
    
    // 列默认栅格数
    export const COL_AMOUNT: number = 8;
    
    // 编辑模式的画布最大高度，一般情况下无需修改
    export const ROW_MAX_AMOUNT: number = 20;
    
    // 高度的基准，单位为px, 组件可以为1倍或若干倍高
    export const HEIGHT_BASE: number = 150;
    
    // 组件之间的距离
    export const COMPONENT_GAP: number = 16;
    
    ```

4. 创建和ts文件同名的vue文件作为router入口，并引入你所写的ts文件，可以直接拷贝dataCatalogDashboard.vue
只需要修改第9行为你的ts文件名即可
```
<template>
  <dashboard-main
    :dashboard-properties="dashboardProperties"
  >
  </dashboard-main>
</template>

<script>
  import * as dashboardProperties from '../api/userPaneDashboard.ts'
  import dashboardMain from '../container/main.vue'
  export default {
    components: {
      dashboardMain
    },
    data () {
      return {
        dashboardProperties: dashboardProperties
      }
    }
  }
</script>
```

