<template>
  <div>
    <div class="areas">
      <!--域              -->
      <div class="paddingL24">
        <div
          class="flex"
          v-for="(item, index) in areas"
          :key="'areas' + index"
          v-if="!item.delete"
        >
          <div>
            <datablau-input
              v-if="!item.built"
              v-model="item.name"
              @blur="propNameBlur(item, index)"
              @input="keyup(item)"
              @change="setModify(item, index)"
              :class="{ repeatName: item.mes, empty: item.class }"
              clearable
              maxlength="20"
              :placeholder="$t('assets.generalSettings.placeholder')"
              style="width: 300px; height: 32px"
            ></datablau-input>
            <div class="weight" v-else>{{ item.name }}</div>
          </div>
          <div>
            <datablau-select-weak
              v-if="!item.built"
              :class="{ empty: item.class }"
              popper-class="eloption"
              multiple
              allow-create
              @focus="setItemOptions(item, index)"
              v-model="item.assetsType"
              @change="setModify(item, index)"
              :placeholder="$t('assets.generalSettings.please')"
              style="width: 390px; height: 300px"
              @selectAll="k => selectAll(k, item)"
              :optionsData="{
                data: options,
                key: 'value',
                value: 'value',
                label: 'label',
                showAll: true,
                all: item.all,
              }"
            ></datablau-select-weak>
            <div class="weight" v-else>
              {{ item.assetsType && getText(item.assetsType) }}
            </div>
          </div>
          <div>
            <span @click="completeness(item, index)">
              {{ $t('assets.generalSettings.comple') }}
            </span>
            <span @click="extendedProperties(item, index)">
              {{ $t('assets.generalSettings.extended') }}
            </span>
          </div>
          <div>
            <div @click="upload(item, index)">
              <img :src="url + item.icon" alt="" v-if="item.icon" />
              <img
                :src="imgList[index + 1]"
                alt=""
                v-if="!item.icon && index < 5"
              />
              <img :src="imgList[0]" alt="" v-if="!item.icon && index > 4" />
            </div>
          </div>
          <div>
            <span class="deletedIconBox">
              <i
                v-if="!item.built"
                v-show="!item.inUse"
                :class="{
                  iconfont: true,
                  'icon-delete': true,
                  blue: !item.inUse,
                }"
                @click="deleteAsset(item, index)"
              ></i>
              <datablau-tooltip
                placement="bottom"
                effect="dark"
                popper-class="tooltipBox"
                :content="$t('assets.generalSettings.cannotBeDeleted')"
              >
                <i
                  v-if="!item.built"
                  v-show="item.inUse"
                  :class="{
                    iconfont: true,
                    'icon-delete': true,
                    blue: !item.inUse,
                  }"
                  @click="deleteAsset(item, index)"
                ></i>
              </datablau-tooltip>
            </span>
          </div>
        </div>
        <div class="flex">
          <div>
            <span @click="areaClick()">
              <i class="iconfont icon-tianjia blu iconAdd"></i>
              <span class="blu">
                {{ $t('assets.generalSettings.addDirectoryType') }}
              </span>
            </span>
            <span @click="saveClick()" class="saveBox">
              <i class="iconfont icon-save blu iconAdd"></i>
              <span class="blu">{{ $t('assets.generalSettings.save') }}</span>
            </span>
          </div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
    <datablau-dialog
      :visible.sync="uploadFlag"
      :title="$t('assets.generalSettings.upload')"
      width="480px"
      height="320px"
      :before-close="handleClose"
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
      <span slot="footer">
        <datablau-button type="secondary" @click="handleClose">
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
// import level1 from '/static/images/dataAssets/level1.png'
// import level2 from '/static/images/dataAssets/leve2.png'
// import level3 from '/static/images/dataAssets/leve3.png'
// import level4 from '/static/images/dataAssets/leve4.png'
// import level5 from '/static/images/dataAssets/leve5.png'
// import level0 from '/static/images/dataAssets/leve0.png'
import HTTP from '../utils/api'
import { AssetsTypeEnum } from '@/view/dataAsset/utils/Enum'
export default {
  data() {
    return {
      imgList: {
        0: '/static/images/dataAssets/leve0.png',
        1: '/static/images/dataAssets/level1.png',
        2: '/static/images/dataAssets/leve2.png',
        3: '/static/images/dataAssets/leve3.png',
        4: '/static/images/dataAssets/leve4.png',
        5: '/static/images/dataAssets/leve5.png',
      },
      uploadFlag: false,
      fileList: [],
      imageUrl: '',
      recoverImg: '',
      recoverImgURl: '',
      action: '',
      accept: 'image/png,image/jpg,image/jpeg',
      picture: false,
      iconItem: {},
      url: window.setting.restApiPathName + '/service/ddc/config/icon/',
      disabled: false,
      display: 'none',
    }
  },
  props: ['areas', 'options', 'old'],
  methods: {
    getText(val) {
      let valAry = val
      if (typeof val === 'string') {
        valAry = val.split(',')
      }
      let ary = valAry.map(item => {
        return this.dataText(item)
      })
      if (ary.length === 7) return this.$t('assets.generalSettings.allType')
      return ary.join(',')
    },
    dataText(val) {
      switch (val) {
        case AssetsTypeEnum.DATA_OBJECT:
          return this.$t('assets.generalSettings.object')
        case AssetsTypeEnum.DATA_COLLECTION:
          return this.$t('assets.generalSettings.table')
        case AssetsTypeEnum.DOMAIN:
          return this.$t('assets.generalSettings.standard')
        // case 'DOCUMENT':
        //   return '本地文档'
        case AssetsTypeEnum.INDEX:
          return this.$t('assets.generalSettings.index')
        case AssetsTypeEnum.REPORT:
          return this.$t('assets.generalSettings.report')
        case AssetsTypeEnum.FILE:
          return this.$t('assets.generalSettings.file')
        case AssetsTypeEnum.DATA_SERVICE:
          return this.$t('assets.generalSettings.service')
        case 'CATALOG':
          return this.$t('assets.generalSettings.none')
      }
    },
    areaClick() {
      this.$emit('areaClick')
    },
    deleteAsset(item, index, val) {
      this.searchSome()
      this.$emit('deleteAsset', { item, index })
    },
    searchSome() {
      for (let k = 0; k < this.areas.length; k++) {
        this.areas[k].mes = ''
        if (
          this.areas[k + 1] &&
          this.areas[k].name === this.areas[k + 1].name
        ) {
          this.areas[k + 1].mes = '已重名'
        }
      }
    },
    // 设置下拉禁止取消选择
    setItemOptions(item, index) {
      this.options.forEach(item => {
        item.disabled = false
      })
      const inUse = this.areas[index].inUse
      const assetsType = this.old[index] ? this.old[index].assetsType : []
      if (inUse) {
        this.options.forEach(k => {
          if (assetsType.indexOf(k.value) !== -1) {
            k.disabled = true
          }
        })
      }
      item.assetsType.length === this.options.length
        ? (item.all = true)
        : (item.all = false)
    },
    completeness(item, index) {
      item.index = index
      this.$emit('completeness', item)
    },
    extendedProperties(item, index) {
      item.index = index
      this.$emit('extendedProperties', item)
    },
    saveClick() {
      let flag = this.areas.some(item => {
        return item.mes
      })
      !flag && this.$emit('saveClick')
    },
    propNameBlur(val, index) {
      val.mes = null
      let flag = this.areas
        .filter(item => {
          return !item.delete
        })
        .some((item, i) => {
          item.mes = null
          if (i !== index) {
            return item.name && item.name === val.name
          }
        })
      flag && (val.mes = '已重名')
      this.$set(this.areas, index, val)
    },
    keyup(item) {
      // item.name = item.name.replace(/[^\u4e00-\u9fa5]/g, '')
      // this.propNameBlur()
    },
    setModify(item, index) {
      if (item.id) {
        item.modify = true
        this.$set(this.areas, index, item)
      }
      item.assetsType.length === this.options.length
        ? (item.all = true)
        : (item.all = false)
    },
    selectAll(flag, item) {
      item.all = flag
      if (flag) {
        this.options.forEach(k => {
          item.assetsType.indexOf(k.value) === -1 &&
            item.assetsType.push(k.value)
        })
      } else {
        item.assetsType = []
        this.options.forEach(k => {
          k.disabled && item.assetsType.push(k.value)
        })
      }
    },
    upload(item, index) {
      this.imageUrl = item.icon
        ? this.url + item.icon
        : index <= 4
        ? this.imgList[index + 1]
        : this.imgList[0]
      this.recoverImg = index <= 4 ? index + 1 : 0 // 获取默认图片的名字
      this.recoverImgURl =
        index <= 4 ? this.imgList[index + 1] : this.imgList[0]
      this.uploadFlag = true
      this.picture = false
      this.fileList = [{ name: index, url: this.imageUrl }]
      this.iconItem = item
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
    handleClose() {
      this.uploadFlag = false
      this.fileList = []
    },
    delectImage() {
      this.display = 'none'
      this.fileList = [{ name: 1, url: this.imageUrl }]
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
      if (this.iconItem.id) {
        HTTP.reviseImage({ id: this.iconItem.id, iconId: id })
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
  },
  mounted() {
    // console.log(this.areas)
  },
}
</script>

<style scoped lang="scss">
$color1: #ddd;
$color2: #ddd;
$color3: #ddd;
$color4: #ddd;
.flex {
  display: flex;
  position: relative;
  &:hover {
    background: rgba(64, 158, 255, 0.1);
  }
  & > div {
    height: 44px;
    line-height: 44px;
    padding-right: 25px;
  }
  & > div:nth-child(1) {
    width: 494px;
  }
  & > div:nth-child(2) {
    width: 390px;
    margin-right: 32px;
  }
  & > div:nth-child(3) {
    width: 132px;
    /*padding-right: 40px;*/
    /*text-align: right;*/
    span {
      color: #409eff;
      margin-right: 10px;
      cursor: pointer;
    }
  }
  & > div:nth-child(4) {
    width: 50px;
    div {
      width: 32px;
      height: 32px;
      border: 1px solid rgba(64, 158, 255, 0.2);
      background: #fff;
      border-radius: 15px;
      text-align: center;
      line-height: 32px;
      margin-top: 7px;
    }
    img {
      width: 16px;
      height: 16px;
      cursor: pointer;
      position: relative;
      top: -3px;
    }
  }
  i {
    cursor: not-allowed;
    margin-left: 14px;
    color: #999;
  }

  .blu {
    color: #409eff;
    cursor: pointer;
  }
  .blue {
    color: #ff4b53;
    cursor: pointer;
  }
}
.blue {
  color: #409eff;
  cursor: pointer;
}
@mixin w1h20 {
  content: '';
  display: block;
  width: 1px;
  height: 25px;
  border-left: 2px solid #ddd;
  position: absolute;
}
@mixin w10h1 {
  content: '';
  display: block;
  width: 30px;
  height: 1px;
  border-top: 2px solid #ddd;
  position: absolute;
}

@mixin w1h50 {
  content: '';
  height: 50%;
  width: 1px;
  border-left: 2px solid #ddd;
  position: absolute;
}
@mixin w1h11 {
  content: '';
  height: 1px;
  width: 11px;
  border-left: 2px solid #ddd;
  position: absolute;
}
@mixin w1h40 {
  content: '';
  width: 1px;
  height: 50px;
  position: absolute;
  border-left: 2px solid #ddd;
}
$areasNums: 0px;
$themesNums: 0px;
$pairsNums: 0px;
$entityNums: 0px;
$propertyNum: 0px;
.areas > div {
  & > div {
    &:before {
      @include w10h1();
      top: 50%;
      left: $areasNums;
    }
    &:after {
      @include w1h40();
      bottom: 0;
      left: $areasNums;
    }
  }
  & > div:first-child {
    &:before {
      @include w10h1();
      top: 50%;
      left: $areasNums;
    }
    &:after {
      @include w1h20();
      bottom: 0;
      height: 22px;
      left: $areasNums;
    }
  }
  & > div:last-child {
    &:before {
      @include w10h1();
      top: 50%;
      left: $areasNums;
    }
    &:after {
      @include w1h20();
      bottom: 20px;
      left: $areasNums;
    }
  }
}
.themes {
  & > div {
    & > div {
      &:before {
        @include w10h1();
        top: 50%;
        left: $themesNums;
        border-top: 2px solid $color1;
      }
      &:after {
        @include w1h40();
        bottom: 0;
        left: $themesNums;
        border-left: 2px solid $color1;
      }
    }
    & > div:first-child {
      &:before {
        @include w10h1();
        top: 50%;
        left: $themesNums;
        border-top: 2px solid $color1;
      }
      &:after {
        @include w1h20();
        bottom: 0;
        left: $themesNums;
        height: 22px;
        border-left: 2px solid $color1;
      }
    }
    & > div:last-child {
      &:before {
        @include w10h1();
        top: 50%;
        left: $themesNums;
        border-top: 2px solid $color1;
      }
      &:after {
        @include w1h20();
        bottom: 20px;
        left: $themesNums;
        border-left: 2px solid $color1;
      }
    }
  }
}
.pairs {
  & > div {
    & > div {
      &:before {
        @include w10h1();
        top: 50%;
        left: $pairsNums;
        border-top: 2px solid $color2;
      }
      &:after {
        @include w1h40();
        bottom: 0;
        left: $pairsNums;
        border-left: 2px solid $color2;
      }
    }
    & > div:first-child {
      &:before {
        @include w10h1();
        top: 50%;
        left: $pairsNums;
        border-top: 2px solid $color2;
      }
      &:after {
        @include w1h20();
        bottom: 0;
        left: $pairsNums;
        height: 22px;
        border-left: 2px solid $color2;
      }
    }
    & > div:last-child {
      &:before {
        @include w10h1();
        top: 50%;
        left: $pairsNums;
        border-top: 2px solid $color2;
      }
      &:after {
        @include w1h20();
        bottom: 20px;
        left: $pairsNums;
        border-left: 2px solid $color2;
      }
    }
  }
}
.entity {
  & > div {
    & > div {
      &:before {
        @include w10h1();
        top: 50%;
        left: $entityNums;
        border-top: 2px solid $color3;
      }
      &:after {
        @include w1h40();
        bottom: 0;
        left: $entityNums;
        border-left: 2px solid $color3;
      }
    }
    & > div:first-child {
      &:before {
        @include w10h1();
        top: 50%;
        left: $entityNums;
        border-top: 2px solid $color3;
      }
      &:after {
        @include w1h20();
        bottom: 0;
        left: $entityNums;
        border-left: 2px solid $color3;
        height: 22px;
      }
    }
    & > div:last-child {
      &:before {
        @include w10h1();
        top: 50%;
        left: $entityNums;
        border-top: 2px solid $color3;
      }
      &:after {
        @include w1h20();
        bottom: 20px;
        left: $entityNums;
        border-left: 2px solid $color3;
      }
    }
  }
}
.property {
  & > div {
    & > div {
      &:before {
        @include w10h1();
        top: 50%;
        left: $propertyNum;
        border-top: 2px solid $color4;
      }
      &:after {
        @include w1h40();
        bottom: 0;
        left: $propertyNum;
        border-left: 2px solid $color4;
      }
    }
    & > div:first-child {
      &:before {
        @include w10h1();
        top: 50%;
        left: $propertyNum;
        border-top: 2px solid $color4;
      }
      &:after {
        @include w1h20();
        bottom: 0;
        height: 22px;
        left: $propertyNum;
        border-left: 2px solid $color4;
      }
    }
    & > div:last-child {
      &:before {
        @include w10h1();
        top: 50%;
        left: $propertyNum;
        border-top: 2px solid $color4;
      }
      &:after {
        @include w1h20();
        bottom: 20px;
        left: $propertyNum;
        border-left: 2px solid $color4;
      }
    }
  }
}

.gray {
  color: #999999;
}
.blu {
  color: #409eff;
}
.iconAdd {
  position: relative;
  top: 2px;
  margin-right: 6px;
}
.paddingL24 {
  & > div > div:nth-child(1) {
    padding-left: 44px;
  }
}
.paddingL30 {
  padding-left: 44px;
}
.paddingL36 {
  & > div > div:nth-child(1) {
    padding-left: 44px;
  }
}
.paddingL49 {
  & > div > div:nth-child(1) {
    padding-left: 44px;
  }
}
.paddingL138 {
  & > div > div:nth-child(1) {
    padding-left: 44px;
  }
}
.paddingL166 {
  & > div > div:nth-child(1) {
    padding-left: 44px;
  }
}
.saveBox {
  border-left: 1px solid #ddd;
  margin-left: 10px;
  line-height: 14px;
}
/deep/ .datablau-input .el-input .el-input__inner {
  height: 32px;
}
/deep/.datablau-input .el-input.is-disabled .el-input__inner,
/deep/.el-select .el-input.is-disabled .el-input__inner {
  border-color: #ddd;
  background-color: #f5f5f5;
  cursor: not-allowed !important;
}
/deep/.datablau-select.multi-select .el-select .el-select__tags {
  margin-top: 4px;
}
.deletedIconBox {
  display: inline-block;
  width: 30px;
}
/deep/ .repeatName .el-input__inner {
  border-color: #ff4b53;
}
.repeatName {
  position: relative;
  &::after {
    content: '已重名';
    position: absolute;
    bottom: -9px;
    font-size: 12px;
    color: #ff4b53;
    right: -37px;
  }
}

.avatar {
  width: 100px;
  height: 100px;
  position: absolute;
  left: -100px;
  top: -10px;
}
/deep/.datablau-upload.datablau-upload-drag .upload-demo .el-upload-dragger {
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  margin: 20px 0;
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

<style lang="scss">
.eloption {
  .el-scrollbar {
    .el-select-dropdown__wrap {
      max-height: 350px !important;
    }
  }
  .el-scrollbar__bar.is-vertical {
    display: none;
  }
}
</style>
