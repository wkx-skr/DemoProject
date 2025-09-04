<!-- 系统设置 --- 通用设置 -->
<template>
  <div class="general">
    <div class="typeDetail" v-if="!typeDetail">
      <div class="tilTop">
        <div class="title">{{ $t('assets.generalSettings.settings') }}</div>
        <div class="btn-row" @click="save">
          <!--          <datablau-button type="important" class="blue">-->
          <!--            <i class="iconfont icon-tianjia"></i>-->
          <!--            {{ $t('assets.generalSettings.addStar') }}-->
          <!--          </datablau-button>-->
          <datablau-button type="important" class="iconfont icon-tianjia">
            {{ $t('assets.generalSettings.addStar') }}
          </datablau-button>
        </div>
      </div>
      <datablau-form-submit class="table-row" ref="tableOuter">
        <datablau-table
          height="100%"
          class="el-table datablau-table"
          ref="deTable"
          :data="areas"
          tooltip-effect="dark"
          :showColumnSelection="false"
          border
        >
          <el-table-column
            prop="icon"
            :label="$t('assets.generalSettings.icon')"
            show-overflow-tooltip
            width="50px"
          >
            <template slot-scope="scope">
              <div class="iconImg" @click="upload(scope.row, scope.$index)">
                <img :src="url + scope.row.icon" alt="" v-if="scope.row.icon" />
                <img :src="imgList" alt="" v-if="!scope.row.icon" />
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="name"
            :label="$t('assets.generalSettings.dataAsset')"
            show-overflow-tooltip
            width="400px"
          >
            <template scope="{row}">
              {{ row.name }}
            </template>
          </el-table-column>
          <el-table-column
            prop="assetsType"
            :label="$t('assets.generalSettings.dataAssetType')"
            show-overflow-tooltip
          >
            <template scope="{row}">
              {{ assetsJoin(row.assetsType) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="assetsType"
            :label="$t('assets.generalSettings.operate')"
            show-overflow-tooltip
            width="80px"
          >
            <template slot-scope="scope">
              <datablau-button type="icon">
                <datablau-tooltip
                  placement="bottom"
                  effect="dark"
                  popper-class="tooltipBox"
                  :content="$t('assets.directoryStructure.edit')"
                >
                  <i
                    class="iconfont icon-bianji blue"
                    @click="edit(scope.row, scope.$index)"
                  ></i>
                </datablau-tooltip>
              </datablau-button>
              <datablau-button type="icon" v-if="!scope.row.inUse">
                <datablau-tooltip
                  placement="bottom"
                  effect="dark"
                  v-if="!scope.row.inUse"
                  popper-class="tooltipBox"
                  :content="$t('assets.directoryStructure.delete')"
                >
                  <i
                    :class="{
                      iconfont: true,
                      'icon-delete': true,
                      blue: !scope.row.inUse,
                    }"
                    @click="deleteAsset(scope.row)"
                  ></i>
                </datablau-tooltip>
              </datablau-button>
              <datablau-tooltip
                placement="bottom"
                effect="dark"
                popper-class="tooltipBox"
                v-else
                :content="$t('assets.generalSettings.cannotBeDeleted')"
              >
                <i
                  :class="{
                    bianjiIcon: true,
                    iconfont: true,
                    'icon-delete': true,
                    blue: !scope.row.inUse,
                  }"
                ></i>
              </datablau-tooltip>
            </template>
          </el-table-column>
        </datablau-table>
      </datablau-form-submit>
    </div>
    <div v-if="typeDetail">
      <datablau-breadcrumb
        class="breadTil"
        :node-data="nodeData1"
        :separator="'/'"
        @back="returnList('')"
      ></datablau-breadcrumb>

      <catalogTypeDetail
        :typeDetailData="typeDetailData"
        :areas="areas"
        :options="options"
        :old="oldRevise"
        :typeDetail="typeDetail"
        @cancelbtn="returnList"
      ></catalogTypeDetail>
    </div>
    <datablau-dialog
      :visible.sync="uploadFlag"
      :title="$t('assets.generalSettings.upload')"
      width="480px"
      height="320px"
      :before-close="handleCloseDialog"
    >
      <p>
        {{ $t('assets.generalSettings.uploadText') }}
        <span class="blue" @click="restoreIcon">
          {{ $t('assets.generalSettings.restoreIcon') }}
        </span>
      </p>
      <datablau-upload
        :isEdit="true"
        :drag="true"
        :action="`${$url}/service/ddc/config/upload`"
        :limitNum="1"
        :multiple="false"
        :file-list="fileList"
        list-type="picture-card"
        :accept="accept"
        :on-change="upchange"
        :on-remove="delectImage"
        :auto-upload="false"
        :http-request="uploadSectionFile"
      >
        <i class="iconfont icon-upload blu icon"></i>
        <div class="el-upload__text">
          {{ $t('assets.generalSettings.upload') }}
        </div>
      </datablau-upload>
      <p>{{ $t('assets.generalSettings.png') }}</p>
      <p v-if="showError" style="color: red; margin-top: 10px">
        {{ errorMsg }}
      </p>
      <span slot="footer">
        <datablau-button type="secondary" @click="handleCloseDialog">
          {{ $t('assets.permissionSettings.cancel') }}
        </datablau-button>
        <datablau-button
          type="primary"
          @click="uploadSectionFile"
          :disabled="disabled"
        >
          {{ $t('assets.permissionSettings.sure') }}
        </datablau-button>
      </span>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '../utils/api.js'

import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum'
// import level0 from '/static/images/dataAssets/leve0.png'
import catalogTypeDetail from '../components/catalogTypeDetail'
// import level1 from '/static/images/dataAssets/level1.png'
// import level2 from '/static/images/dataAssets/leve2.png'
// import level3 from '/static/images/dataAssets/leve3.png'
// import level4 from '/static/images/dataAssets/leve4.png'
// import level5 from '/static/images/dataAssets/leve5.png'
export default {
  name: 'assetSetting',
  components: {
    catalogTypeDetail,
  },
  data() {
    return {
      imgList: '/static/images/dataAssets/leve0.png',
      accept: 'image/png,image/jpg,image/jpeg',
      imgListAry: {
        0: '/static/images/dataAssets/leve0.png',
        1: '/static/images/dataAssets/level1.png',
        2: '/static/images/dataAssets/leve2.png',
        3: '/static/images/dataAssets/leve3.png',
        4: '/static/images/dataAssets/leve4.png',
        5: '/static/images/dataAssets/leve5.png',
      },
      disabled: false,
      catalogType: {},
      areas: null,
      url: window.setting.restApiPathName + '/service/ddc/config/icon/',
      property: [
        { label: this.$t('assets.generalSettings.dept'), value: 'DEPT' },
        {
          label: this.$t('assets.generalSettings.butler'),
          value: 'DATA_BUTLER',
        },
        {
          label: this.$t('assets.generalSettings.assetList'),
          value: 'ASSETS_LIST',
        },
        {
          label: this.$t('assets.generalSettings.keywords'),
          value: 'KEYWORDS',
        },
        {
          label: this.$t('assets.generalSettings.description'),
          value: 'DESCRIPTION',
        },
        {
          label: this.$t('assets.generalSettings.english'),
          value: 'ENGLISH_ABBREVIATION',
        },
      ],
      propertyCorrespond: {
        DEPT: this.$t('assets.generalSettings.dept'),
        DATA_BUTLER: this.$t('assets.generalSettings.butler'),
        ASSETS_LIST: this.$t('assets.generalSettings.assetList'),
        KEYWORDS: this.$t('assets.generalSettings.keywords'),
        DESCRIPTION: this.$t('assets.generalSettings.description'),
        ENGLISH_ABBREVIATION: this.$t('assets.generalSettings.english'),
      },
      loading: false,
      oldRevise: {},
      options: [
        {
          label: this.$t('assets.generalSettings.none'),
          value: 'CATALOG',
          disabled: false,
        },
        {
          label: this.$t('assets.generalSettings.table'),
          value: AssetsTypeEnum.TABLE,
          disabled: false,
        },
        // {
        //   label: AssetsTypeEnum.DATA_COLLECTION,
        //   value: AssetsTypeEnum.DATA_COLLECTION, // 后端改完后删除
        //   disabled: false,
        // },
        {
          label: this.$t('assets.generalSettings.view'),
          value: AssetsTypeEnum.VIEW,
          disabled: false,
        },
        {
          label: this.$t('assets.generalSettings.object'),
          value: AssetsTypeEnum.DATA_OBJECT,
          disabled: false,
        },

        // {
        //   label: 'DOMAIN',
        //   value: AssetsTypeEnum.DOMAIN,
        //   disabled: false,
        // },
        {
          label: this.$t('assets.generalSettings.basicStandard'),
          value: AssetsTypeEnum.DATA_STANDARD,
          disabled: false,
        },
        {
          label: this.$t('assets.generalSettings.standardCode'),
          value: AssetsTypeEnum.DATA_STANDARD_CODE,
          disabled: false,
        },
        // { label: '本地文档', value: 'DOCUMENT' },
        {
          label: this.$t('assets.generalSettings.index'),
          value: AssetsTypeEnum.INDEX,
          disabled: false,
        },
        {
          label: this.$t('assets.generalSettings.report'),
          value: AssetsTypeEnum.REPORT,
          disabled: false,
        },
        {
          label: this.$t('assets.generalSettings.file'),
          value: AssetsTypeEnum.FILE,
          disabled: false,
        },
        {
          label: this.$t('assets.generalSettings.service'),
          value: AssetsTypeEnum.DATA_SERVICE,
          disabled: false,
        },
      ],
      typeDetail: false, // 类型详情显示
      typeDetailData: {}, // 目录类型详情数据
      imageUrl: '',
      recoverImg: '',
      uploadFlag: false,
      picture: false,
      fileList: [],
      iconItem: {},
      nodeDataName: '',
      showError: false,
      errorMsg: '',
    }
  },
  computed: {
    nodeData1() {
      return {
        name: this.$t('assets.generalSettings.catalogTypeManagement'),
        icon: '',
        children: [
          {
            name: this.$t('assets.generalSettings.catalogTypeManagement'),
            couldClick: false,
            children: [
              {
                name:
                  this.nodeDataName ||
                  this.$t('assets.generalSettings.addStar'),
                couldClick: false,
              },
            ],
          },
        ],
      }
    },
  },
  methods: {
    // setOptions(ary) {
    // },

    handleClose() {
      this.dialogVisible = false
      this.extendVisible = false
    },

    // 查看
    edit(item, index) {
      this.loading = true
      HTTP.getTypeDet(item.id)
        .then(res => {
          let data = res.data
          data.algorithms.udpDtoList &&
            data.algorithms.udpDtoList.forEach(item => {
              item.attribute = item.extendProp
              item.weight = item.weight
            })
          this.typeDetailData = data
          data.assetsType = item.assetsType
          this.typeDetailData.index = index
          this.typeDetailData.all =
            data.assetsType.length === this.options.length
          this.nodeDataName = this.typeDetailData.name
          this.oldRevise = _.cloneDeep(this.typeDetailData)
          this.typeDetail = true
          this.loading = false
        })
        .catch(e => {
          this.$showFailure(e)
          this.loading = false
        })
    },
    // 详情返回按钮
    returnList(val) {
      this.typeDetailData.udps.forEach(item => {
        item.value = null
        delete item.label
      })
      if (
        JSON.stringify(this.typeDetailData) !==
          JSON.stringify(this.oldRevise) &&
        !val
      ) {
        this.$DatablauCofirm(
          this.$t('assets.generalSettings.returnCon'),
          this.$t('assets.generalSettings.hint'),
          {
            confirmButtonText: this.$t('assets.generalSettings.confrim'),
            cancelButtonText: this.$t('assets.generalSettings.Leave'),
            cancelButtonClass: 'cancel',
            confirmButtonClass: 'confirm',
          }
        )
          .then(() => {
            this.typeDetail = false
            this.allMethod()
          })
          .catch(e => {})
        return
      }
      this.typeDetail = false
      this.allMethod()
    },
    // 删除
    deleteAsset(obj) {
      if (obj.inUse) return
      this.$DatablauCofirm(
        this.$t('assets.generalSettings.delAsset', { name: obj.name }),
        this.$t('assets.generalSettings.hint'),
        {
          cancelButtonText: this.$t('assets.generalSettings.cancelButton'),
          confirmButtonText: this.$t('assets.generalSettings.confirmButton'),
        }
      )
        .then(res => {
          HTTP.delAssetType(obj.id)
            .then(res => {
              this.$blauShowSuccess(
                this.$t('assets.generalSettings.deletedSuccessfully')
              )
              this.allMethod()
            })
            .catch(e => {
              this.$showFailure(e)
            })
        })
        .catch(e => {})
    },
    // 新建目录类型
    save() {
      this.typeDetail = true
      this.title = ''
      this.typeDetailData = {
        all: false,
        assetsType: [],
        udps: [],
        algorithms: [],
      }
      this.nodeDataName = this.$t('assets.generalSettings.addStar')
      this.oldRevise = _.cloneDeep(this.typeDetailData)
      // this.$router.push('/main/dataAsset/directoryStructure')
    },
    primary(obj) {
      obj.publishPercent &&
        (obj.catalogType.publishPercent = obj.publishPercent)
      if (obj.algorithms) {
        const algorithms = []
        obj.algorithms.map(item => {
          if (!this.propertyCorrespond[item.attribute]) {
            item.extend = true
          } else {
            item.extend = false
          }
          item.attribute && item.weight && algorithms.push(item)
        })
        obj.catalogType.algorithms = algorithms
      } else if (obj.udps) {
        obj.catalogType.udps = obj.udps
        obj.catalogType.udpDtoList = obj.udps.filter(item => !item.delete)
      }
      this.handleClose()
      // this.levelList(obj.level, obj.index, obj.catalogType)
      this.$set(this.areas, obj.index, obj.catalogType)
    },
    //  获取所有资产目录类型
    getDirectory(res) {
      let data = res.data.catalogTypes
      data.map(item => {
        item.assetsType = item.assetsType.split(',')
        item.class = ''
      })
      this.areas = data
      // 保存页面初始值
    },
    allMethod() {
      // this.$datablauLoading.loading({ color: '#409EFF' })
      this.loading = true
      HTTP.getDirectoryType(0)
        .then(res => {
          this.getDirectory(res)
          // this.$datablauLoading.close()
          this.loading = false
        })
        .catch(e => {
          this.$showFailure(e)
          // this.$datablauLoading.close()
          this.loading = false
        })
    },
    assetsJoin(ary) {
      let newAry = []
      ary.forEach(item => {
        let obj = this.options.filter(k => k.value === item)
        obj.length !== 0 && newAry.push(obj[0].label)
      })
      return newAry.join('，')
    },
    // 图片上传
    upload(item, index) {
      this.imageUrl = item.icon
        ? this.url + item.icon
        : index <= 4
        ? this.imgListAry[index + 1]
        : this.imgListAry[0]
      this.recoverImg = index <= 4 ? index + 1 : 0 // 获取默认图片的名字
      this.recoverImgURl =
        index <= 4 ? this.imgListAry[index + 1] : this.imgListAry[0]
      this.uploadFlag = true
      this.picture = false
      this.fileList = [{ name: index, url: this.imageUrl }]
      this.iconItem = item
    },
    // 图片上传弹窗关闭
    handleCloseDialog() {
      this.showError = false
      this.uploadFlag = false
      this.fileList = []
    },
    restoreIcon() {
      this.disabled = false
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
    delectImage() {
      this.display = 'none'
      this.fileList = [{ name: 1, url: this.imageUrl }]
    },
    upchange(file, fileList) {
      this.showError = false
      this.fileList = []
      console.log(file)
      const fileNameArr = file.name.split('.')
      const fileType = fileNameArr[fileNameArr.length - 1]
      if (!['png', 'jpg'].includes(fileType)) {
        this.showError = true
        this.errorMsg = '文件格式错误'
        // this.$message.error()
        this.disabled = true
        return
      } else {
        this.disabled = false
      }
      if (file.size / 1024 > 60) {
        this.showError = true
        this.errorMsg = this.$t('assets.generalSettings.under')
        // this.$message.error()
        this.disabled = true
        return
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
      this.loading = true
      if (this.iconItem.id) {
        HTTP.reviseImage({ id: this.iconItem.id, iconId: id })
          .then(res => {
            this.$set(this.iconItem, 'icon', id)
            this.$datablauMessage({
              message: this.$t('assets.generalSettings.modified'),
              type: 'warning',
            })
            this.uploadFlag = false
            this.loading = false
          })
          .catch(e => {
            this.$showFailure(e)
            this.loading = false
            this.uploadFlag = false
          })
      } else {
        this.$set(this.iconItem, 'icon', id)
        this.uploadFlag = false
      }
    },
  },
  mounted() {
    this.allMethod()
  },
}
</script>
<style>
.datablau-message-box .el-message-box__btns .el-button.cancel {
  color: #ffffff;
  background-color: #409eff;
  border: 1px solid #409eff;
}
.datablau-message-box .el-message-box__btns .el-button.confirm {
  border: 1px solid #d2d2d2;
  background-color: #ffffff;
  color: #555555;
}
</style>
<style scoped lang="scss">
.general {
  padding-left: 20px;
  padding-right: 20px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  overflow: auto;
  background: #fff;
  /*display: flex;*/
  flex-direction: column;
  .title {
    line-height: 20px;
    padding-top: 10px;
    font-size: 16px;
    padding-bottom: 10px;
    font-weight: 600;
    color: #555;
  }
  .general-box {
    position: absolute;
    top: 40px;
    bottom: 0;
    left: 0;
    right: 0;
  }
}
.marginT20 {
  margin-top: 20px;
}
.marginT10 {
  margin-top: 10px;
}

.subtilBOx {
  padding-left: 6px;
}
.gray {
  color: #999999;
}
.blu {
  color: #409eff;
}
.blue {
  color: #409eff;
  cursor: pointer;
}
.tilTop {
  width: 100%;
  /*display: flex;*/
  /*justify-content: space-between;*/
  /*align-items: center;*/
  /*padding: 0 20px;*/
  /*margin-top: 10px;*/
  /*border-bottom: 1px solid #ddd;*/
  overflow: auto;
  .title {
    float: left;
  }
  .btn-row {
    color: #409eff;
    cursor: pointer;
    float: right;
    margin-top: 5px;
  }
}
/deep/ .el-form-item__content {
  display: flex;
  align-items: center;
  .el-input {
    width: 100%;
    margin-right: 10px;
  }
  i {
    margin-right: 14px;
    font-size: 20px;
  }
  /deep/.el-form-item {
    margin-top: 16px;
  }
}
/deep/.el-table::before {
  height: 0;
}

.iconImg {
  width: 32px;
  height: 32px;
  border: 1px solid rgba(64, 158, 255, 0.2);
  background: #fff;
  border-radius: 15px;
  text-align: center;
  line-height: 32px;
  &:hover {
    border: 1px solid rgba(64, 158, 255, 1);
  }
  img {
    width: 16px;
    height: 16px;
    cursor: pointer;
    position: relative;
    top: -3px;
  }
}
.stitl {
  font-size: 12px;
}
.catalogs {
  position: relative;
  overflow: hidden;
  &:before {
    content: '';
    height: 50%;
    width: 1px;
    border-left: 1px solid #ddd;
    position: absolute;
  }
}
.catalog {
  margin-top: 10px;
  width: 1160px;

  & > div {
    line-height: 40px;
    position: relative;

    i {
      cursor: not-allowed;
    }

    .blu {
      color: #409eff;
      cursor: pointer;
    }
  }

  .flex {
    /*display: flex;*/
    position: relative;

    & > div:nth-child(1) {
      width: 494px;
    }

    & > div:nth-child(2) {
      width: 407px;
      margin-right: 46px;
    }

    & > div:nth-child(3) {
      width: 104px;
    }
    & > div:nth-child(4) {
      margin-right: 7px;
    }
  }

  .til {
    line-height: 40px;
    background: #f5f5f5;
    & > div:nth-child(1) {
      padding-left: 50px;
    }

    & > div:last-child {
      padding-left: 28px;
      padding-right: 25px;
    }
  }
}
.paddingL10 {
  padding-left: 10px;
}
.marginL10 {
  margin-left: 10px;
}
.toXtil {
  color: #777;
  margin-top: 10px;
}
.mulu {
  margin-left: 10px;
  /*display: flex;*/
  align-items: center;
  margin-bottom: 10px;
  /deep/ .datablau-input {
    margin: 0 10px;
    position: relative;
    &:after {
      content: '%';
      position: absolute;
      right: 10px;
      top: 10px;
      line-height: 14px;
      font-size: 12px;
      color: #555;
    }
  }
  i {
    margin-right: 14px;
    cursor: pointer;
  }
}
/deep/.row-content {
  /*left: 20px;*/
  padding-bottom: 50px;
}
.paddingB10 {
  padding-bottom: 10px;
}
/deep/.datablau-input input::-webkit-outer-spin-button,
/deep/.datablau-input input::-webkit-inner-spin-button {
  -webkit-appearance: none !important;
  margin: 0;
}
/deep/.datablau-input input[type='number'] {
  -moz-appearance: textfield !important;
}
.emil {
  margin-left: 20px;
}
.muluSetingBox {
  /*display: flex;*/
  .muluText {
    color: #ff4b53;
    margin-top: 3px;
    margin-left: 15px;
  }
}
/deep/ .borderRed .el-input__inner {
  border-color: #ff4b53;
}
.spaceWhite {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.popperClass .el-scrollbar__wrap {
  padding: 6px 0;
  max-height: 330px !important;
}
.weight {
  font-weight: bold;
}
.bianjiIcon {
  margin-left: 10px;
  color: #999;
}
.table-row {
  margin-top: 38px;
  margin-bottom: 20px;
}
.breadTil {
  padding-bottom: 4px;
  border-bottom: 1px solid #dddddd;
  font-size: 14px;
  color: #555;
  align-items: center;
  margin-top: 10px;
}
/deep/.datablau-upload.datablau-upload-drag .upload-demo .el-upload-dragger {
  width: 100px;
  height: 100px;
  /*display: flex;*/
  padding-top: 30px;
  /*flex-direction: column;*/
  align-items: center;
  /*justify-content: center;*/
}
/deep/.datablau-upload .upload-demo .el-upload--picture-card {
  width: 100px;
  height: 100px;
  line-height: 1;
}
/deep/.el-upload--picture-card i {
  font-size: 14px;
}
/deep/.datablau-upload .upload-demo .el-upload__text {
  color: #409eff;
  cursor: pointer;
  margin-top: 10px;
}
/deep/.datablau-upload.datablau-upload-drag {
  width: 300px;
  margin: 20px 0 10px 0;
  height: 100px;
}
/deep/.el-upload-list--picture-card .el-upload-list__item {
  width: 100px;
  height: 100px;
  border: 1px dashed #409eff;
  margin: 0 10px 0 0;
}
/deep/.el-upload-list--picture-card .el-upload-list__item-status-label {
  display: none;
}
/deep/.el-upload-list__item {
  transition: none !important;
}
/deep/.empty.datablau-input .el-input__inner {
  border-color: #ff4b53;
}
/deep/.empty.datablau-select .el-select .el-input input {
  border-color: #ff4b53;
}
/deep/.el-upload-list--picture-card .el-upload-list__item-actions:hover {
  /*opacity: 0;*/
  display: none;
}
</style>
