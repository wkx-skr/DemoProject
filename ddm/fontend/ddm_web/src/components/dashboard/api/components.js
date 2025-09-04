import modelList from '@/views/dashboard/modelList.vue'

const componentsOfVue = {
  components: {
    myModel: modelList
  }
}

/*
组件的api调用可以通过下列配置进行托管。避免多重复调用相同API。组件使用rootData属性进行接收。
框架将确保rootData已经产生才渲染组件。
如果是专用API，你也可以在自己的组件内自行安排，不必在此处配置
 */
const componentsApiUrl = {}

/*
组件的默认格子占用,如果不设置，默认为 1 * 1,如果width或height缺省，也默认为 1
 */
const componentsDefaultSize = {
  myModel: {
    width: 7,
    height: 6
  }
}

export { componentsOfVue, componentsApiUrl, componentsDefaultSize }
