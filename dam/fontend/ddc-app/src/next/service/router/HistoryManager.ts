import _ from 'lodash'
/*
Mode 默认为Default,当资源不存在多种访问模式时，无需传入。
如果有浏览、编辑、查看结果等多种模式时，需要在构造方法中传入对应的处理方法名称
openCallbacks是一个数组，需要传入每种模式对应的打开方式
 */
enum Mode {
  Default,
  Edit,
  View,
  Result,
}
export default class HistoryManager {
  private readonly $el
  private readonly popstate
  private readonly queryKey
  private readonly openCallbacks
  private readonly closeCallback
  public constructor(
    el,
    queryKey: string,
    openCallbacks: Array<string>,
    closeCallback: string,
    ignoreInitialQuery?: boolean
  ) {
    console.debug('init history manager')
    this.$el = el
    this.queryKey = queryKey
    this.openCallbacks = openCallbacks
    this.closeCallback = closeCallback
    if (!ignoreInitialQuery) {
      this.handleInitialQuery()
    }
    this.popstate = () => {
      this.handlePopstate()
    }
    window.addEventListener('popstate', this.popstate, false)
  }
  private handleInitialQuery() {
    const query = this.$el.$route.query
    if (query[this.queryKey]) {
      let mode = Mode.Default
      if (query.mode && query.mode !== Mode.Default) {
        mode = query.mode
      }
      this.$el[this.openCallbacks[mode]](query[this.queryKey])
    }
  }
  public destroy() {
    window.removeEventListener('popstate', this.popstate, false)
  }
  public updateRoute(id: number | string | null, mode?: Mode) {
    const query = _.cloneDeep(this.$el.$route.query)
    if (id) {
      if (mode) {
        query.mode = mode
      }
      query[this.queryKey] = id
    } else {
      delete query[this.queryKey]
      if (query.hasOwnProperty('mode')) {
        delete query.mode
      }
    }
    this.$el.$nextTick(() => {
      console.debug('route start update', id)
      this.$el.$router.push({
        query: query
      }).then(r => {
      }).catch(e => {
        console.error(e)
      })
    })
  }
  private handlePopstate() {
    const query = this.$el.$route.query
    if (query[this.queryKey]) {
      let mode = Mode.Default
      if (query.mode && query.mode !== Mode.Default) {
        mode = query.mode
      }
      this.$el[this.openCallbacks[mode]](query[this.queryKey])
    } else {
      this.$el[this.closeCallback]()
    }
  }
}
