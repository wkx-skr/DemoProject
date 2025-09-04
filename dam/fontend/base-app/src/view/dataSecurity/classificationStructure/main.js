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
import { AssetsTypeEnum } from '../../dataAsset/utils/Enum'
export default {
  components: { completenessDialog, extendedProperties },
  data() {
    return {
      loading: false,
      detailVos: {},
      imgObj: {
        0: level1,
        1: level2,
        2: level3,
        3: level4,
        4: level5,
      },
      typeAry: {
        CATALOG: '目录',
        DOMAIN: '标准',
      },
      url: window.setting.restApiPathName + '/service/ddc/config/icon/',
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
      options: [
        { label: '目录', value: assetsTypeEnum.CATALOG },
        { label: '数据项', value: assetsTypeEnum.DATA_OBJECT },
        { label: '数据表', value: assetsTypeEnum.DATA_COLLECTION },
        { label: '视图', value: assetsTypeEnum.VIEW },
      ],
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
      scope: [],
      degree: [],
      detailDtos: [],
      enableSync: true,
    }
  },
  created() {},
  mounted() {
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
      let index =
        ary && ary[ary.length - 1].assetsTypes.indexOf(assetsTypeEnum.CATALOG)
      ary && index != -1 && ary[ary.length - 1].assetsTypes.splice(index, 1)
      return ary
    },
    // 获取资产目录
    async getCatalog() {
      try {
        const res = await HTTP.getStructureDdc()
        this.assetCatalogList = res.data
      } catch (error) {
        this.$blauShowFailure(error)
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
      HTTP.getLevelData()
        .then(res => {
          res.data.data.forEach(item => {
            let key = obj[item.classificationType]
            this[key].push(item.tag)
          })
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    structureChange(val) {
      let obj = this.assetCatalogList.find(item => item.id == val)
      if (obj.detailDtos.length !== this.level) {
        this.level = obj.detailDtos.length
        this.radioChang(this.level)
      }
      this.detailDtos = obj.detailDtos
      this.synchronization()
    },
    synchronization() {
      this.detailVosList.forEach((item, index) => {
        let type = this.detailDtos[index].assetsTypes
        item.assetsTypes = []
        if (type.indexOf(AssetsTypeEnum.CATALOG) != -1) {
          item.assetsTypes.indexOf('assetsTypeEnum.CATALOG') == -1 &&
            item.assetsTypes.push(assetsTypeEnum.CATALOG)
        }
        if (
          type.indexOf(AssetsTypeEnum.DATA_COLLECTION) != -1 ||
          type.indexOf(AssetsTypeEnum.VIEW) != -1 ||
          type.indexOf(AssetsTypeEnum.TABLE) != -1
        ) {
          item.assetsTypes.indexOf(assetsTypeEnum.DATA_COLLECTION) == -1 &&
            item.assetsTypes.push(assetsTypeEnum.DATA_COLLECTION)
        }
        if (type.indexOf(AssetsTypeEnum.DATA_OBJECT) != -1) {
          item.assetsTypes.indexOf(assetsTypeEnum.DATA_OBJECT) == -1 &&
            item.assetsTypes.push(assetsTypeEnum.DATA_OBJECT)
        }
        if (
          type.indexOf(AssetsTypeEnum.DATA_SERVICE) != -1 ||
          type.indexOf(AssetsTypeEnum.INDEX) != -1 ||
          type.indexOf(AssetsTypeEnum.FILE) != -1 ||
          type.indexOf(AssetsTypeEnum.REPORT) != -1 ||
          type.indexOf(AssetsTypeEnum.DATA_STANDARD) != -1 ||
          type.indexOf(AssetsTypeEnum.DATA_STANDARD_CODE) != -1
        ) {
          item.assetsTypes.indexOf(assetsTypeEnum.DATA_COLLECTION) == -1 &&
            item.assetsTypes.push(assetsTypeEnum.DATA_COLLECTION)
          item.assetsTypes.indexOf(assetsTypeEnum.DATA_OBJECT) == -1 &&
            item.assetsTypes.push(assetsTypeEnum.DATA_OBJECT)
          item.assetsTypes.indexOf(assetsTypeEnum.VIEW) == -1 &&
            item.assetsTypes.push(assetsTypeEnum.VIEW)
        }
      })
    },
    changeRadio() {
      this.catalog.sersync = !this.catalog.sersync
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
      this.$set(this.detailVos.detailVos, index, val)
    },
    assetsTypeFocus(index, obj) {
      let types = this.oldData.find(item => item.id === obj.id) || {
        assetsTypes: [],
      }
      // if (index === this.detailVosList.length - 1) {
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
      // }
    },
    // 获取目录结构
    getStructure() {
      this.loading = true
      HTTP.getStructure()
        .then(async res => {
          const resData = {
            ...res.data,
            detailVos: res.data.detailVos.map(dto => ({
              ...dto,
              assetsTypes: dto.assetsTypes.filter(
                type => type !== 'INFO_OBJECT'
              ),
            })),
          }
          this.detailVos = resData
          if (resData.enableSync) {
            await this.getCatalog()
          }
          this.oldLevel = resData.detailVos.length
          this.level = resData.detailVos.length
          this.oldData = resData.detailVos
          this.catalog = _.cloneDeep(resData.configDto) || {}
          this.$set(this.catalog, 'sersync', resData.configDto.sersync)
          // 数据分类目录挂载了信息项或者数据，就不可以同步了
          this.enableSync = resData.enableSync
          this.loading = false
        })
        .catch(e => {
          this.loading = false
          this.$showFailure(e)
        })
    },
    propertyNew(val) {
      switch (val) {
        case 1:
          return '一级目录'
        case 2:
          return '二级目录'
        case 3:
          return '三级目录'
        case 4:
          return '四级目录'
        case 5:
          return '五级目录'
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
        this.$message.error(this.$t('assets.generalSettings.under'))
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
              message: this.$t('assets.generalSettings.modified'),
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
      if (duplicate) {
        this.$datablauMessage({
          message: '资产目录有重名',
          type: 'warning',
        })
        this.nodeDealWith(nodel)
        return
      }
      if (!flag) {
        this.$datablauMessage({
          message: '请填写资产目录、类型后再提交',
          type: 'warning',
        })
        this.nodeDealWith(nodel)
        return
      }
      if (ary.length != 0) {
        this.$datablauMessage({
          message: `${ary.join(',')}需支持“目录”资产类型，请添加后再提交`,
          type: 'warning',
        })
        this.nodeDealWith(nodel)
        return
      }
      console.log(this.catalog)
      HTTP.saveStructure({
        id: this.detailVos.id,
        detailDtos: [...nodel, ...delAry],
        config: this.catalog,
      })
        .then(res => {
          this.$blauShowSuccess('保存成功', 'warning')
          this.getStructure()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    nodeDealWith(nodel) {
      nodel.forEach((item, index) => {
        item.assetsTypes =
          typeof item.assetsTypes === 'string' && item.assetsTypes
            ? item.assetsTypes.split(',')
            : []
      })
    },
    // 选择层级值改变
    radioChang(val) {
      let num = Math.abs(this.detailVosList.length - val)
      let delList = []
      console.log(num, val, this.detailVosList)
      if (val < this.detailVosList.length) {
        for (let i = 0; i < num; i++) {
          let pop = this.detailVosList.pop()
          pop && (pop.delete = true)
          !pop.id && this.getVosList()
          pop.id && delList.push(pop)
        }
        delList.length &&
          this.$set(
            this.detailVos.detailVos,
            this.detailVos.detailVos.length,
            ...delList
          )
      } else {
        let len = val - this.detailVosList.length // 1
        for (let i = 0; i < len; i++) {
          this.detailVos.detailVos.push({
            assetsTypes: [],
            name: '',
            level: this.detailVosList.length + 1,
          })
        }
        this.detailVosList.at(val - 2).name &&
          this.detailVosList
            .at(val - 2)
            .assetsTypes.push(assetsTypeEnum.CATALOG)
      }
    },
  },
}
