<template>
  <div v-loading="loading" class="structure">
    <datablau-form-submit>
      <div class="title">安全分类设计</div>
      <datablau-detail-subtitle
        mt="0"
        title="同步数据资产目录空间"
        class="tile"
        v-if="$featureMap['FE_ASSET']"
      ></datablau-detail-subtitle>
      <datablau-form
        ref="firstForm"
        :model="catalog"
        v-if="$featureMap['FE_ASSET']"
      >
        <el-form-item label="同步时间">
          <datablau-radio v-model="catalog.sersync" class="async-radio">
            <el-radio :label="true" @click.native.prevent="changeRadio">
              实时同步
            </el-radio>
          </datablau-radio>
        </el-form-item>
        <el-form-item label="数据同步目录空间">
          <datablau-select
            v-model="catalog.structureId"
            clearable
            class="actionSel"
            :disabled="!enableSync"
            @change="structureChange"
            style="width: 320px; height: 32px"
          >
            <el-option
              v-for="item in assetCatalogList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="立即同步">
          <datablau-switch
            v-model="catalog.openSync"
            active-text="开启"
            inactive-text="关闭"
            type="innerText"
          ></datablau-switch>
        </el-form-item>
        <el-form-item label="默认安全等级">
          <datablau-select
            v-model="catalog.secLevelId"
            clearable
            class="actionSel"
            style="width: 320px; height: 32px"
          >
            <el-option
              v-for="item in levelList"
              :key="item.tagId"
              :label="item.name"
              :value="item.tagId"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="默认影响程度">
          <datablau-select
            v-model="catalog.degreeId"
            clearable
            class="actionSel"
            style="width: 320px; height: 32px"
          >
            <el-option
              v-for="item in degree"
              :key="item.tagId"
              :label="item.name"
              :value="item.tagId"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="默认影响范围">
          <datablau-select
            v-model="catalog.scopeId"
            clearable
            class="actionSel"
            style="width: 320px; height: 32px"
          >
            <el-option
              v-for="item in scope"
              :key="item.tagId"
              :label="item.name"
              :value="item.tagId"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="默认影响对象">
          <datablau-select
            v-model="catalog.objectId"
            clearable
            class="actionSel"
            style="width: 320px; height: 32px"
          >
            <el-option
              v-for="item in objectList"
              :key="item.tagId"
              :label="item.name"
              :value="item.tagId"
            ></el-option>
          </datablau-select>
        </el-form-item>
        <el-form-item label="默认重要程度">
          <datablau-select
            v-model="catalog.importanceId"
            clearable
            class="actionSel"
            style="width: 320px; height: 32px"
          >
            <el-option
              v-for="item in importance"
              :key="item.tagId"
              :label="item.name"
              :value="item.tagId"
            ></el-option>
          </datablau-select>
        </el-form-item>
      </datablau-form>
      <datablau-detail-subtitle
        title="层级管理"
        class="tile"
        :mt="$featureMap['FE_ASSET'] ? '20px' : 0"
      ></datablau-detail-subtitle>
      <div class="structureBox">
        <div class="selectLevel">
          <datablau-radio
            :radioTitle="'层级'"
            v-model="level"
            @change="radioChang"
          >
            <el-radio :label="1" :disabled="1 < oldLevel && detailVos.inUse">
              一层
            </el-radio>
            <el-radio :label="2" :disabled="2 < oldLevel && detailVos.inUse">
              两层
            </el-radio>

            <el-radio :label="3" :disabled="3 < oldLevel && detailVos.inUse">
              三层
            </el-radio>
            <el-radio :label="4" :disabled="4 < oldLevel && detailVos.inUse">
              四层
            </el-radio>
            <el-radio :label="5" :disabled="5 < oldLevel && detailVos.inUse">
              五层
            </el-radio>
          </datablau-radio>
        </div>
        <div class="tableOfContents">
          <div class="tableOf">
            <div class="til flexDisplay">
              <div>资产目录</div>
              <div>支持数据资产类型</div>
              <div>相关配置</div>
              <div>图标</div>
            </div>
            <div
              class="tableContents flexDisplay alignItems"
              v-for="(items, index) in detailVosList"
              :key="'structure' + index"
            >
              <div class="flexDisplay alignItems">
                <datablau-input
                  :class="['selectBox', { duplicate: items.class }]"
                  placeholder="请输入名称，20个长度"
                  maxlength="20"
                  v-model="items.name"
                  @blur="nameFocus(items, index)"
                  style="width: 300px"
                  clearable
                ></datablau-input>
                <el-tooltip
                  placement="right"
                  effect="light"
                  popper-class="tooltipBox"
                >
                  <div slot="content">
                    <datablau-detail-subtitle
                      title="目录属性"
                      mt="5px"
                    ></datablau-detail-subtitle>
                    <ul
                      class="tipCon"
                      v-if="
                        items.assetsTypes.indexOf(type.DATA_OBJECT) != -1 ||
                        items.assetsTypes.indexOf(type.DATA_COLLECTION) != -1 ||
                        items.assetsTypes.indexOf(type.VIEW) != -1 ||
                        items.assetsTypes.indexOf(type.INFO_OBJECT) != -1
                      "
                    >
                      <li>目录名称</li>
                      <li>目录描述</li>
                      <li>安全等级</li>
                      <li>影响对象</li>
                      <li>影响范围</li>
                      <li>影响程度</li>
                      <li>法规</li>
                      <li>条文</li>
                    </ul>
                    <ul v-else class="tipCon">
                      <li>目录名称</li>
                      <li>目录描述</li>
                    </ul>
                  </div>
                  <i class="iconfont icon-tips"></i>
                </el-tooltip>
              </div>
              <div>
                <!-- {{
                  index < detailVosList.length - 1
                    ? '目录'
                    : '数据项，数据表，信息项'
                }} -->
                <datablau-select-weak
                  popper-class="eloption"
                  multiple
                  allow-create
                  v-model="items.assetsTypes"
                  :placeholder="'请选择支持的类型'"
                  @focus="assetsTypeFocus(index, items)"
                  style="width: 200px"
                  :optionsData="{
                    data: options,
                    key: 'value',
                    value: 'value',
                    label: 'label',
                  }"
                ></datablau-select-weak>
              </div>
              <div class="iconBox">
                <!--                <span @click="completion(items)">完成度</span>-->
                <datablau-button type="text" @click="properties(items)">
                  扩展属性
                </datablau-button>

                <!--                <span @click="properties(items)">扩展属性</span>-->
              </div>
              <div class="levelImage" @click="upload(items, index)">
                <!--              <img :src="url + items.icon" alt="" v-if="items.icon" />-->
                <img :src="url + items.icon" alt="" v-if="items.icon" />
                <img :src="imgObj[index]" alt="" v-if="!items.icon" />
              </div>
            </div>
          </div>
        </div>

        <!--      -->
      </div>
      <template slot="buttons">
        <datablau-button type="important" @click="saveStructure">
          保存
        </datablau-button>
        <datablau-button type="cancel" @click="getStructure"></datablau-button>
      </template>
    </datablau-form-submit>

    <datablau-dialog
      :visible.sync="uploadFlag"
      title="上传图标"
      width="480px"
      height="320px"
      :before-close="handleClose"
    >
      <p>
        建议长宽比1:1，显示图标大小16*16px；
        <span class="blue" @click="restoreIcon">恢复图标</span>
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
        :auto-upload="false"
        :http-request="uploadSectionFile"
      >
        <i class="iconfont icon-upload blu icon"></i>
        <div class="el-upload__text">上传图标</div>
      </datablau-upload>
      <p>上传图标大小为60kb以下，支持格式png、jpg</p>
      <span slot="footer">
        <datablau-button @click="handleClose">取消</datablau-button>
        <datablau-button type="primary" @click="uploadSectionFile">
          确定
        </datablau-button>
      </span>
    </datablau-dialog>

    <!--    <completenessDialog-->
    <!--      :dialogVisible="dialogVisible"-->
    <!--      :catalogType="catalogType"-->
    <!--      @handleClose="close"-->
    <!--      @primary="primary"-->
    <!--    ></completenessDialog>-->
    <extendedProperties
      :extendVisible="extendVisible"
      :catalogType="catalogType"
      @handleClose="close"
      @primary="primary"
    ></extendedProperties>
  </div>
</template>

<script>
import main from './main'
export default main
</script>

<style scoped lang="scss">
.structure {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: #fff;
  overflow: auto;
}
.async-radio {
  /deep/.el-radio:focus:not(.is-focus):not(:active):not(.is-disabled)
    .el-radio__inner {
    box-shadow: none;
  }
}
.flexDisplay {
  display: flex;
}
.alignItems {
  align-items: center;
}
.structureBox {
  /*position: relative;*/
  width: 1100px;
  padding: 0 20px 20px;
  .tableOfContents {
    border: 1px solid #dddddd;
    padding-top: 13px;
    padding-bottom: 16px;
    /*margin-left: 10px;*/
  }
}
.tableOfContents {
  /*border-radius: 10px;*/
  /*background: #f8f8f8;*/
  border: 1px solid #dddddd;
  padding-top: 13px;
  padding-bottom: 16px;
  /*margin-left: 10px;*/
  .til {
    border-bottom: 1px solid #dddddd;
    padding: 0 45px 10px 40px;
    & > div:nth-child(1) {
      width: 394px;
      /*margin-right: 50px;*/
    }
    & > div:nth-child(2) {
      width: 448px;
      /*margin-right: 69px;*/
    }
    & > div:nth-child(3) {
      width: 96px;
    }
    span {
      color: #ff7519;
      margin-left: 10px;
    }
    b {
      font-weight: normal;
      margin-left: 88px;
    }
  }
  .tableContents {
    padding: 0px 30px 0 40px;
    & > div {
      margin-top: 13px;
    }
    & > div:nth-child(1) {
      width: 392px;
      /*margin-right: 30px;*/
    }
    & > div:nth-child(2) {
      width: 449px;
      /*margin-right: 72px;*/
    }
    .selectBox {
      margin: 0 20px 0 6px;
    }
    .iconBox span {
      margin-right: 14px;
      color: #409eff;
      cursor: pointer;
    }
  }
}
.levelImage {
  width: 32px;
  height: 32px;
  border: 1px solid rgba(64, 158, 255, 0.2);
  background: #fff;
  border-radius: 15px;
  text-align: center;
  line-height: 32px;
  margin-top: 7px;
  cursor: pointer;
  margin-left: 28px;
  &:hover {
    border: 1px solid rgba(64, 158, 255, 1);
  }
  img {
    width: 16px;
    height: 16px;
    margin-top: -5px;
  }
}
.tipCon {
  width: 248px;
  overflow: auto;
  margin-top: -10px;
  li {
    float: left;
    padding: 6px 10px;
    background: rgba(85, 85, 85, 0.05);
    margin-bottom: 10px;
    margin-right: 10px;
    font-size: 12px;
    border-radius: 2px;
    &:nth-child(3n) {
      margin-right: 0;
    }
  }
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
/deep/.el-upload-list--picture-card .el-upload-list__item-actions:hover {
  display: none;
}
/deep/.el-upload-list__item {
  transition: none !important;
}
.blue {
  color: #409eff;
  cursor: pointer;
}
.selectLevel {
  margin-bottom: 10px;
  /*margin-left: 12px;*/
  position: relative;
  /deep/.datablau-radio .radioTitle {
    margin-right: 20px;
  }
}
/deep/.duplicate .el-input__inner {
  border-color: #ff4b53 !important;
}
.duplicate {
  position: relative;
  &::after {
    content: '已重名';
    position: absolute;
    font-size: 12px;
    color: #ff4b53;
    left: 1px;
    bottom: -16px;
  }
}
/deep/.datablau-input .el-input.is-disabled .el-input__inner,
/deep/.el-select .el-input.is-disabled .el-input__inner {
  border-color: #ddd;
  background-color: #f5f5f5;
  cursor: not-allowed !important;
}
.title {
  font-size: 16px;
  vertical-align: middle;
  font-weight: 600;
  height: 44px;
  line-height: 44px;
  padding-left: 20px;
  color: #555;
}
.tile {
  font-size: 16px;
  vertical-align: middle;
  font-weight: 600;
  height: 44px;
  line-height: 44px;
  padding-left: 20px;
  color: #555;
}
/deep/.datablau-radio {
  position: relative;
  top: -1px;
}
</style>
<style lang="scss">
.tooltipBox.el-tooltip__popper.is-light {
  border: 0 !important;
  box-shadow: 0 0 6px #ccc;
}
.tooltipBox {
  .popper__arrow {
    border: 0 !important;
    box-shadow: 0 0 6px #ccc;
  }
}
</style>
