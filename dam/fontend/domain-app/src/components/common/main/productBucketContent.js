import PinyinMatch from 'pinyin-match'
import componentBlock from './componentBlock.vue'
import HTTP from '@/http/main'
export default {
  components: {
    componentBlock,
  },
  props: {
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  inject: ['reload'],
  data() {
    const nameValidator = (rule, value, callback) => {
      const name = this.renameDialogJson.name
      if (!name) {
        callback(this.$t('common.bucket.edit.notNull'))
      } else if (name.length > 30) {
        callback(this.$t('common.bucket.edit.tooLong'))
      } else if (this.productsName.includes(name)) {
        callback(this.$t('common.bucket.edit.duplicate'))
      } else {
        callback()
      }
    }
    return {
      menuMap: null,
      menu: null,
      collections: {},
      collections1: {},
      indexOfCurrent: this.$store.state.damProductIndex,
      isAdmin: this.$isAdmin,
      keyword: '',
      resultCount: 0,
      hideLv2: localStorage.getItem('hideLv2')
        ? localStorage.getItem('hideLv2') === 'true'
        : true,
      // logoSrc: require('@/assets/images/logo/guanwang_black.png'),
      FULL_PRODUCT_PART: ['ddg', 'dda', 'ddm', 'common'],
      newProduct: window.setting.newProduct,
      button: {
        list: require('./images/button_list.svg'),
        listChecked: require('./images/button_list_checked.svg'),
        block: require('./images/button_block.svg'),
        blockChecked: require('./images/button_block_checked.svg'),
      },
      isEditProductMode: false,
      currentProductName: '',
      newProductName: '',
      products: [],
      currentProduct: null,
      renameDialogVisible: false,
      renameDialogJson: {
        name: '',
      },
      renameIndex: -1,
      rules: {
        name: {
          validator: nameValidator,
        },
      },
      AllMenu: null,
    }
  },
  computed: {
    showLv2: {
      get: function () {
        return !this.hideLv2
      },
      set: function (newValue) {
        this.hideLv2 = !newValue
      },
    },
    renameDialogDisable() {
      return (
        !this.renameDialogJson.name ||
        this.renameDialogJson.name.length > 30 ||
        this.productsName.includes(this.renameDialogJson.name)
      )
    },
    productsName() {
      const products = this.products
      const names = []
      this.products.forEach(item => {
        if (typeof item === 'string') {
          names.push(item)
        } else if (typeof item === 'object' && item.name) {
          names.push(item.name)
        } else {
          throw new Error('product-name 识别错误')
        }
      })
      return names
    },
  },
  mounted() {
    this.getProducts()
    this.$bus.$on('user-page-ready', () => {
      this.getCollections1()
      this.$parent.$parent
        .getFromDatabase('6.2collections-' + this.$user.username)
        .then(collections => {
          try {
            if (collections) {
              this.collections = this.filterCollections(JSON.parse(collections))
            }
          } catch (e) {
            throw new Error(e)
          }
        })
    })
    this.$bus.$on('forceGetMenuMap', () => {
      this.getMenuMap()
    })
  },
  beforeDestroy() {
    this.$bus.$off('user-page-ready')
    this.$bus.$off('forceGetMenuMap')
  },
  methods: {
    getCollections1() {
      const damProduct = this.$store.state.damProduct
      let widgetId = '6.2collections1'
      if (damProduct) {
        widgetId = '6.2collections1-product-' + damProduct
      } else {
        return
      }
      this.$parent.$parent.getFromDatabase(widgetId).then(collections1 => {
        try {
          if (collections1) {
            if (damProduct && typeof collections1 === 'string') {
              this.currentProductName = damProduct
              this.currentProduct = JSON.parse(collections1)
            } else {
              this.currentProductName = ''
              this.currentProduct = null
            }
            this.collections1 = this.filterCollections(JSON.parse(collections1))
            this.$emit('collection1-change', this.collections1)
          }
        } catch (e) {
          throw new Error(e)
        }
      })
    },
    filterCollections(collection) {
      const collectionFiltered = {}
      Object.keys(collection).forEach(item => {
        const value = collection[item]
        if (value.level === 2) {
          if (this.menuMap[value.value]) {
            collectionFiltered[item] = value
          }
        }
        if (value.level === 1) {
          if (this.menuMap.level1[value.value]) {
            collectionFiltered[item] = value
          } else if (this.menuMap[value.value]) {
            collectionFiltered[item] = value
          }
        }
        if (value.level === 0) {
          if (this.menuMap.level0[value.value]) {
            collectionFiltered[item] = value
          } else if (this.menuMap.level1[value.value]) {
            collectionFiltered[item] = value
          } else if (
            value.value === 'dataAsset' &&
            this.menuMap.level0.数据资产
          ) {
            collectionFiltered[item] = value
          }
        }
      })
      return collectionFiltered
    },
    buildMenu() {
      const menuMap = this.menuMap
      const menu = []
      const heights = {}
      if (!this.$versionFeature.base_FullNavigation) {
        this.currentProductName = ''
        this.currentProduct = null
      }
      if (this.currentProduct && this.$versionFeature.base_FullNavigation) {
        this.PRODUCT_PART = [this.currentProductName]
      } else {
        this.PRODUCT_PART = _.clone(this.FULL_PRODUCT_PART)
      }
      this.PRODUCT_PART.forEach(item => {
        heights[item] = [0, 0, 0]
      })
      // 判断一个模块是否在当前产品
      const inProduct = (product, index = '0') => {
        if (this.currentProduct) {
          return this.currentProduct.hasOwnProperty(product + index)
        } else {
          return true
        }
      }
      const decideNextRowIdx = productPart => {
        const min = Math.min.apply(null, heights[productPart])
        if (heights[productPart][0] === min) {
          return 0
        } else if (heights[productPart][1] === min) {
          return 1
        } else if (heights[productPart][2] === min) {
          return 2
        }
      }
      const pushMenuItem = (list, column, noLevel1, productPart) => {
        list.forEach(level1 => {
          if (menuMap && menuMap.level1 && menuMap.level1[level1]) {
            if (!noLevel1) {
              menu.push({
                level: 1,
                column: column,
                value: level1,
                productPart: productPart,
              })
              heights[productPart][column] += 32
            }
            menuMap.levelMap[level1].forEach(item => {
              if (menuMap[item]) {
                menu.push({
                  level: 2,
                  name: item,
                  value: item,
                  column: column,
                  productPart: productPart,
                })
                heights[productPart][column] += 32
              }
            })
          }
        })
      }
      let productPart = this.PRODUCT_PART[0]
      if (
        menuMap.level0 &&
        menuMap.level0['数据标准'] &&
        inProduct('数据标准')
      ) {
        const rowIdx = decideNextRowIdx(productPart)
        menu.push({
          level: 0,
          value: '数据标准',
          column: rowIdx,
          productPart: productPart,
        })
        heights[productPart][rowIdx] += 70
        const list = [
          'dataStandardDashboard',
          'domain',
          'otherDomain',
          'indexMenu',
          'domainLanding',
          'statistical',
          'domainSystemSetting',
        ]
        pushMenuItem(list, rowIdx, false, productPart)
      }
      if (menuMap.level0 && menuMap.level0['元数据'] && inProduct('元数据')) {
        const rowIdx = decideNextRowIdx(productPart)
        menu.push({
          level: 0,
          value: '元数据',
          column: rowIdx,
          productPart: productPart,
        })
        heights[productPart][rowIdx] += 70
        const list = [
          'metaData',
          // 'businessData',
          'dataIntelligence',
          'dataResource',
          'lineage',
        ]
        pushMenuItem(list, rowIdx, false, productPart)
      }
      if (
        menuMap.level0 &&
        menuMap.level0['数据质量'] &&
        inProduct('数据质量')
      ) {
        const rowIdx = decideNextRowIdx(productPart)
        menu.push({
          level: 0,
          value: '数据质量',
          column: rowIdx,
          productPart: productPart,
        })
        heights[productPart][rowIdx] += 70
        const list = [
          'dataQualityReport',
          'ruleManagement',
          'qualityExamineJob',
          'repairJobManagement',
          'settingList',
        ]
        pushMenuItem(list, rowIdx, false, productPart)
      }
      /* if (
        menuMap.level0 &&
        menuMap.level0['指标管理'] &&
        inProduct('指标管理')
      ) {
        const rowIdx = decideNextRowIdx(productPart)
        menu.push({
          level: 0,
          value: '指标管理',
          column: rowIdx,
          productPart: productPart,
        })
        heights[productPart][rowIdx] += 70
        let list = ['homePage']
        pushMenuItem(list, rowIdx, true, productPart)
        list = ['demandManagement', 'indexManagement']
        pushMenuItem(list, rowIdx, false, productPart)
        list = ['indexModifier', 'indexTimer']
        pushMenuItem(list, rowIdx, true, productPart)
        list = ['themeDirectory', 'indexApply']
        pushMenuItem(list, rowIdx, false, productPart)
      } */

      if (this.currentProduct) {
      } else {
        productPart = this.PRODUCT_PART[1]
      }
      if (
        menuMap &&
        menuMap.level1 &&
        menuMap.level0['数据资产'] &&
        inProduct('dataAsset')
      ) {
        const rowIdx = decideNextRowIdx(productPart)
        menu.push({
          level: 0,
          value: 'dataAsset',
          column: rowIdx,
          productPart: productPart,
        })
        heights[productPart][rowIdx] += 70
        const list = [
          'assetApplication',
          'assetManage',
          'assetWorkbench',
          'assetSystemManage',
        ]
        pushMenuItem(list, rowIdx, false, productPart)
      }
      if (
        menuMap &&
        menuMap.level1 &&
        menuMap.level0['数据安全'] &&
        inProduct('数据安全')
      ) {
        const rowIdx = decideNextRowIdx(productPart)
        menu.push({
          level: 0,
          value: '数据安全',
          column: rowIdx,
          productPart: productPart,
        })
        heights[productPart][rowIdx] += 70
        const list = [
          'securityOverview',
          'enterpriseDataManagement',
          'classificationTool',
          'strategyManage',
          'dataDesensitization',
          'securitySystemManage',
          // 'gatewayManager',
        ]
        pushMenuItem(list, rowIdx, false, productPart)
      }
      if (
        menuMap &&
        menuMap.level1 &&
        menuMap.level0['数据服务'] &&
        inProduct('数据服务')
      ) {
        const rowIdx = decideNextRowIdx(productPart)
        menu.push({
          level: 0,
          value: '数据服务',
          column: rowIdx,
          productPart: productPart,
        })
        heights[productPart][rowIdx] += 70
        const list = ['serviceOverview', 'apiManage', 'applyManage', 'myApi']
        pushMenuItem(list, rowIdx, false, productPart)
      }
      if (
        menuMap &&
        menuMap.level1 &&
        menuMap.level0['安全网关'] &&
        inProduct('安全网关')
      ) {
        const rowIdx = decideNextRowIdx(productPart)
        menu.push({
          level: 0,
          value: '安全网关',
          column: rowIdx,
          productPart: productPart,
        })
        heights[productPart][rowIdx] += 70
        const list = ['gatewayManager']
        pushMenuItem(list, rowIdx, false, productPart)
      }
      // 6.4统一查询暂时不要
      // if (
      //   menuMap &&
      //   menuMap.level1 &&
      //   menuMap.level0['统一查询'] &&
      //   inProduct('统一查询')
      // ) {
      //   const rowIdx = decideNextRowIdx(productPart)
      //   menu.push({
      //     level: 0,
      //     value: '统一查询',
      //     column: rowIdx,
      //     productPart: productPart,
      //   })
      //   heights[productPart][rowIdx] += 70
      //   const list = ['unifiedQueryManager']
      //   pushMenuItem(list, rowIdx, false, productPart)
      // }
      /* if (menuMap && menuMap.level1 && menuMap.level0['资产大屏']) {
        const rowIdx = decideNextRowIdx(productPart)
        menu.push({
          level: 0,
          label: '资产大屏',
          column: rowIdx,
          productPart: productPart,
        })
        heights[productPart][rowIdx] += 70
        const list = ['homePageScreen']
        pushMenuItem(list, rowIdx, false, productPart)
      } */
      // if (menuMap && menuMap.level1 && menuMap.level1['catalog']) {
      //   let rowIdx = decideNextRowIdx(productPart)
      //   menu.push({
      //     level: 0,
      //     label: '数据目录',
      //     column: rowIdx,
      //     productPart: productPart
      //   })
      //   heights[productPart][rowIdx] += 70
      //   const list = ['catalog']
      //   pushMenuItem(list, rowIdx, true, productPart)
      // }

      if (this.currentProduct) {
      } else {
        productPart = this.PRODUCT_PART[2]
      }
      // if (
      //   menuMap &&
      //   menuMap.level1 &&
      //   menuMap.level1.dataModeling &&
      //   inProduct('dataModeling')
      // ) {
      //   const rowIdx = decideNextRowIdx(productPart)
      //   menu.push({
      //     level: 0,
      //     value: 'dataModeling',
      //     column: rowIdx,
      //     productPart: productPart,
      //   })
      //   heights[productPart][rowIdx] += 70
      //   const list = ['dataModeling']
      //   pushMenuItem(list, rowIdx, true, productPart)
      // }
      // if (
      //   menuMap &&
      //   menuMap.level1 &&
      //   menuMap.level1.dataModelingMgr &&
      //   inProduct('dataModelingMgr')
      // ) {
      //   const rowIdx = decideNextRowIdx(productPart)
      //   menu.push({
      //     level: 0,
      //     value: 'dataModelingMgr',
      //     column: rowIdx,
      //     productPart: productPart,
      //   })
      //   heights[productPart][rowIdx] += 70
      //   const list = ['dataModelingMgr']
      //   pushMenuItem(list, rowIdx, true, productPart)
      // }

      if (this.currentProduct) {
      } else {
        productPart = this.PRODUCT_PART[3]
      }
      if (
        menuMap &&
        menuMap.level1 &&
        menuMap.level1.userPane &&
        inProduct('userPane')
      ) {
        const rowIdx = decideNextRowIdx(productPart)
        menu.push({
          level: 0,
          value: 'userPane',
          column: rowIdx,
          productPart: productPart,
        })
        heights[productPart][rowIdx] += 70
        const list = ['userPane']
        pushMenuItem(list, rowIdx, true, productPart)
      }
      if (
        menuMap &&
        menuMap.level1 &&
        menuMap.level1.process &&
        inProduct('process')
      ) {
        const rowIdx = decideNextRowIdx(productPart)
        menu.push({
          level: 0,
          value: 'process',
          column: rowIdx,
          productPart: productPart,
        })
        heights[productPart][rowIdx] += 70
        const list = ['process']
        pushMenuItem(list, rowIdx, true, productPart)
      }
      if (
        menuMap &&
        menuMap.level1 &&
        menuMap.level1.systemManage &&
        inProduct('systemManage')
      ) {
        const rowIdx = decideNextRowIdx(productPart)
        menu.push({
          level: 0,
          value: 'systemManage',
          column: rowIdx,
          productPart: productPart,
        })
        heights[productPart][rowIdx] += 70
        const list = ['systemManage']
        pushMenuItem(list, rowIdx, true, productPart)
      }
      if (!this.currentProductName) {
        this.AllMenu = _.cloneDeep(menu)
      }
      this.menu = menu
    },
    getMenuMap() {
      this.menuMap = this.$store.state.menuMap
      this.buildMenu()
    },
    preGoPreview(current, menu, isCollect) {
      isCollect && this.openAllProducts()
      const all = this.AllMenu
      const findNext = current => {
        for (let i = 0; i < all.length; i++) {
          const item = all[i]
          if (item.level === current.level && item.value === current.value) {
            return all[i + 1]
          }
        }
      }
      if (current.level === 2) {
        this.goPreview(current.name)
      } else if (current.level === 1) {
        const next = findNext(current)
        this.goPreview(next.name)
      } else if (current.level === 0) {
        let next = findNext(current)
        if (next.name) {
          this.goPreview(next.name)
        } else {
          next = findNext(next)
          this.goPreview(next.name)
        }
      }
    },
    goPreview(routerName) {
      const handleDDMCommand = () => {
        let baseUrl = HTTP.getDdmLoginUrl()
        if (routerName === 'dataModelingModelMap') {
          window.open(baseUrl + '#/main/list')
        } else {
          window.open(baseUrl + '#/main/dashboard?command=' + routerName)
        }
      }
      if (routerName.includes('dataModeling')) {
        handleDDMCommand()
      } else if (routerName.includes('assetHome')) {
        const preUrl = window.location.href.split('#')[0]
        window.open(
          preUrl + this.$router.resolve({ path: '/main/dataAsset/home' }).href
        )
      } else if (routerName.includes('assetOverview')) {
        const pos = location.href.indexOf('#/')
        const baseUrl = location.href.slice(0, pos + 2)
        window.open(baseUrl + 'main/dataAsset/overview')
      } else {
        if (this.$route.name === routerName) {
          this.reload()
        } else {
          this.$router.push({
            name: routerName,
          })
        }
      }
      this.$emit('close-bucket')
    },
    collect(item) {
      this.$set(this.collections, item.value + item.level, item)
      this.$parent.$parent.saveToDatabase(
        '6.2collections-' + this.$user.username,
        this.collections
      )
    },
    cancelCollect(item) {
      this.$delete(this.collections, item.value + item.level)
      this.$parent.$parent.saveToDatabase(
        '6.2collections-' + this.$user.username,
        this.collections
      )
    },
    tempSaveCollect1(c) {
      this.isEditProductMode = Object.keys(c).length !== 0
      if (this.isEditProductMode) {
        this.newProductName = ''
      }
    },
    collect1(item) {
      this.$set(this.collections1, item.value + item.level, item)
      this.$emit('collection1-change', this.collections1)
      // this.$parent.$parent.saveToDatabase('6.2collections1', this.collections1)
      this.tempSaveCollect1(this.collections1)
    },
    setIndex(item) {
      if (item) {
        this.indexOfCurrent = item.value
        this.$store.commit('changeDamProductIndex', item.value)
      } else {
        this.indexOfCurrent = ''
        this.$store.commit('changeDamProductIndex', '')
      }

      this.products.forEach(item => {
        if (item.name === this.currentProductName) {
          item.index = this.indexOfCurrent
          this.$parent.$parent.saveToDatabase(
            '6.2collections1-list',
            this.products
          )
        }
      })
    },
    cancelCollect1(item) {
      this.$delete(this.collections1, item.value + item.level)
      this.$emit('collection1-change', this.collections1)
      this.tempSaveCollect1(this.collections1)
      // this.$parent.$parent.saveToDatabase('6.2collections1', this.collections1)
    },
    saveProduct() {
      this.isEditProductMode = false
      this.addProduct({
        collection: this.collections1,
        name: this.newProductName,
      })
      this.collections1 = {}
      this.$emit('collection1-change', this.collections1)
    },
    addProduct({ name, collection }) {
      if (this.productsName.includes(name)) {
      } else {
        this.products.push({
          name: name,
          index: '',
        })
      }
      this.$parent.$parent.saveToDatabase('6.2collections1-list', this.products)
      this.$parent.$parent.saveToDatabase(
        '6.2collections1-product-' + name,
        collection
      )
    },
    getProducts() {
      this.$parent.$parent
        .getFromDatabase('6.2collections1-list')
        .then(data => {
          if (data && typeof data === 'string') {
            const products = []
            const rawData = JSON.parse(data)
            rawData.forEach(item => {
              if (typeof item === 'string') {
                products.push({
                  name: item,
                  index: '',
                })
              } else if (typeof item === 'object' && item.name) {
                products.push(item)
              } else {
                throw new Error('product-name 识别错误')
              }
            })
            this.products = products
          } else {
            this.products = []
          }
        })
    },
    closeDialog() {
      this.renameDialogVisible = false
    },
    renameAction() {
      const oldName = this.products[this.renameIndex].name
      this.$parent.$parent
        .getFromDatabase('6.2collections1-product-' + oldName)
        .then(data => {
          this.$parent.$parent.saveToDatabase(
            '6.2collections1-product-' + this.renameDialogJson.name,
            JSON.parse(data)
          )
          this.$parent.$parent.saveToDatabase(
            '6.2collections1-product-' + oldName,
            {}
          )
        })
      this.$set(
        this.products[this.renameIndex],
        'name',
        this.renameDialogJson.name
      )
      this.$parent.$parent.saveToDatabase('6.2collections1-list', this.products)
      if (this.currentProductName === oldName) {
        this.currentProductName = this.renameDialogJson.name
        this.$store.commit('changeDamProduct', this.currentProductName)
      }
      this.closeDialog()
    },
    handleContextMenu(productName, evt) {
      if (this.isAdmin) {
        this.callContext(productName, evt, false)
      }
    },
    callContext(productName, evt, fromRight) {
      evt.stopPropagation()
      const x = evt.clientX
      const y = evt.clientY
      const idx = this.productsName.indexOf(productName)
      const swap = index => {
        const temp = this.products[index + 1]
        this.$set(this.products, index + 1, this.products[index])
        this.$set(this.products, index, temp)
        this.$parent.$parent.saveToDatabase(
          '6.2collections1-list',
          this.products
        )
      }
      const options = [
        {
          icon: 'iconfont icon-revise',
          label: this.$t('common.bucket.options.rename'),
          callback: () => {
            this.renameIndex = idx
            this.renameDialogJson.name = productName
            this.renameDialogVisible = true
          },
          args: null,
        },
        {
          line: 'solid',
        },
      ]
      if (idx > 0) {
        options.push({
          icon: 'iconfont icon-up',
          label: this.$t('common.bucket.options.up'),
          callback: () => {
            swap(idx - 1)
          },
          args: null,
        })
      }
      if (idx < this.products.length - 1) {
        options.push({
          icon: 'iconfont icon-down',
          label: this.$t('common.bucket.options.down'),
          callback: () => {
            swap(idx)
          },
          args: null,
        })
      }
      if (this.products.length > 1) {
        options.push({
          line: 'solid',
        })
      }
      options.push({
        icon: 'iconfont icon-delete',
        label: this.$t('common.bucket.options.delete'),
        callback: () => {
          this.preRemoveProduct(productName)
        },
        args: null,
      })
      if (options.length > 0) {
        let yOfResult = y
        let bottomMargin = 30 * options.length + 15
        if (window.innerHeight - y < bottomMargin) {
          yOfResult = window.innerHeight - bottomMargin
        }
        this.$bus.$emit('callContextMenu', {
          x: x,
          y: yOfResult,
          options: options,
          placement: fromRight ? 'left' : 'right',
        })
      }
    },
    preRemoveProduct(name) {
      this.$confirm(this.$t('common.bucket.edit.sureToDelete', [name]), '', {
        type: 'warning',
      })
        .then(() => {
          if (this.productsName.includes(name)) {
            this.products.splice(this.productsName.indexOf(name), 1)
          } else {
          }
          this.$parent.$parent.saveToDatabase(
            '6.2collections1-list',
            this.products,
            () => {
              if (name === this.currentProductName) {
                this.$store.commit('changeDamProduct', null)
                this.$store.commit('changeDamProductIndex', '')
                this.currentProductName = ''
                this.currentProduct = null
              }
              this.getProducts()
            }
          )
        })
        .catch(() => {})
    },
    openProduct(product) {
      const productName = product.name
      this.isEditProductMode = false
      this.$store.commit('changeDamProduct', productName)
      this.$store.commit('changeDamProductIndex', product.index)
      this.indexOfCurrent = product.index
      this.getCollections1()
    },
    openAllProducts() {
      this.$store.commit('changeDamProduct', null)
      this.$store.commit('changeDamProductIndex', '')
      this.currentProductName = ''
      this.currentProduct = null
      this.collections1 = {}
      this.$emit('collection1-change', this.collections1)
      this.getMenuMap()
    },
    highlightItem() {
      const keyword = this.keyword
      if (keyword) {
        let cnt = 0
        this.menu.forEach(item => {
          if (item.value) {
            if (
              PinyinMatch.match(this.$t('common.page.' + item.value), keyword)
            ) {
              if (item.level === 2) {
                this.hideLv2 = false
              }
              item.isResult = true
              cnt++
            } else {
              item.isResult = false
            }
          }
        })
        this.resultCount = cnt
      } else {
        this.menu.forEach(item => {
          item.isResult = false
        })
        this.resultCount = 0
      }
    },
    findCurrentHighlightTopNav(route) {
      const findLv0AndLv1 = (item, index) => {
        const o = {}
        let current = null
        let currentIdx = index
        do {
          currentIdx -= 1
          current = this.menu[currentIdx]
        } while (current.level === 2)
        if (current.level === 0) {
          o.lv0 = current.value + current.level
          return o
        } else {
          o.lv1 = current.value + current.level
        }
        do {
          currentIdx -= 1
          current = this.menu[currentIdx]
        } while (current.level >= 1)
        o.lv0 = current.value + current.level
        return o
      }
      const interval = setInterval(() => {
        if (this.menu) {
          this.menu.forEach((item, index) => {
            if (item.name === route.name) {
              const o = findLv0AndLv1(item, index)
              const result = {
                lv2: item.value + item.level,
                lv1: o.lv1,
                lv0: o.lv0,
              }
              this.$emit(
                'highlight-top-nav',
                result.lv2 + result.lv1 + '-lv0-' + result.lv0
              )
            }
          })
          clearInterval(interval)
        }
      }, 50)
    },
  },
  watch: {
    keyword(value) {
      this.highlightItem()
    },
    $route: {
      handler(route) {
        this.findCurrentHighlightTopNav(route)
      },
      immediate: true,
    },
    hideLv2(val) {
      this.$refs.middleMain.scrollTop = 0
      localStorage.setItem('hideLv2', val)
    },
    '$store.state.menuMap': {
      handler() {
        this.getMenuMap()
      },
    },
    currentProductName() {
      this.getMenuMap()
    },
  },
}
