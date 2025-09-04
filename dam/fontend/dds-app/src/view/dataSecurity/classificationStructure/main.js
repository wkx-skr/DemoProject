import level1 from '../../../../static/images/dataAssets/level1.png'
import level2 from '../../../../static/images/dataAssets/leve2.png'
import level3 from '../../../../static/images/dataAssets/leve3.png'
import level4 from '../../../../static/images/dataAssets/leve4.png'
import level5 from '../../../../static/images/dataAssets/leve5.png'
import level0 from '../../../../static/images/dataAssets/leve0.png'
import completenessDialog from '../components/completenessDialog'
import extendedProperties from '../components/extendedProperties'
import HTTP from '../util/api'
import { assetsTypeEnum, AttrsTypeEnum } from '../util/attrEnum'
export default {
  components: { completenessDialog, extendedProperties },
  data() {
    return {
      listShow: true,
      loading: false,
      detailVos: {},
      imgObj: {
        0: level1,
        1: level2,
        2: level3,
        3: level4,
        4: level5,
      },
      typeAry: {},
      url:
        window.setting.iconApiPathName +
        '/datasecurity/datasecurity/structure/icon/',
      uploadFlag: false,
      fileList: [],
      recoverImg: '',
      recoverImgURl: '',
      imageUrl: '',
      accept: 'image/png,image/jpg,image/jpeg',
      catalogType: {},
      dialogVisible: false,
      extendVisible: false,
      iconItem: {},
      options: [],
      type: assetsTypeEnum,
      level: 5,
      oldLevel: 5,
      oldData: [],
      // 同步
      catalog: { sersync: false },
      assetCatalogList: [], // 资产目录
      levelList: [],
      importance: [],
      objectList: [],
      sensitive: [],
      scope: [],
      degree: [],
      detailDtos: [],
      enableSync: true,
      manageDisabled: false,
      structureDeleted: false,
    }
  },
  created() {},
  mounted() {
    this.typeAry = {
      CATALOG: this.$t('securityModule.catalog'),
      DOMAIN: this.$t('securityModule.standard'),
    }
    this.options = [
      {
        label: this.$t('securityModule.catalog'),
        value: assetsTypeEnum.CATALOG,
      },
      {
        label: this.$t('securityModule.dataItem'),
        value: assetsTypeEnum.DATA_OBJECT,
      },
      {
        label: this.$t('securityModule.table'),
        value: assetsTypeEnum.TABLE,
      },
      { label: this.$t('securityModule.shitu'), value: assetsTypeEnum.VIEW },
    ]
    // 同步资产目录,获取资产目录
    // this.getCatalog()
    this.getStructure()
    // 获取,等级,范围,程度等数据
    this.getInfluences()
  },
  computed: {
    detailVosList() {
      return this.getVosList()
    },
  },
  methods: {
    getVosList() {
      let ary =
        this.detailVos.detailVos &&
        this.detailVos.detailVos.filter(item => item && !item.delete)
      // if (ary && ary.length) {
      //   let index =
      //     ary && ary[ary.length - 1].assetsTypes.indexOf(assetsTypeEnum.CATALOG)
      //   ary && index != -1 && ary[ary.length - 1].assetsTypes.splice(index, 1)
      // }
      return ary
    },
    // 获取资产目录
    async getCatalog() {
      try {
        const res = await HTTP.getStructureDdc()
        this.assetCatalogList = res.data
      } catch (error) {
        this.$showFailure(error)
      }
    },
    // 获取5大影响下拉值
    getInfluences() {
      let obj = {}
      obj[AttrsTypeEnum.LEVEL] = 'levelList'
      obj[AttrsTypeEnum.IMPORTANCE] = 'importance'
      obj[AttrsTypeEnum.OBJECT] = 'objectList'
      obj[AttrsTypeEnum.SCOPE] = 'scope'
      obj[AttrsTypeEnum.DEGREE] = 'degree'
      obj[AttrsTypeEnum.SENSITIVE] = 'sensitive'
      HTTP.getLevelData()
        .then(res => {
          res.data.data.forEach(item => {
            let key = obj[item.classificationType]
            this[key] && this[key].push(item.tag)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    structureChange(val) {
      if (val) {
        let obj = this.assetCatalogList.find(item => item.id == val)
        if (obj.detailDtos.length !== this.level) {
          this.level = obj.detailDtos.length
          this.radioChang(this.level, obj)
        }
        this.detailDtos = obj.detailDtos
        this.structureDeleted = false
        this.synchronization()
      }
    },
    synchronization() {
      this.detailVosList.forEach((item, index) => {
        const levelInfo = this.detailDtos[index]
        let type = levelInfo.assetsTypes
        // item.catalogTypeId = undefined
        item.name = levelInfo.catalogTypeName
        item.assetsTypes = []
        if (type.indexOf(assetsTypeEnum.CATALOG) != -1) {
          item.assetsTypes.indexOf('assetsTypeEnum.CATALOG') == -1 &&
            item.assetsTypes.push(assetsTypeEnum.CATALOG)
        }
        if (type.indexOf(assetsTypeEnum.DATA_COLLECTION) != -1) {
          item.assetsTypes.indexOf(assetsTypeEnum.TABLE) == -1 &&
            item.assetsTypes.push(assetsTypeEnum.TABLE)
          item.assetsTypes.indexOf(assetsTypeEnum.VIEW) == -1 &&
            item.assetsTypes.push(assetsTypeEnum.VIEW)
        }
        if (type.indexOf(assetsTypeEnum.VIEW) != -1) {
          item.assetsTypes.indexOf(assetsTypeEnum.VIEW) == -1 &&
            item.assetsTypes.push(assetsTypeEnum.VIEW)
        }
        if (type.indexOf(assetsTypeEnum.TABLE) != -1) {
          item.assetsTypes.indexOf(assetsTypeEnum.TABLE) == -1 &&
            item.assetsTypes.push(assetsTypeEnum.TABLE)
        }
        if (type.indexOf(assetsTypeEnum.DATA_OBJECT) != -1) {
          item.assetsTypes.indexOf(assetsTypeEnum.DATA_OBJECT) == -1 &&
            item.assetsTypes.push(assetsTypeEnum.DATA_OBJECT)
        }
        if (
          type.indexOf(assetsTypeEnum.DATA_SERVICE) != -1 ||
          type.indexOf(assetsTypeEnum.INDEX) != -1 ||
          type.indexOf(assetsTypeEnum.FILE) != -1 ||
          type.indexOf(assetsTypeEnum.REPORT) != -1 ||
          type.indexOf(assetsTypeEnum.DATA_STANDARD) != -1 ||
          type.indexOf(assetsTypeEnum.DATA_STANDARD_CODE) != -1
        ) {
          item.assetsTypes.indexOf(assetsTypeEnum.TABLE) == -1 &&
            item.assetsTypes.push(assetsTypeEnum.TABLE)
          item.assetsTypes.indexOf(assetsTypeEnum.DATA_OBJECT) == -1 &&
            item.assetsTypes.push(assetsTypeEnum.DATA_OBJECT)
          item.assetsTypes.indexOf(assetsTypeEnum.VIEW) == -1 &&
            item.assetsTypes.push(assetsTypeEnum.VIEW)
        }
      })
    },
    changeRadio() {
      this.catalog.sersync = !this.catalog.sersync
      this.manageDisabled = this.catalog.sersync || this.catalog.openSync
      this.structureChange(this.catalog.structureId)
    },
    handleOpenSyncChange() {
      this.manageDisabled = this.catalog.sersync || this.catalog.openSync
      this.structureChange(this.catalog.structureId)
    },
    nameFocus(val, index) {
      val.class = null
      let flag = this.detailVos.detailVos
        .filter(item => {
          return item && !item.delete
        })
        .some((item, i) => {
          item.mes = null
          if (i !== index) {
            return item.name && item.name === val.name
          }
        })
      flag && (val.class = 'duplicate')
      this.$set(this.detailVos.detailVos[index], 'class', val.class)
    },
    assetsTypeFocus(index, obj) {
      let types = this.oldData.find(item => item.id === obj.id) || {
        assetsTypes: [],
      }
      this.options.forEach((item, i) => {
        if (
          (types.assetsTypes.indexOf(item.value) !== -1 &&
            this.detailVos.inUse &&
            obj.id) ||
          (item.value === 'CATALOG' && index === this.detailVosList.length - 1)
        ) {
          item.disabled = true
        } else {
          item.disabled = false
        }
        this.$set(this.options, i, item)
      })
    },
    // 获取目录结构
    getStructure() {
      this.loading = true
      HTTP.getStructure()
        .then(async res => {
          this.listShow = true
          const resData = {
            ...res.data,
            detailVos: res.data.detailVos.map(dto => ({
              ...dto,
              class: null,
              assetsTypes: dto.assetsTypes.filter(
                type => type !== 'INFO_OBJECT'
              ),
            })),
          }
          this.detailVos = resData
          await this.getCatalog()
          this.oldLevel = resData.detailVos.length || 0
          this.level = resData.detailVos.length
          this.oldData = _.cloneDeep(resData.detailVos)
          this.catalog = _.cloneDeep(resData.configDto) || {}
          if (resData.configDto?.sersync) {
            this.$set(this.catalog, 'sersync', resData.configDto.sersync)
          }
          // 数据分类目录挂载了信息项或者数据，就不可以同步了
          this.enableSync = resData.enableSync
          this.manageDisabled =
            resData.configDto?.sersync || resData.configDto?.openSync
          if (
            resData.configDto?.structureId &&
            !this.assetCatalogList.find(
              item => item.id === resData.configDto.structureId
            )
          ) {
            this.catalog.structureId = ''
            resData.configDto.structureId = ''
            this.structureDeleted = true
          }
          this.loading = false
        })
        .catch(e => {
          this.listShow = false
          this.loading = false
          this.$showFailure(e)
        })
    },
    propertyNew(val) {
      switch (val) {
        case 1:
          return this.$t('design.oneCatalog')
        case 2:
          return this.$t('design.twoCatalog')
        case 3:
          return this.$t('design.threeCatalog')
        case 4:
          return this.$t('design.fourCatalog')
        case 5:
          return this.$t('design.fiveCatalog')
      }
    },
    // 完成度
    completion(item) {
      this.dialogVisible = true
      this.catalogType = item
    },
    // 扩展属性
    properties(item) {
      this.extendVisible = true
      this.catalogType = item
    },
    primary(json) {
      // 弹窗消失
      json.catalogType.udpVo = json.udpVo
      // this.$set(this.areas, obj.index, obj.catalogType)
      this.close()
    },
    close() {
      this.dialogVisible = false
      this.extendVisible = false
    },
    upload(item, index) {
      if (this.manageDisabled) return
      this.uploadFlag = true
      // this.recoverImg = this.imgObj[index]
      this.recoverImg = index + 1 // 获取默认图片的名字
      this.recoverImgURl = this.imgObj[index]
      this.imageUrl = item.icon ? this.url + item.icon : this.imgObj[index]
      this.fileList = [{ name: 1, url: this.imageUrl }]
      // item.icon = this.recoverImg
      this.iconItem = item
    },
    handleClose() {
      this.uploadFlag = false
    },
    restoreIcon() {
      HTTP.getDefault(this.recoverImg)
        .then(res => {
          this.fileList = [
            {
              name: 1,
              url: this.recoverImgURl,
              imageName: res.data.data,
            },
          ]
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    upchange(file, fileList) {
      this.fileList = []
      if (file.size / 1024 > 60) {
        this.$message.error(this.$t('design.under'))
        this.disabled = true
      } else {
        this.disabled = false
      }
      this.picture = true
      this.fileList = [file]
    },
    uploadSectionFile() {
      if (this.fileList.length == 0) {
        this.uploadFlag = false
        return
      }
      let form = new FormData() // 文件对象
      for (let item of this.fileList) {
        if (item.imageName) {
          // 恢复图片：使用默认图片
          this.reviseImg(item.imageName)
        }
        this.fileList[0].raw && form.append('icon', item.raw)
      }
      if (form.has('icon')) {
        HTTP.upload(form)
          .then(res => {
            let id = res.data.data.id
            this.reviseImg(id)
          })
          .catch(e => {
            this.$showFailure(e)
            this.uploadFlag = false
          })
      }
      this.uploadFlag = false
    },
    reviseImg(id) {
      if (this.iconItem.catalogTypeId) {
        HTTP.reviseImage({ id: this.iconItem.catalogTypeId, iconId: id })
          .then(res => {
            this.$set(this.iconItem, 'icon', id)
            this.$datablauMessage({
              message: this.$t('design.modified'),
              type: 'warning',
            })
            this.uploadFlag = false
          })
          .catch(e => {
            this.$showFailure(e)
            this.uploadFlag = false
          })
      } else {
        this.$set(this.iconItem, 'icon', id)
        this.uploadFlag = false
      }
    },
    // 判断是否有重名的
    hasDuplicate(array, name) {
      const seen = new Set()
      for (let i = 0; i < array.length; i++) {
        let objString
        if (array[i][name]) {
          objString = JSON.stringify(array[i][name])
          if (seen.has(objString)) {
            return true
          }
          seen.add(objString)
        }
      }
      return false
    },
    // 保存结构
    saveStructure() {
      let flag = true
      let ary = []
      this.detailVos.detailVos = this.detailVos.detailVos.filter(item => item)
      this.detailVos.detailVos.forEach((item, index) => {
        !item.udpVo && (item.udpVo = [])
        !item.algorithmVo && (item.algorithmVo = null)
        item.assetsTypes =
          typeof item.assetsTypes === 'string'
            ? item.assetsTypes
            : item.assetsTypes.join(',')
        // 如果用户选择了‘数据项’，默认可添加‘信息项’
        if (item.assetsTypes.indexOf('DATA_OBJECT') !== -1) {
          item.assetsTypes = item.assetsTypes + ',INFO_OBJECT'
        }
        item.udps = item.udpVo
        item.detailId = item.id
        item.algorithms = []
      })

      let nodel = this.detailVos.detailVos.filter(item => item && !item.delete)
      let delAry = this.detailVos.detailVos.filter(
        item => item && item.delete && item.id
      )
      delAry = [...new Set(delAry.map(e => JSON.stringify(e)))].map(e =>
        JSON.parse(e)
      )
      let duplicate = false
      nodel.forEach((item, index) => {
        !item.name && (flag = false)
        !item.assetsTypes && (flag = false)
        item.class && (duplicate = true)
        if (
          index != nodel.length - 1 &&
          item.assetsTypes.indexOf('CATALOG') == -1
        ) {
          ary.push(item.name)
        }
      })
      if (this.hasDuplicate(this.detailVos.detailVos, 'name')) {
        this.$datablauMessage({
          message: this.$t('design.reNameTip'),
          type: 'warning',
        })
        this.nodeDealWith(nodel)
        return
      } else {
        this.detailVos.detailVos.map(item => (item.class = null))
      }
      if (!flag) {
        this.$datablauMessage({
          message: this.$t('design.submitTip'),
          type: 'warning',
        })
        this.nodeDealWith(nodel)
        return
      }
      if (ary.length != 0) {
        this.$datablauMessage({
          message: `${ary.join(',')}${this.$t('design.submitTip1')}`,
          type: 'warning',
        })
        this.nodeDealWith(nodel)
        return
      }
      if (
        (this.catalog.sersync || this.catalog.openSync) &&
        !this.catalog.structureId
      ) {
        this.$datablauMessage({
          message: this.$t('design.selectTip'),
          type: 'warning',
        })
        this.nodeDealWith(nodel)
        return
      }
      let structureName = ''
      this.assetCatalogList.map(m => {
        if (m.id === this.catalog.structureId) {
          structureName = m.name
        }
      })
      this.catalog.structureName = structureName
      this.loading = true
      HTTP.saveStructure({
        id: this.detailVos.id,
        detailDtos: [...nodel, ...delAry],
        config: this.catalog,
      })
        .then(res => {
          this.loading = false
          this.$datablauMessage.success(this.$t('securityModule.editSuccess'))
          this.getStructure()
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    nodeDealWith(nodel) {
      nodel.forEach((item, index) => {
        if (item.assetsTypes) {
          if (typeof item.assetsTypes === 'string') {
            item.assetsTypes = item.assetsTypes.split(',')
          }
          const targetIndex = item.assetsTypes.indexOf('INFO_OBJECT')
          if (targetIndex !== -1) {
            item.assetsTypes.splice(targetIndex, 1)
          }
        }
      })
    },
    // 选择层级值改变
    radioChang(val, obj) {
      let delList = []
      if (obj) {
        this.detailVos.detailVos = obj.detailDtos.map((item, i) => ({
          ...item,
          id: this.oldData[i]?.id,
          structureId: this.oldData[0].structureId,
          catalogTypeId: this.oldData[i]?.catalogTypeId,
        }))
      } else {
        if (val < this.detailVosList.length) {
          this.detailVos.detailVos.splice(val)
        } else {
          let len = val - this.detailVosList.length // 1
          for (let i = 0; i < len; i++) {
            this.detailVos.detailVos.push({
              assetsTypes: [],
              name: '',
              level: this.detailVosList.length + 1,
            })
          }
        }
      }
      // 处理资产类型是否加目录
      const curLen = this.detailVos.detailVos.length
      this.detailVos.detailVos.map((item, index) => {
        if (index === curLen - 1) {
          if (item.assetsTypes.includes(assetsTypeEnum.CATALOG)) {
            const m = item.assetsTypes.findIndex(
              n => n === assetsTypeEnum.CATALOG
            )
            item.assetsTypes.splice(m, 1)
          }
        } else {
          if (!item.assetsTypes.includes(assetsTypeEnum.CATALOG)) {
            item.assetsTypes.push(assetsTypeEnum.CATALOG)
          }
        }
      })
      const len = this.oldData.length
      for (let i = 0; i < len; i++) {
        let pop = this.oldData[i]
        if (!this.detailVos.detailVos.find(item => item.id === pop.id)) {
          pop.delete = true
          delList.push(pop)
        }
      }
      if (delList.length) {
        delList.forEach(item => {
          this.$set(
            this.detailVos.detailVos,
            this.detailVos.detailVos.length,
            item
          )
        })
      }
    },
  },
}
