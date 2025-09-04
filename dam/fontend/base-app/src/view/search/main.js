import listDetail from './listDetail.vue'
import newsListDetail from './newsListDetail.vue'
import HTTP from '../../http/main'
import comTree from './comTree.vue'
import ResizeHorizontal from '@/components/common/ResizeHorizontal'
import _ from 'lodash'
import Visible from './icon/visible.vue'
import PinyinMatch from 'pinyin-match'
import LDMTypes from '@constant/LDMTypes'
export default {
  components: {
    listDetail,
    newsListDetail,
    comTree,
    Visible,
  },
  data() {
    const { grey, greyBorder } = this.$style
    const [absolute, relative] = ['absolute', 'relative']
    return {
      selectedTagMoudleLen: 0,
      showTagCollapse: false,
      filterTagHeight: 1,
      showTagFolder: false,
      $window: window,
      style: {},
      allDataNameStr: '全部数据',
      nav: [],
      tags: {},
      sort: {
        com: true,
        quality: false,
        clickCount: false,
      },
      sortLabel: {
        com: '综合',
        amount: '使用量',
        comment: '评论数',
        date: '更新时间',
        quality: '评分',
        clickCount: '浏览量',
      },
      sortPara: {},
      ps: null,
      filterPs: null,
      catalogs: {},
      catalogsMap: undefined,
      currentCatalogId: undefined,
      tables: [],
      tagCntMap: {},
      modelTypes: [],
      modelCntMap: {},
      keyword: '',
      lastKeyword: '',
      tagIds: null,
      catalogPath: [], // [{catalogId: name}]
      currentCatalogs: '/0',
      lastCatalogs: '',
      contentLoading: true,
      listKey: 0,
      lastNoTagSearch: {
        blur: false,
        keyword: '',
        catalogs: '',
        tagsResult: null,
      },
      dataTypes: {
        Entity: {
          label: '表/视图',
          typeId: [LDMTypes.Entity, LDMTypes.View],
        },
        Report: {
          label: '报表',
          typeId: [LDMTypes.Report],
        },
        API: {
          label: '数据服务',
          typeId: [LDMTypes.API],
        },
        ShareFile: {
          label: '文件',
          typeId: [LDMTypes.ShareFile],
        },
        Domain: {
          label: '数据标准',
          typeId: [LDMTypes.Domain],
        },
        DomainCode: {
          label: '标准代码',
          typeId: [LDMTypes.CODE],
        },
        Index: {
          label: '指标标准',
          typeId: [LDMTypes.Index],
        },
      },
      selectedDataTypes: [],
      currentPage: 1,
      totalItems: 0,
      pageSize: 10,
      displayPath: ['全部结果'],
      udps: [],
      udpsMap: {},
      udpValue: {},
      filterPopoverVisible: false,
      tagGroupList: [],
      filterPopoverTableData: [],
      tableKey: 0,
      isAdmin: this.$isAdmin,
      tagCollection: {},
      udpCollection: {},
      tagFilterKeyword: '',
      udpNoValueSet: new Set(),
      notAnyTag: true,
    }
  },
  beforeMount() {
    if (!this.$ddsConnectable) {
      delete this.dataTypes.API
    }
  },
  mounted() {
    if (this.$route.query.types) {
      const selectedDataTypes = this.$route.query.types
        ? String(this.$route.query.types)
            .split(',')
            .map(i => parseInt(i))
        : []
      // 临时解决数据标准和指标标准返回类型相同的策略，待后台完善可撤销此操作
      if (
        selectedDataTypes.length === 2 &&
        selectedDataTypes.includes(80010066) &&
        selectedDataTypes.includes(82800003)
      ) {
        this.$set(this, 'selectedDataTypes', [
          this.dataTypes.Index.typeId,
          this.dataTypes.Domain.typeId,
        ])
      } else {
        const selData = selectedDataTypes[0]
        switch (selData) {
          case LDMTypes.Index:
            this.$set(this, 'selectedDataTypes', [this.dataTypes.Index.typeId])
            break
          case LDMTypes.CODE:
            this.$set(this, 'selectedDataTypes', [
              this.dataTypes.DomainCode.typeId,
            ])
            break
          case LDMTypes.Domain:
            this.$set(this, 'selectedDataTypes', [this.dataTypes.Domain.typeId])
            break
          case LDMTypes.ShareFile:
            this.$set(this, 'selectedDataTypes', [
              this.dataTypes.ShareFile.typeId,
            ])
            break
          case LDMTypes.API:
            this.$set(this, 'selectedDataTypes', [this.dataTypes.API.typeId])
            break
          case LDMTypes.Report:
            this.$set(this, 'selectedDataTypes', [this.dataTypes.Report.typeId])
            break
          case LDMTypes.Entity:
          case LDMTypes.View:
            this.$set(this, 'selectedDataTypes', [this.dataTypes.Entity.typeId])
            break
        }
      }
    }
    this.initResizeHorizontal()
    this.initPerfectScrollbar()
    this.initEventListener()
    const query = this.$route.query
    this.catalogs = this.$globalData.catalogs
    this.catalogsMap = this.$globalData.catalogsMap
    console.log(query)
    if (query.hasOwnProperty('catalogId')) {
      this.currentCatalogId = parseInt(query.catalogId)
      this.initNav(this.currentCatalogId)
    } else if (query.hasOwnProperty('keyword')) {
      this.keyword = query.keyword
      this.initNav(this.currentCatalogId)
    } else if (query.hasOwnProperty('categories')) {
      this.initNav('categories')
    } else {
      this.getSearchResults()
    }
    this.prepareTags()
    this.getTagGroupList(list => {
      this.getUdps(list)
    })
  },
  watch: {
    $route() {
      this.currentPage = 1
      this.catalogPath.splice(0, this.catalogPath.length)
      const query = this.$route.query
      this.catalogs = this.$globalData.catalogs
      this.catalogsMap = this.$globalData.catalogsMap
      if (query.hasOwnProperty('keyword')) {
        this.keyword = query.keyword
      }
      if (query.hasOwnProperty('catalogId')) {
        this.currentCatalogId = parseInt(query.catalogId)
        this.initNav(this.currentCatalogId)
      } else if (query.hasOwnProperty('keyword')) {
        this.keyword = query.keyword
        this.initNav()
      } else if (query.hasOwnProperty('categories')) {
        this.initNav('categories')
      }
    },
    selectedTagMoudleLen() {
      this.calculateFilterHeight()
    },
    keyword(val) {
      if (!val) {
        this.$router.push({
          name: 'search',
          query: {
            keyword: '',
          },
        })
        this.currentPage = 1
        this.getSearchResults()
      }
    },
    filterPopoverVisible(visible) {
      if (!visible) {
        this.tagFilterKeyword = ''
      }
    },
  },
  beforeDestroy() {
    if (this.ps) {
      this.ps.destroy()
    }
    if (this.filterPs) {
      this.filterPs.destroy()
    }
    $(window).off('resize', this.handleResize)
  },
  methods: {
    skipBussCatelog() {
      this.$router.push({ name: 'businessCatalog' })
    },
    initEventListener() {
      const job = () => {
        this.filterPopoverVisible = false
      }
      const dom = $(this.$refs['filter-popover'])
      dom.on('mouseenter', () => {
        $(document.body).off('click', job)
      })
      dom.on('mouseleave', () => {
        $(document.body).one('click', job)
      })
      $(this.$el).on('mouseenter', '.filter-header-btn.active', function () {
        $(document.body).off('click', job)
      })
      $(this.$el).on('mouseleave', '.filter-header-btn.active', function () {
        $(document.body).one('click', job)
      })
    },
    search() {
      this.$router
        .push({ name: 'search', query: { keyword: this.keyword } })
        .catch(() => {})
      this.$bus.$emit('resetKeyword', this.keyword)
      // this.$bus.$emit('handleDataList',{type:'clear'});
      $('#sug-list').hide()
    },
    handleInputFocus(event) {
      const element = $(event.srcElement)
      const offset = element.offset()
      const { offsetHeight: height, offsetWidth: width } = element[0]
      this.$bus.$emit('handleDataList', {
        type: 'focus',
        height: height,
        width: width,
        left: offset.left,
        top: offset.top - 50,
      })
      if (!this.keyword) {
        this.emitInputChangeFromLocal()
      }
    },
    emitInputChangeFromLocal() {
      const local = localStorage.getItem('recentSearch')
      let options = []
      if (local) {
        options = local.split('||').reverse()
      } else {
        options = []
      }
      this.$bus.$emit('handleDataList', {
        type: 'change',
        local: true,
        options: options,
      })
    },
    handleInputBlur() {
      this.$bus.$emit('handleDataList', {
        type: 'blur',
      })
    },
    tagsVisible(groupName, tagName, tagValue) {
      const keyword = this.tagFilterKeyword
      if (!keyword) {
        return true
      }
      const groupIn = contentIncludes => {
        const groupFit = PinyinMatch.match(groupName, keyword)
        const tags = this.filterPopoverTableDataDisplay.filter(
          i => i.groupName === groupName
        )
        if (groupFit) {
          return true
        } else if (contentIncludes) {
          const contentFit = tags.some(t => {
            let valueFit = false
            if (t.isUdp) {
              valueFit =
                this.udpsMap[t.id].selection &&
                this.udpsMap[t.id].selection
                  .filter(i => i)
                  .some(i => {
                    return PinyinMatch.match(i, keyword)
                  })
            } else {
              valueFit = this.tags[t.tagId].children.some(i => {
                return PinyinMatch.match(i.name, keyword)
              })
            }
            return PinyinMatch.match(t.tagName, keyword) || valueFit
          })
          if (contentFit) {
            return true
          }
        }
        return false
      }
      const tagIn = contentIncludes => {
        const tags = this.filterPopoverTableDataDisplay.filter(
          i => i.groupName === groupName
        )
        let valueFit = false
        const t = tags.filter(i => i.tagName === tagName)[0]
        if (!contentIncludes) {
          return PinyinMatch.match(t.tagName, keyword)
        }

        if (t.isUdp) {
          valueFit =
            this.udpsMap[t.id].selection &&
            this.udpsMap[t.id].selection
              .filter(i => i)
              .some(i => {
                return PinyinMatch.match(i, keyword)
              })
        } else {
          valueFit = this.tags[t.tagId].children.some(i => {
            return PinyinMatch.match(i.name, keyword)
          })
        }
        return PinyinMatch.match(t.tagName, keyword) || valueFit
      }
      const valueIn = () => {
        return PinyinMatch.match(tagValue, keyword)
      }
      if (groupName && !tagName) {
        if (groupIn(true)) {
          return true
        }
      } else {
        if (groupIn()) {
          return true
        }
      }
      if (tagName && !tagValue) {
        if (tagIn(true)) {
          return true
        }
      } else if (tagName) {
        if (tagIn()) {
          return true
        }
      }
      if (tagValue) {
        if (valueIn()) {
          return true
        }
      }
    },
    initResizeHorizontal() {
      setTimeout(() => {
        new ResizeHorizontal(
          $('.content-tree'),
          $('.right-part'),
          $('.resize-column-middle'),
          $('.page-container')
        )
      }, 1000)
    },
    handleCurrentChange(current) {
      this.currentPage = current
      this.getSearchResults()
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.currentPage = 1
      this.getSearchResults()
    },
    getTagGroupList(callback) {
      this.$http
        .get(this.$url + '/service/tags/group')
        .then(res => {
          res.data.sort((a, b) => {
            if (typeof a.order === 'number' && typeof b.order === 'number') {
              return a.order - b.order
            }
            if (!a.order) {
              return 1
            }
            if (!b.order) {
              return -1
            }
          })
          this.tagGroupList = res.data
          const filterPopoverTableData = []
          this.tagGroupList.forEach(item => {
            this.moreTags
              .filter(t => {
                return t.tagGroupId === item.id
              })
              .forEach(t => {
                filterPopoverTableData.push({
                  groupId: item.id,
                  groupName: item.name,
                  tagId: t.id,
                  tagName: t.name,
                })
              })
          })
          callback(filterPopoverTableData)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    prepareTags() {
      const tags = {}
      const tmpTags = _.cloneDeep(this.$globalData.tags)
      for (const groupId in tmpTags) {
        const group = tmpTags[groupId]
        const children = []
        group.children.forEach(t => {
          children.push(t)
        })
        tags[group.id] = {
          id: group.id,
          name: group.name,
          children: children,
          selection: [],
          tagGroupId: group.tagGroupId,
        }
      }
      this.tags = tags
      this.calculateFilterHeight()
    },
    handleTagCollapse(data) {
      setTimeout(() => {
        const list = $(this.$refs.contentList)
        const tagBox = $('#tag-target')
        const tagFolder = $('#tag-folder')
        const navHeight = 50
        const height =
          Number.parseFloat($('#calculate-width').css('height')) - 10
        if (data) {
          tagBox.css('overflow', 'visible')
          tagBox.css('height', 'auto')
          this.showTagCollapse = false
          this.showTagFolder = true

          let filterTagHeight = $('#tag-target')[0]
            ? $('#tag-target')[0].offsetHeight / 40
            : 1
          tagBox.css('height', self.filterTagHeight * 40)
          list.css('top', height + navHeight + (filterTagHeight - 1) * 40)
          tagFolder.css('margin-top', filterTagHeight * 40 - 30)
        } else {
          tagBox.css('overflow', 'hidden')
          tagBox.css('height', 80)
          list.css('top', height + navHeight + 40)
          this.showTagCollapse = true
          this.showTagFolder = false
        }
      })
    },
    calculateFilterHeight() {
      setTimeout(() => {
        let filterTagHeight = $('#tag-target')[0]
          ? $('#tag-target')[0].offsetHeight / 40
          : 1
        const height =
          Number.parseFloat($('#calculate-width').css('height')) - 10
        const list = $(this.$refs.contentList)
        const sort = $('.content-sort')
        const nav = $('.content-nav')
        const tagBox = $('#tag-target')
        const navHeight = 50
        nav.css('height', height + 10)
        sort.css('top', height + 10)
        if (filterTagHeight > 2) {
          this.showTagCollapse = true
          tagBox.css('height', 80)
          tagBox.css('overflow', 'hidden')
          list.css('top', height + navHeight + 40)
          this.showTagCollapse = true
          this.showTagFolder = false
        } else {
          this.showTagCollapse = false
          this.showTagFolder = false
          list.css('top', height + navHeight + (filterTagHeight - 1) * 40)
        }
      })
    },
    tagsLabel(selection) {
      if (selection && selection.length > 0) {
        return ' : ' + selection.map(item => item.name).join(', ')
      } else {
        return ''
      }
    },
    udpLabel(udpId, udpValue) {
      if (this.udpValue[udpId] && udpValue) {
        return ' : ' + udpValue
      } else {
        return ''
      }
    },
    handleFakeSelectorClick(id) {
      $('#realSelector' + id).click()
    },
    handleCheckboxChange(type, bool) {
      for (const i in this.sort) {
        this.sort[i] = false
      }
      this.sort[type] = true
      let sortPara = {}
      if (type === 'quality') {
        sortPara = {
          vote: 'DESC',
        }
      }
      if (type === 'clickCount') {
        sortPara = {
          clickCount: 'DESC',
        }
      }
      this.sortPara = sortPara
      this.currentPage = 1
      this.getSearchResults()
    },
    initPerfectScrollbar() {
      /* setTimeout(()=>{
        let listContainer =  this.$refs.contentList;
        this.ps = new NewPs(listContainer);
      }); */
      $(window).on('resize', this.handleResize)
    },
    handleResize() {
      /* setTimeout(()=>{
        if(this.ps){
          this.ps.update();
        }
        if(this.filterPs){
          this.filterPs.update();
        }
      },300); */
      this.computeNavHeight()
    },
    initNav(catalogId) {
      const [arr, map] = [this.catalogs, this.catalogsMap]
      if (catalogId === 'categories') {
        this.getSearchResults()
      } else if (map.has(catalogId)) {
        if (catalogId === 0) {
          this.currentCatalogs = '/0'
        } else {
          let cur = map.get(catalogId)
          const navIds = []
          if (cur.children.length > 0) {
            navIds.push({ id: null, candidates: cur })
          }
          navIds.push({
            id: catalogId,
            candidates: map.get(map.get(catalogId).parentId),
          })
          while (cur.parentId) {
            navIds.push({
              id: cur.parentId,
              candidates: map.get(map.get(cur.parentId).parentId),
            })
            cur = map.get(cur.parentId)
          }
          this.nav = navIds.reverse()

          this.nav.forEach(item => {
            this.catalogPath.push(item.id)
          })

          this.currentCatalogs = '/0'
          this.catalogPath.forEach(item => {
            if (typeof item === 'number' && item !== 0) {
              this.currentCatalogs += '/' + item
            }
          })
        }
        this.getSearchResults()
      } else {
        this.nav = [{ id: 0, candidates: map.get(0) }]
        this.catalogPath = [0]
        this.currentCatalogs = '/0'
        this.getSearchResults()
      }
    },
    getSearchResults(deleteTagId) {
      this.lastKeyword = this.keyword
      const query = this.$route.query
      if (this.lastCatalogs !== this.currentCatalogs) {
        this.modelTypes = []
        this.tagIds = []
      }
      this.contentLoading = true
      const tagMap = this.$globalData.tagMap
      const tagParent = new Map()
      const tagIdsArray = []
      this.tagIds &&
        this.tagIds.forEach(item => {
          if (tagParent.has(tagMap.get(item).parentId)) {
          } else {
            tagParent.set(tagMap.get(item).parentId, [])
          }
          tagParent.get(tagMap.get(item).parentId).push(item)
        })
      tagParent.forEach(tags => {
        if (tags.indexOf(deleteTagId) > -1) {
          let index = tags.indexOf(deleteTagId)
          delete tags[index]
        }
        let newTag = tags.filter(item => {
          if (item) return item
        })
        newTag.length ? tagIdsArray.push(newTag) : null
      })
      console.log(tagIdsArray)
      let udpFilters = null
      if (this.udpValue) {
        Object.keys(this.udpValue).forEach(v => {
          if (this.udpValue[v] && this.udpValue[v].length > 0) {
            if (!udpFilters) {
              udpFilters = {}
            }
            udpFilters[v] = this.udpValue[v].join('@\n@')
          }
        })
      }
      let keyword
      if (this.keyword.indexOf('*') !== -1) {
        // keyword = this.keyword.toLowerCase()
        keyword = this.keyword
      } else {
        // keyword = this.keyword.toLowerCase() + '*'
        keyword = this.keyword + '*'
      }
      let categories = null
      if (query.hasOwnProperty('categories')) {
        categories = query.categories.split(',')
        categories = categories
          .map(item => parseInt(item))
          .filter(item => !!item)
      }
      // let typeIds = [
      //   LDMTypes.Report,
      //   LDMTypes.DataStageJob,
      //   LDMTypes.Domain,
      //   LDMTypes.ShareFile,
      //   LDMTypes.CODE,
      //   LDMTypes.Entity,
      //   LDMTypes.Index,
      // ];
      let typeIds = Object.keys(this.dataTypes).map(key => {
        return this.dataTypes[key].typeId[0]
      })

      if (this.selectedDataTypes.length > 0) {
        typeIds = []
        for (let i = 0; i < this.selectedDataTypes.length; i++) {
          typeIds = typeIds.concat(this.selectedDataTypes[i])
        }
      }
      HTTP.getSearchResults({
        keyword: keyword,
        tagIds: tagIdsArray,
        udpFilters: udpFilters,
        modelTypes: this.modelTypes,
        path: query.hasOwnProperty('categories')
          ? null
          : query.catalogId && query.catalogId !== 'm0'
          ? this.currentCatalogs
          : null,
        categories: categories,
        pageSize: this.pageSize,
        currentPage: this.currentPage - 1,
        sort: this.sortPara,
        typeIds: typeIds,
        successCallback: data => {
          this.tagCntMap = {}
          if (data.aggregations) {
            const a = data.aggregations
            if (a['sterms#tag'] && !a['lterms#tag']) {
              a['lterms#tag'] = a['sterms#tag']
            }
            if (!a['sterms#modelType'] && a['lterms#modelType']) {
              a['sterms#modelType'] = a['lterms#modelType']
            }
          }
          data.aggregations &&
            data.aggregations['lterms#tag'] &&
            data.aggregations['lterms#tag'].buckets.forEach(item => {
              this.tagCntMap[item.key] = item.doc_count
            })
          this.modelCntMap = {}
          data.aggregations &&
            data.aggregations['sterms#modelType'] &&
            data.aggregations['sterms#modelType'].buckets.forEach(item => {
              this.modelCntMap[item.key] = item.doc_count
            })
          const duplicateTables = []
          data.hits.hits.forEach(item => {
            item._source.highlight = item.highlight
            if (item._source.filePath) {
              const source = item._source
              source.code = source.filePath
              source.objectId = source.id
              source.fileType = source.fileType
              source.type = 'shareFile'
            }
            duplicateTables.push(item._source)
          })
          if (typeof data.hits.total === 'number') {
            this.totalItems = data.hits.total
          } else if (
            typeof data.hits.total === 'object' &&
            data.hits.total.hasOwnProperty('value')
          ) {
            this.totalItems = data.hits.total.value
          }
          this.$refs.contentList.scrollTop = 0
          this.tables = duplicateTables
          this.listKey++
          this.handleResize()
          if (!this.lastNoTagSearch.blur) {
            this.lastNoTagSearch.catalogs = this.currentCatalogs
            this.lastNoTagSearch.keyword = this.keyword
            this.lastNoTagSearch.blur = true
          }
          this.lastCatalogs = this.currentCatalogs
        },
        failureCallback: e => {
          this.tagCntMap = {}
          this.tables = []
          this.$showFailure(e)
        },
        finallyCallback: () => {
          this.contentLoading = false
        },
      })
    },
    handleNodeClick(data) {
      const query = _.clone(this.$route.query)
      if (String(data.id).includes('c-')) {
        this.currentCatalogId = null
        query.categories = data.id.slice(2)
        delete query.catalogId
        this.$router.push({ query: query })
      } else if (String(data.id).includes('cs-')) {
        this.currentCatalogId = null
        query.categories = data.id.slice(3)
        delete query.catalogId
        this.$router.push({ query: query })
      } else if (String(data.id).includes('no')) {
      } else {
        this.handleCatalogIdChange(data.id)
      }
    },
    handleCatalogIdChange(val) {
      const query = _.clone(this.$route.query)
      this.currentCatalogId = val
      query.catalogId = val
      delete query.categories
      this.$router.push({ query: query })
    },
    handleNewsClose() {},
    handleTableClose() {},
    handleModelChange() {
      this.currentPage = 1
      this.getSearchResults()
    },
    handleDataTypeChange() {
      this.currentPage = 1
      this.getSearchResults()
    },
    removeTag(i, array) {
      array.splice(i, 1)
      this.$set(array, -1, 'update')
      this.handleTagChange()
    },
    handleTagCheckboxChange(tag) {
      this.getSearchResults(tag.tagId)
    },
    handleTagChange(selection) {
      const tagIds = []
      for (const index in this.tags) {
        const t = this.tags[index]
        t.selection.forEach(item => {
          tagIds.push(item.tagId)
        })
      }
      this.tagIds = tagIds
      this.currentPage = 1
      this.getSearchResults()
      this.computeNavHeight()
      this.calculateFilterHeight()
      if (selection && selection.length === 0) {
        $('#calculate-width').click()
      }
    },
    expandTags() {},
    computeNavHeight() {
      return
      const height = Number.parseFloat($('#calculate-width').css('height'))
      const list = $('.content-list')
      const sort = $('.content-sort')
      const nav = $('.content-nav')
      let navHeight = 50
      if (height > 30 && height < 60) {
        navHeight = 90
      } else if (height < 30) {
        navHeight = 50
      } else if (height > 60) {
        navHeight = 130
      } else if (height > 90) {
        navHeight = 170
      }
      nav.css('height', navHeight)
      list.css('top', navHeight + 50)
      sort.css('top', navHeight)
    },
    // table 数组去重
    // @Deprecated
    removeDupTable(dataArr) {
      const arr2 = []
      const map = {}
      dataArr.forEach(item => {
        if (!map[item.id]) {
          arr2.push(item)
          map[item.id] = item
        }
      })
      return arr2
    },
    back2Index() {
      this.$router.push({
        name: 'home',
      })
    },
    skip2Required() {
      this.$skip2({
        name: 'dataDemand',
        query: {
          currentTab: 'add',
          keyword: this.keyword,
        },
      })
    },
    nodeClick(data) {
      let node
      if (this.$refs.listTree) {
        node =
          this.$refs.listTree && this.$refs.listTree.$refs.tree
            ? this.$refs.listTree.$refs.tree.getNode(data.id)
            : null
      }
      if (node && node.data) {
        this.$refs.listTree.handleNodeClick(node.data, node)
        this.$refs.listTree.$refs.tree.setCurrentKey(node.data.id)
      }
    },
    handleUpdatePath(path) {
      let str = '全部结果'
      if (this.lastKeyword) {
        str = `${this.lastKeyword} 的搜索结果`
      }
      this.displayPath = [str, ...path]
      let len = this.displayPath.length - 1
      this.displayPath = this.displayPath.map((item, index) => {
        if (index === len) {
          item.couldClick = false
          return item
        }
        if (index === 0) {
          let obj = {}
          obj.name = item
          obj.couldClick = false
        }
        return item
      })
    },
    async pushUdpToFilterPopoverTableData(filterPopoverTableData) {
      this.udps.forEach(item => {
        filterPopoverTableData.push({
          isUdp: true,
          groupName: item.typeId,
          id: item.id,
          tagName: item.name,
        })
      })
      this.filterPopoverTableData = filterPopoverTableData
      await this.getFromDatabase('tag-ddc-visible')
        .then(collection => {
          try {
            const collectionArray = JSON.parse(collection)
            filterPopoverTableData.forEach(item => {
              if (!item.isUdp) {
                this.$set(
                  this.tagCollection,
                  item.tagId,
                  collectionArray.includes(String(item.tagId))
                )
              }
            })
          } catch (e) {}
        })
        .catch(() => {
          filterPopoverTableData.forEach(item => {
            if (!item.isUdp) {
              this.$set(this.tagCollection, item.tagId, false)
            }
          })
        })
        .then(() => {
          if (this.isAdmin || (!this.isAdmin && this.tagCollection)) {
            this.notAnyTag = !Object.values(this.tagCollection).some(i => i)
          }
        })
      const udpSet = []
      this.getFromDatabase('udp-ddc-visible')
        .then(collection => {
          try {
            const collectionArray = JSON.parse(collection)
            filterPopoverTableData.forEach(item => {
              if (item.isUdp) {
                this.$set(
                  this.udpCollection,
                  item.id,
                  collectionArray.includes(String(item.id))
                )
                if (!this.isAdmin) {
                  if (collectionArray.includes(String(item.id))) {
                    udpSet.push(this.udpsMap[item.id])
                  }
                } else {
                  udpSet.push(this.udpsMap[item.id])
                }
              }
            })
            this.getUdpValuesBatch(udpSet)
          } catch (e) {}
        })
        .catch(() => {
          filterPopoverTableData.forEach(item => {
            if (item.isUdp) {
              this.$set(this.udpCollection, item.id, false)
              udpSet.push(this.udpsMap[item.id])
            }
          })
          this.getUdpValuesBatch(udpSet)
        })
        .then(() => {
          if (this.isAdmin || (!this.isAdmin && udpSet.length > 0)) {
            this.notAnyTag = false
          }
        })
    },
    getUdps(filterPopoverTableData) {
      const sortByOrder = arr => {
        arr.sort((a, b) => a.order - b.order)
      }
      this.$http
        .get(this.$url + `/service/entities/udps/${LDMTypes.Entity}`)
        .then(res => {
          this.$http
            .get(this.$url + `/service/entities/udps/${LDMTypes.View}`)
            .then(res1 => {
              this.$http
                .get(this.$url + `/service/entities/udps/${LDMTypes.Report}`)
                .then(res2 => {
                  sortByOrder(res.data)
                  sortByOrder(res1.data)
                  sortByOrder(res2.data)
                  this.udps = res.data.concat(res1.data).concat(res2.data)
                  this.udps.forEach(u => {
                    this.udpValue[u.id] = []
                    this.udpsMap[u.id] = u
                  })
                  this.pushUdpToFilterPopoverTableData(filterPopoverTableData)
                  this.calculateFilterHeight()
                })
            })
        })
        .catch(() => {
          this.filterPopoverTableData = filterPopoverTableData
        })
    },
    getUdpValues(udp) {
      const udpId = udp.id
      if (!udp.selection) {
        this.$http
          .get(this.$url + `/service/entities/udps/${udpId}/values`)
          .then(res => {
            this.$set(udp, 'selection', res.data)
          })
          .catch(e => {
            this.$showFailure(e)
          })
      }
    },
    getUdpValuesBatch(udps) {
      const valueNotLoadedUdps = udps.filter(item => {
        return !item.selection
      })
      this.$http
        .post(
          this.$url + '/service/entities/udps/udpIds/values',
          valueNotLoadedUdps.map(u => u.id)
        )
        .then(res => {
          for (const k in res.data) {
            const udp = this.udpsMap[k]
            if (
              res.data[k] &&
              res.data[k].length > 0 &&
              !res.data[k].every(i => !i)
            ) {
              this.$set(udp, 'selection', res.data[k])
            } else {
              this.udpNoValueSet.add(k)
            }
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    handleUdpValueChange(u) {
      if (u && u.length === 0) {
        $('#calculate-width').click()
      }
      this.tableKey++
      this.calculateFilterHeight()
      this.getSearchResults()
    },
    cancelTagFilter(tag) {
      tag.selection = []
      this.handleTagChange(tag.selection)
      $('#calculate-width').click()
      this.calculateFilterHeight()
      this.getSearchResults()
    },
    cancelUdpFilter(udpId) {
      this.udpValue[udpId] = []
      $('#calculate-width').click()
      this.calculateFilterHeight()
      this.getSearchResults()
    },
    saveToDatabase(widgetId, json) {
      this.$http
        .post(this.$url + '/service/dashboard/widgets', {
          widgetId: widgetId,
          content: JSON.stringify(json),
        })
        .then(() => {})
        .catch(e => {
          this.showFailure(e)
        })
    },
    getFromDatabase(widgetId) {
      return new Promise((resolve, reject) => {
        this.$http
          .post(this.$url + `/widget/getWidgetConfig?id=${widgetId}`)
          .then(res => {
            resolve(res.data.content)
          })
          .catch(e => {
            reject()
          })
      })
    },
    handleCollectionChange(isUdp) {
      if (isUdp) {
        this.saveToDatabase(
          'udp-ddc-visible',
          Object.keys(this.udpCollection).filter(i => this.udpCollection[i])
        )
      } else {
        this.saveToDatabase(
          'tag-ddc-visible',
          Object.keys(this.tagCollection).filter(i => this.tagCollection[i])
        )
      }
    },
  },
  computed: {
    titleBtnShow() {
      return (
        this.$auth.MAIN_CATALOG_MANAGE_ADD &&
        this.$auth.MAIN_CATALOG_MANAGE_MODIFY &&
        this.$auth.MAIN_CATALOG_MANAGE_DELETE
      )
    },
    tagsDisplay() {
      return []
    },
    moreTags() {
      const result = []
      const keys = Object.keys(this.tags)
      keys.sort((a, b) => {
        return (
          this.$globalData.tagMap.get(parseInt(a)).order -
          this.$globalData.tagMap.get(parseInt(b)).order
        )
      })
      keys.forEach(item => {
        result.push(this.tags[item])
      })
      let selectedTagMoudle = result.filter(item => {
        return item.selection.length > 0
      })
      this.selectedTagMoudleLen = selectedTagMoudle.length
      return result
    },
    filterPopoverTableDataDisplay() {
      if (this.isAdmin) {
        return this.filterPopoverTableData
      } else {
        return this.filterPopoverTableData.filter(i => {
          if (i.isUdp) {
            return this.udpCollection[i.id]
          } else {
            return this.tagCollection[i.tagId]
          }
        })
      }
    },
    filterPopoverTableDataGroupName() {
      const all = this.filterPopoverTableDataDisplay
      console.log(all)
      const groupNames = new Set()
      all.forEach(item => {
        groupNames.add(item.groupName)
      })
      console.log(groupNames)
      console.log(Array.from(groupNames))
      return Array.from(groupNames)
    },
    showTagFilter() {
      return (
        !this.notAnyTag &&
        !this.filterPopoverVisible &&
        this.filterPopoverTableData.length > 0
      )
    },
  },
}
