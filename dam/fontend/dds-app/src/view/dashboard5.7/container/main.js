import vdr from 'vue-draggable-resizable-gorkys'
import 'vue-draggable-resizable-gorkys/dist/VueDraggableResizable.css'
import componentLoader from './componentLoader'
import { componentsApiUrl, componentsDefaultSize } from '../api/components'
import PositionBuilder from './PositionBuilder'
import _ from 'lodash'
import $ from 'jquery'
import h5List from '../html/list.vue'
import searchHead from '../components/searchHeader.vue'
import html2canvas from 'html2canvas'
import JsPDF from 'jspdf'

export default {
  components: {
    vdr,
    componentLoader,
    h5List,
    searchHead,
  },
  props: {
    dashboardProperties: {
      required: true,
    },
    marginLeft: {
      type: String,
    },
    from: {
      type: String,
    },
    options: {
      type: Array,
    },
    min: {
      type: Number,
      default: 100,
    },
    gridsNum: {
      type: Number,
      default: 8,
    },
  },
  data: function () {
    return {
      editMode: false,
      proMode: false,
      WIDTH_BASE: 1, // 宽度的基准，初始和resize页面时会进行计算
      COL_AMOUNT: this.dashboardProperties.COL_AMOUNT,
      ROW_MAX_AMOUNT: this.dashboardProperties.ROW_MAX_AMOUNT,
      HEIGHT_BASE: this.dashboardProperties.HEIGHT_BASE,
      COMPONENT_GAP: this.dashboardProperties.COMPONENT_GAP,
      BACKGROUND_COLOR: this.dashboardProperties.BACKGROUND_COLOR
        ? this.dashboardProperties.BACKGROUND_COLOR
        : '#f6f6f6',
      key: 0,
      data: {},
      rootData: {},
      components: [],
      componentsBefore: undefined,
      requestBodyBefore: undefined,
      positionBuilder: null,
      appendComponentDialogVisible: false,
      transferValue: [],
      transferData: [],
      h5ComponentSelectorVisible: true,
      fullScreen: false,
      modelValueSingle: '',
      modelValueName: '',
    }
  },
  mounted() {
    this.modelValueName = this.$t('assetCount.placeSelect')
    this.initRequestBodyBefore()
    $(window).resize(() => {
      this.calculateWidthBase()
    })
    setTimeout(() => {
      $('.container').css('visibility', 'visible')
    }, 100)
    document.addEventListener(
      'webkitfullscreenchange',
      this.handlewebkitfullscreenchange
    )
    this.$nextTick(() => {
      this.firstSystem()
    })
  },
  computed: {
    grid() {
      return [this.WIDTH_BASE, this.HEIGHT_BASE]
    },
    vdrInnerStyle() {
      const val = this.COMPONENT_GAP / 2 + 'px'
      return {
        top: val,
        left: val,
        bottom: val,
        right: val,
      }
    },
  },
  methods: {
    // 导出pdf
    exportPdf() {
      this.$bus.$emit('dashboardLoading', true)
      setTimeout(() => {
        this.$bus.$emit('downloadPdfStatus', true)
      })
      setTimeout(() => {
        var content = document.querySelector('.forPdf')
        let _this = this
        html2canvas(content, {
          allowTaint: true,
          scale: 2, // 提升画面质量，但是会增加文件大小
        }).then(function (canvas) {
          /** jspdf将html转为pdf一页显示不截断，整体思路：
           * 1. 获取DOM
           * 2. 将DOM转换为canvas
           * 3. 获取canvas的宽度、高度（稍微大一点）
           * 4. 将pdf的宽高设置为canvas的宽高
           * 5. 将canvas转为图片
           * 6. 实例化jspdf，将内容图片放在pdf中（因为内容宽高和pdf宽高一样，就只需要一页，也防止内容截断问题）
           */

          // 得到canvas画布的单位是px 像素单位
          var contentWidth = canvas.width
          var contentHeight = canvas.height
          // 将canvas转为base64图片
          var pageData = canvas.toDataURL('image/jpeg', 1.0)

          // 设置pdf的尺寸，pdf要使用pt单位 已知 1pt/1px = 0.75   pt = (px/scale)* 0.75
          // 2为上面的scale 缩放了2倍
          var pdfX = ((contentWidth + 10) / 2) * 0.75
          var pdfY = ((contentHeight + 500) / 2) * 0.75 // 500为底部留白

          // 设置内容图片的尺寸，img是pt单位
          var imgX = pdfX
          var imgY = (contentHeight / 2) * 0.75 // 内容图片这里不需要留白的距离

          // 初始化jspdf 第一个参数方向：默认''时为纵向，第二个参数设置pdf内容图片使用的长度单位为pt，第三个参数为PDF的大小，单位是pt
          var PDF = new JsPDF('', 'pt', [pdfX, pdfY])

          // 将内容图片添加到pdf中，因为内容宽高和pdf宽高一样，就只需要一页，位置就是 0,0
          PDF.addImage(pageData, 'jpeg', 0, 0, imgX, imgY)
          // PDF.save(this.text.downloadName + '.pdf')
          PDF.save(this.$t('assetCount.qualityProblem') + '.pdf')
          _this.$bus.$emit('dashboardLoading', false)
          _this.$bus.$emit('downloadPdfStatus', false)
        })
      })
    },
    handlewebkitfullscreenchange(e) {
      if (!e.currentTarget.webkitIsFullScreen) {
        this.innerSetFrameToWindow()
      } else {
        this.innerSetFrameToFullScreen()
      }
    },
    initRequestBodyBefore() {
      this.requestBodyBefore = JSON.stringify({
        components: [],
        COL_AMOUNT: this.COL_AMOUNT,
        HEIGHT_BASE: this.HEIGHT_BASE,
        COMPONENT_GAP: this.COMPONENT_GAP,
        BACKGROUND_COLOR: this.BACKGROUND_COLOR,
      })
    },
    initSystem() {
      this.prepareComponents(() => {
        this.prepareData()
        setTimeout(() => {
          this.calculateWidthBase()
        }, 100)
      })
    },
    firstSystem() {
      this.prepareComponents(() => {
        this.prepareData()
        setTimeout(() => {
          this.calculateWidthBase(false)
        }, 100)
      })
    },
    rebuildSystem() {
      this.prepareComponentsWithoutDatabase(() => {
        this.prepareData()
        setTimeout(() => {
          this.calculateWidthBase()
        }, 100)
      })
    },
    isComponentLoading(component) {
      const isLoading =
        component.data &&
        component.data.fromOuter &&
        !this.rootData.hasOwnProperty(component.component)
      return isLoading
    },
    handleContextMenu(component, evt) {
      if (!this.editMode) {
        return
      }
      const x = evt.clientX
      const y = evt.clientY
      const options = []
      options.push({
        icon: 'el-icon-delete',
        label: this.$t('assetCount.removeCom'),
        callback: () => {
          this.removeComponent(component)
        },
      })
      options.push({
        icon: 'el-icon-bottom',
        label: this.$t('assetCount.allDown'),
        callback: () => {
          this.moveBottom(component)
        },
      })
      // options.push({
      //   icon: 'el-icon-c-scale-to-original',
      //   label: '压缩空行',
      //   callback: () => {
      //     this.condenseRows()
      //   }
      // })
      if (options.length > 0) {
        let yOfResult = y
        if (window.innerHeight - y < 25) {
          yOfResult = window.innerHeight - 25
        }
        this.$bus.$emit('callContextMenu', {
          x: x,
          y: yOfResult,
          options: options,
        })
      }
    },
    findComponentIndex(name) {
      let idx = -1
      this.components.forEach((c, index) => {
        if (c.component === name) {
          idx = index
        }
      })
      return idx
    },
    moveBottom(component) {
      this.components.forEach(item => {
        if (item.y >= component.y) {
          item.y += 1
        }
      })
      this.resetLocation()
    },
    removeComponent(component) {
      this.$confirm(
        this.$t('assetCount.removeTip', {
          title: component.title,
        })
      )
        .then(() => {
          this.components.splice(
            this.findComponentIndex(component.component),
            1
          )
          if (component.x) {
            this.positionBuilder.removePoints(
              component.width,
              component.height,
              component.x,
              component.y
            )
          }
          // this.setSettingToDatabase()
        })
        .catch(() => {
          // this.$message.info('操作已取消')
        })
    },
    dashboardNameFormatter(name) {
      if (this.$version.dashboard[name]) {
        if (this.$version.dashboardGroup[name]) {
          return (
            this.$version.dashboardGroup[name] +
            ' - ' +
            this.$version.dashboard[name]
          )
        } else {
          return this.$version.dashboard[name]
        }
      } else {
        return 'H5 - ' + name
      }
    },
    dashboardSizeFormatter(name) {
      let width = 1
      let height = 1
      if (componentsDefaultSize[name]) {
        if (componentsDefaultSize[name].width) {
          width = componentsDefaultSize[name].width
        }
        if (componentsDefaultSize[name].height) {
          height = componentsDefaultSize[name].height
        }
      }
      return width + '×' + height
    },
    addComponent() {
      const getH5List = new Promise(resolve => {
        this.$http
          .post('/base/widget/getWidgetConfig?id=dashboard-h5-list')
          .then(res => {
            resolve(
              JSON.parse(res.data.content).map(item => {
                return {
                  label: this.dashboardNameFormatter(item.name),
                  key: item.id,
                  component: item.id,
                  isH5: true,
                  size: '1×1',
                }
              })
            )
          })
          .catch(e => {
            resolve([])
          })
      })
      const builtInList = this.dashboardProperties.selectableComponents.map(
        (name, index) => {
          return {
            label: this.dashboardNameFormatter(name),
            size: this.dashboardSizeFormatter(name),
            key: name,
            component: name,
          }
        }
      )
      getH5List.then(h5List => {
        this.transferData = _.concat(h5List, builtInList)
        this.transferValue = this.components.map(c => c.component)
        this.appendComponentDialogVisible = true
      })
    },
    submitTransfer() {
      const before = this.components.map(i => i.component)
      const after = this.transferValue
      const added = _.difference(after, before)
      const removed = _.difference(before, after)
      added.forEach(name => {
        const newComponent = this.addSingleComponentByDefault(name)
        this.components.push(newComponent)
      })
      removed.forEach(name => {
        const idx = this.findComponentIndex(name)
        const component = this.components[idx]
        this.components.splice(idx, 1)
        if (component.x) {
          this.positionBuilder.removePoints(
            component.width,
            component.height,
            component.x,
            component.y
          )
        }
      })
      if (added.length > 0) {
        this.rebuildSystem()
      } else {
        this.resetLocation()
      }

      this.cancelTransfer()
    },
    cancelTransfer() {
      this.appendComponentDialogVisible = false
    },
    getSettingFromDatabase() {
      return new Promise((resolve, reject) => {
        this.$http
          .post(
            `/base/widget/getWidgetConfig?id=dashboard-${this.dashboardProperties.dashboardName}`
          )
          .then(res => {
            if (res.data && res.data.content) {
              const json = JSON.parse(res.data.content)
              if (json.COL_AMOUNT) {
                this.COL_AMOUNT = json.COL_AMOUNT
              }
              if (json.HEIGHT_BASE) {
                this.HEIGHT_BASE = json.HEIGHT_BASE
              }
              if (json.COMPONENT_GAP) {
                this.COMPONENT_GAP = json.COMPONENT_GAP
              }
              if (json.BACKGROUND_COLOR) {
                this.BACKGROUND_COLOR = json.BACKGROUND_COLOR
              }
              resolve(json.components)
            } else {
              reject()
            }
          })
          .catch(e => {
            reject()
          })
      })
    },
    resetAll() {
      this.$confirm(
        this.$t('assetCount.resetTip'),
        this.$t('assetCount.resetCockpit')
      )
        .then(() => {
          this.$http
            .post('/base/widget/saveWidgetConfig', {
              widgetId: `dashboard-${this.dashboardProperties.dashboardName}`,
              content: null,
            })
            .then(() => {
              this.BACKGROUND_COLOR = this.dashboardProperties.BACKGROUND_COLOR
                ? this.dashboardProperties.BACKGROUND_COLOR
                : '#f6f6f6'
              // 重置列删格数，高度基准，组件间距
              this.COL_AMOUNT = this.dashboardProperties.COL_AMOUNT
              this.HEIGHT_BASE = this.dashboardProperties.HEIGHT_BASE
              this.COMPONENT_GAP = this.dashboardProperties.COMPONENT_GAP
              this.initSystem()
              if (this.dashboardProperties.dashboardName === 'dataQuality') {
                this.$bus.$emit('dashboardSearch')
              }
            })
            .catch(e => {
              this.showFailure(e)
            })
        })
        .catch(() => {
          this.$message.info(this.$t('assetCount.opeaCancel'))
        })
    },
    handleSave() {
      this.editMode = false
      this.proMode = false
      this.setSettingToDatabase()
      if (this.dashboardProperties.dashboardName === 'dataQuality') {
        this.$bus.$emit('dashboardSearch')
      }
    },
    handleCancel() {
      if (this.dashboardProperties.dashboardName === 'dataQuality') {
        this.$bus.$emit('dashboardSearch')
      }
      this.COL_AMOUNT = this.dashboardProperties.COL_AMOUNT
      this.ROW_MAX_AMOUNT = this.dashboardProperties.ROW_MAX_AMOUNT
      this.HEIGHT_BASE = this.dashboardProperties.HEIGHT_BASE
      this.COMPONENT_GAP = this.dashboardProperties.COMPONENT_GAP
      this.prepareComponents()
      this.editMode = false
      this.proMode = false
    },
    setSettingToDatabase() {
      const requestBody = {
        components: [],
        COL_AMOUNT: this.COL_AMOUNT,
        HEIGHT_BASE: this.HEIGHT_BASE,
        COMPONENT_GAP: this.COMPONENT_GAP,
        BACKGROUND_COLOR: this.BACKGROUND_COLOR,
      }
      this.componentsBefore = JSON.stringify(this.components)
      this.requestBodyBefore = JSON.stringify(requestBody)
      this.components.forEach(c => {
        requestBody.components.push({
          component: c.component,
          height: c.height,
          width: c.width,
          isH5: c.isH5,
          x: c.x,
          y: c.y,
        })
      })
      this.$http
        .post('/base/widget/saveWidgetConfig', {
          widgetId: `dashboard-${this.dashboardProperties.dashboardName}`,
          content: JSON.stringify(requestBody),
        })
        .then(() => {
          this.initSystem()
        })
        .catch(e => {
          this.showFailure(e)
        })
    },
    handleResize(component, args) {
      const [left, top, width, height] = args
      const x = Math.round(left / this.WIDTH_BASE)
      const y = Math.round(top / this.HEIGHT_BASE)
      const w = Math.round(width / this.WIDTH_BASE)
      const h = Math.round(height / this.HEIGHT_BASE)
      const isValid = this.positionBuilder.checkEmptyAndInside(
        x,
        y,
        w,
        h,
        component.x,
        component.y,
        component.width,
        component.height
      )
      if (isValid) {
        component.width = w
        component.height = h
        this.resetLocation()
        if (component.isH5) {
          this.key++
        }
      } else {
        this.$message.error(this.$t('assetCount.opeaFail'))
        if (this.dashboardProperties.dashboardName === 'dataQuality') {
          this.$bus.$emit('dashboardSearch')
        }
        this.resetLocation()
      }
    },
    handleDrag(component, args) {
      const [left, top] = args
      const x = Math.round(left / this.WIDTH_BASE)
      const y = Math.round(top / this.HEIGHT_BASE)
      const w = component.width
      const h = component.height
      const isValid = this.positionBuilder.checkEmptyAndInside(
        x,
        y,
        w,
        h,
        component.x,
        component.y,
        w,
        h
      )
      if (isValid) {
        component.x = x
        component.y = y
        this.resetLocation()
      } else {
        this.$message.error(this.$t('assetCount.opeaFail'))
        this.resetLocation()
        if (this.dashboardProperties.dashboardName === 'dataQuality') {
          this.$bus.$emit('dashboardSearch')
        }
        this.key++
      }
    },
    resetLocation() {
      this.positionBuilder = new PositionBuilder(
        this.COL_AMOUNT,
        this.ROW_MAX_AMOUNT
      )
      this.positionBuilder.init()
      this.components.forEach(component => {
        this.positionBuilder.addWithValue(
          component.width,
          component.height,
          component.x,
          component.y
        )
      })
    },
    addSingleComponentByDefault(name) {
      const data = {}
      if (componentsApiUrl[name]) {
        data.fromOuter = true
        data.url = componentsApiUrl[name]
        data.method = 'get'
        data.requestBody = null
      }
      let width = 1
      let height = 1
      if (componentsDefaultSize[name]) {
        if (componentsDefaultSize[name].width) {
          width = componentsDefaultSize[name].width
        }
        if (componentsDefaultSize[name].height) {
          height = componentsDefaultSize[name].height
        }
      }
      const position = this.positionBuilder.addWithoutValue(width, height)
      return {
        title: this.dashboardNameFormatter(name),
        component: name,
        isH5: name.includes('dashboard-h5'),
        data: data,
        width: width,
        height: height,
        x: position.x,
        y: position.y,
      }
    },
    afterPrepareComponents(items, callback) {
      const components = []
      items.forEach(component => {
        const name = component.component
        const data = {}
        if (componentsApiUrl[name]) {
          data.fromOuter = true
          data.url = componentsApiUrl[name]
          data.method = 'get'
          data.requestBody = null
        }
        this.positionBuilder.addWithValue(
          component.width,
          component.height,
          component.x,
          component.y
        )
        components.push({
          title: this.dashboardNameFormatter(name),
          component: name,
          isH5: component.isH5,
          data: data,
          width: component.width,
          height: component.height,
          x: component.x,
          y: component.y,
        })
      })
      this.components = components
      if (callback) {
        callback()
      }
    },
    afterPrepareComponentsWithoutSetting(callback) {
      const components = []
      this.dashboardProperties.defaultComponents.forEach(name => {
        const newComponent = this.addSingleComponentByDefault(name)
        components.push(newComponent)
      })
      this.components = components
      if (callback) {
        callback()
      }
    },
    prepareComponentsWithoutDatabase(callback) {
      this.positionBuilder = new PositionBuilder(
        this.COL_AMOUNT,
        this.ROW_MAX_AMOUNT
      )
      this.positionBuilder.init()
      this.afterPrepareComponents(this.components, callback)
    },
    prepareComponents(callback) {
      this.positionBuilder = new PositionBuilder(
        this.COL_AMOUNT,
        this.ROW_MAX_AMOUNT
      )
      this.positionBuilder.init()
      this.getSettingFromDatabase()
        .then(items => {
          // 使用数据库中存储的配置
          this.afterPrepareComponents(items, callback)
        })
        .catch(() => {
          // 没有在数据库中找到配置时，使用默认值
          this.afterPrepareComponentsWithoutSetting(callback)
        })
    },
    prepareData() {
      const urlToNameMap = new Map()
      const componentsWithoutData = this.components.filter(
        c => c.data && c.data.fromOuter
      )
      componentsWithoutData.forEach(c => {
        if (!urlToNameMap.has(c.data.url)) {
          urlToNameMap.set(c.data.url, [])
        }
        urlToNameMap.get(c.data.url).push(c.component)
      })
      urlToNameMap.forEach((componentNames, url) => {
        this.$http
          .get(this.$url + url)
          .then(res => {
            setTimeout(() => {
              componentNames.forEach(n => {
                if (res.data) {
                  this.$set(this.rootData, n, res.data)
                  // this.rootData[n] = res.data
                } else {
                  // this.rootData[n] = {}
                  this.$set(this.rootData, n, {})
                }
              })
            }, 0)
          })
          .catch(e => {
            this.$showFailure(e)
            componentNames.forEach(n => {
              this.rootData[n] = {}
            })
          })
      })
    },
    calculateWidthBase(isRefresh = true) {
      let width = $(this.$refs.box).css('width')
      if (parseInt(width) < 1200) {
        width = '1200px'
      }
      this.WIDTH_BASE = parseInt(width) / this.COL_AMOUNT
      if (isRefresh) {
        this.key++
      }
    },
    xFormatter(x) {
      return x * this.WIDTH_BASE
    },
    yFormatter(y) {
      return y * this.HEIGHT_BASE
    },
    filterMethod(query, item) {
      return this.$MatchKeyword(item, query, 'label')
    },
    addH5Component() {
      this.h5ComponentSelectorVisible = true
      this.$refs.h5List.show()
    },
    setFrameToFullScreen() {
      this.innerSetFrameToFullScreen()
      this.$fullScreen()
    },
    innerSetFrameToFullScreen() {
      this.fullScreen = true
      $(this.$el).css('position', 'fixed')
      $('#page-heading').css('display', 'none')
    },
    innerSetFrameToWindow() {
      this.fullScreen = false
      $(this.$el).css('position', 'absolute')
      $('#page-heading').css('display', 'block')
      this.calculateWidthBase()
    },
    setFrameToWindow() {
      this.innerSetFrameToWindow()
      this.$exitFullScreen()
    },
    goOverview() {
      this.$router.push('/main/dataAsset/overview')
    },
    modelValueChange(val) {
      this.modelValueSingle = val
      let ary = this.options.filter(item => item.id === val)
      this.modelValueName = ary[0].name
    },
  },
  beforeDestroy() {
    this.setFrameToWindow()
    document.removeEventListener(
      'webkitfullscreenchange',
      this.handlewebkitfullscreenchange
    )
    this.$store.commit('setStructureIdChange', null)
  },
  watch: {
    COL_AMOUNT() {
      this.calculateWidthBase()
    },
    editMode: {
      handler(isEditMode) {
        if (isEditMode) {
          $(this.$refs.box).css('height', '3000px')
        } else {
          $(this.$refs.box).css('height', 'auto')
        }
      },
      immediate: true,
    },
    options: {
      handler(val) {
        if (val && val.length !== 0) {
          this.modelValueSingle = val[0].id
          this.modelValueChange(val[0].id)
        }
      },
      immediate: true,
    },
    modelValueSingle(val) {
      this.$store.commit('setStructureIdChange', val)
    },
  },
}
