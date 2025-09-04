import componentBlock from './componentBlock.vue'
import _ from 'lodash';
export default {
  components: {
    componentBlock,
  },
  props: {
    isActive: {
      type: Boolean,
      default: false,
    },
    pagesTree: {},
    pagesMap: {},
  },
  data() {
    return {
      menuMap: null,
      menu: null,
      hideLv2: true,
      FULL_PRODUCT_PART: ['ddg', 'dda', 'ddm', 'common'],
      button: {
        list: require('./images/button_list.svg'),
        listChecked: require('./images/button_list_checked.svg'),
        block: require('./images/button_block.svg'),
        blockChecked: require('./images/button_block_checked.svg'),
      },
      currentProductName: '',
      products: [],
      currentProduct: null,
      renameDialogVisible: false,
      renameDialogJson: {
        name: '',
      },
      renameIndex: -1,
    }
  },
  mounted() {
    // this.buildMenu()
    this.buildPages()
  },
  beforeDestroy() {
  },
  methods: {
    getFirstPage(index) {
      try {
        let pagesTree = this.pagesTree
        if (this.pagesTree.hasOwnProperty(`$t('common.page.systemManage')`)) {
          pagesTree = _.cloneDeep(this.pagesTree)
          delete pagesTree[`$t('common.page.systemManage')`]["$t('common.page.process')"]
        }
        const lv1 = this.pagesTree[index]
        const lv2 = Object.values(lv1)[0]
        return lv2[0]
      } catch(e) {
        return false
      }
    },
    buildPages() {
      const menus = []
      let menu = {
        part: '数据资产治理',
        pages: [],
      }
      ;['元数据', '数据质量', '指标管理'].forEach(moduleName => {
        if (this.pagesTree.hasOwnProperty(`$t('common.page.${moduleName}')`)) {
          const firstPage = this.getFirstPage(`$t('common.page.${moduleName}')`)
          if (firstPage) {
            menu.pages.push({
              title: moduleName,
              firstPage: firstPage
            })
          }
        }
      })
      if (menu.pages.length > 0) {
        menus.push(menu)
      }

      menu = {
        part: '数据资产服务',
        pages: [],
      }
      if (this.pagesTree.hasOwnProperty(`$t('common.page.数据资产')`)) {
        if (this.pagesTree[`$t('common.page.数据资产')`][`$t('common.page.assetApplication')`] && this.pagesTree[`$t('common.page.数据资产')`][`$t('common.page.assetApplication')`].includes('assetAnalysis')) {
          menu.pages.push({
            title: '数据资产',
            firstPage: 'assetAnalysis'
          })
        }
        if (this.pagesTree[`$t('common.page.数据资产')`][`$t('common.page.assetApplication')`] && this.pagesTree[`$t('common.page.数据资产')`][`$t('common.page.assetApplication')`].includes('dataMarketplace')) {
          menu.pages.push({
            title: 'dataMarketplace',
            firstPage: 'dataMarketplace'
          })
        }
      }
      ;['数据安全', '数据服务', '安全网关'].forEach(moduleName => {
        if (this.pagesTree.hasOwnProperty(`$t('common.page.${moduleName}')`)) {
          const firstPage = this.getFirstPage(`$t('common.page.${moduleName}')`)
          if (firstPage) {
            menu.pages.push({
              title: moduleName,
              firstPage: firstPage
            })
          }
        }
      })
      if (menu.pages.length > 0) {
        menus.push(menu)
      }
      menu = {
        part: '通用配置',
        pages: [{
          title: 'userPane',
          firstPage: 'userModal'
        }]
      }
      if (this.pagesTree.hasOwnProperty(`$t('common.page.systemManage')`)) {
        if (this.pagesTree[`$t('common.page.systemManage')`][`$t('common.page.process')`] && this.pagesTree[`$t('common.page.systemManage')`][`$t('common.page.process')`].length > 0) {
          menu.pages.push({
            title: 'process',
            firstPage: this.pagesTree[`$t('common.page.systemManage')`][`$t('common.page.process')`][0]
          })
        }
        if (Object.keys(this.pagesTree[`$t('common.page.systemManage')`]).some(item => item !== `$t('common.page.process')`)) {
          menu.pages.push({
            title: 'systemManage',
            firstPage: this.getFirstPage("$t('common.page.systemManage')")
          })
        }
      }

      menus.push(menu)
      this.menu = menus
    },
    buildMenu() {
      const menuMap = this.menuMap
      const menu = []
      const heights = {}
      if (this.currentProduct) {
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
      if (
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
      }

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
          'assetMetadataCollection',
          'assetMetadataMapping',
          'assetModelMapping',
          'droppingInspection',
          'dataFlow',
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
      if (
        menuMap &&
        menuMap.level1 &&
        menuMap.level1.dataModeling &&
        inProduct('dataModeling')
      ) {
        const rowIdx = decideNextRowIdx(productPart)
        menu.push({
          level: 0,
          value: 'dataModeling',
          column: rowIdx,
          productPart: productPart,
        })
        heights[productPart][rowIdx] += 70
        const list = ['dataModeling']
        pushMenuItem(list, rowIdx, true, productPart)
      }
      if (
        menuMap &&
        menuMap.level1 &&
        menuMap.level1.dataModelingMgr &&
        inProduct('dataModelingMgr')
      ) {
        const rowIdx = decideNextRowIdx(productPart)
        menu.push({
          level: 0,
          value: 'dataModelingMgr',
          column: rowIdx,
          productPart: productPart,
        })
        heights[productPart][rowIdx] += 70
        const list = ['dataModelingMgr']
        pushMenuItem(list, rowIdx, true, productPart)
      }

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
      this.menu = menu
    },
    getMenuMap() {
      this.menuMap = this.$store.state.menuMap
      this.buildMenu()
    },
    preGoPreview(current) {
      this.$emit('close-bucket')
      setTimeout(_ => {
        const Nav = this.$parent.$parent.$parent.$parent.$refs.nav
        Nav.handleMenuSelect(current)
      }, 1000)
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
    $route: {
      handler(route) {
        this.findCurrentHighlightTopNav(route)
      },
      immediate: true,
    },
    '$store.state.menuMap': {
      handler() {
        this.getMenuMap()
      },
    },
  },
}
