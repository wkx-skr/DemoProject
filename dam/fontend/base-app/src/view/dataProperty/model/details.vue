<template>
  <div style="width: 100%; height: 100%; background: #fff; padding: 20px">
    <datablau-breadcrumb
      :node-data="['编辑模型']"
      :couldClick="false"
      @back="goBack"
    ></datablau-breadcrumb>
    <!--  <div style="width: 100%; height: 60px">
     <datablau-button type="info" :disabled="Boolean(modelId)">
        新建
      </datablau-button>
      <datablau-button type="info" :disabled="!Boolean(modelId)">
        保存
      </datablau-button>
    </div> -->
    <div class="page-content">
      <div class="tree-content">
        <datablau-easy-tree
          :data="treeData"
          node-key="TreeKey"
          ref="modelTree"
          class="grey-tree branchTree"
          :default-expanded-keys="defaultExpandList"
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
          :props="defaultProps"
          :data-icon-function="dataIconFunction"
          :dataOptionsFunction="dataOptionsFunction"
          show-overflow-tooltip
          tooltip-placement="top-start"
          style="width: 100%; height: 100%"
          :itemSize="34"
        ></datablau-easy-tree>
      </div>
      <div class="middle-line"></div>
      <div class="prop-content" style="">
        <div
          style="
            position: absolute;
            left: 16px;
            right: 0px;
            top: 0;
            bottom: 44px;
            padding-right: 10px;
            overflow: auto;
            border-bottom: 1px solid #ccc;
          "
        >
          <template v-if="currentObject && currentObject.Property.length">
            <div
              v-for="prop in displayProps"
              :key="'prop-' + prop.id"
              class="prop-item"
            >
              <span class="prop-label">
                {{ prop.label }}
                <span v-if="prop.id === '90000003' || prop.id === '90000015'">
                  (
                  <span style="color: #f56c6c;">*</span>
                  )
                </span>
              </span>
              <span class="prop-value">
                <datablau-select
                  v-if="prop.label == '数据类型'"
                  :disabled="
                    currentObject.properties[90000001] !== '90002032' ||
                    currentObject.properties[90000037]
                  "
                  v-model="currentObject.properties[prop.id]"
                >
                  <el-option
                    v-for="type in classTypeOptions"
                    :label="type"
                    :value="type"
                    :key="type"
                  ></el-option>
                </datablau-select>
                <datablau-input
                  v-else-if="prop.label === '描述'"
                  type="textarea"
                  v-model="currentObject.properties[prop.id]"
                  style="width: 100%"
                ></datablau-input>
                <datablau-input
                  v-else-if="prop.label === '枚举值'"
                  :disabled="
                    currentObject.properties[90000001] !== '90002032' ||
                    currentObject.properties[90000037]
                  "
                  type="textarea"
                  placeholder="请输入枚举值，以英文逗号分隔"
                  v-model="currentObject.properties[prop.id]"
                  style="width: 100%"
                ></datablau-input>
                <datablau-input
                  v-else-if="prop.label === '别名'"
                  placeholder="请输入别名"
                  v-model="currentObject.properties[prop.id]"
                  style="width: 100%"
                  maxlength="30"
                  show-word-limit
                ></datablau-input>
                <datablau-input
                  v-else-if="prop.label === '名称'"
                  placeholder="请输入名称"
                  v-model="currentObject.properties[prop.id]"
                  :disabled="
                    currentObject.properties[90000002] === '90000002' ||
                    currentObject.properties[90000002] === '90000003'  ||
                    currentObject.properties[90000002] === '90000004'  ||
                    currentObject.properties[90000002] === '80100005' 
                  "
                  style="width: 100%"
                ></datablau-input>
                <datablau-input
                  v-else
                  :disabled="prop.label === 'ID' || prop.label === 'GUID'"
                  v-model="currentObject.properties[prop.id]"
                  style="width: 100%"
                ></datablau-input>
              </span>
            </div>
            <template
              v-if="currentObject && currentObject.properties[90000037]"
            >
              <div class="prop-item">
                <span class="prop-label">被引用模型</span>
                <span class="prop-value">
                  <datablau-input
                    v-model="currentObject.properties[90000037]"
                  ></datablau-input>
                </span>
              </div>
            </template>
            <template
              v-if="currentObject && currentObject.properties[90000036]"
            >
              <div class="prop-item">
                <span class="prop-label">被引用对象</span>
                <span class="prop-value">
                  <datablau-input
                    v-model="currentObject.properties[90000036]"
                  ></datablau-input>
                </span>
              </div>
            </template>
            <template
              v-if="currentObject && currentObject.properties[90000038]"
            >
              <div class="prop-item">
                <span class="prop-label">血缘链路</span>
                <span class="prop-value">
                  <el-radio-group v-model="currentObject.properties[90000038]">
                    <el-radio label="false">不映射</el-radio>
                    <el-radio label="lineage_from">来源对象（from）</el-radio>
                    <el-radio label="lineage_to">下游对象（to）</el-radio>
                  </el-radio-group>
                </span>
              </div>
            </template>
            <!-- 对象类型的节点 -->
            <!-- <template
            v-if="
              currentObject && currentObject.properties[90000001] == '90002016'
            "
          > -->
            <template>
              <div
                class="prop-item"
                v-if="
                  currentObject &&
                  currentObject.properties[90000001] == '90002016'
                "
              >
                <span class="prop-label">图标</span>
                <span class="prop-value">
                  <el-upload
                    :action="`/metadata/mm/${modelDetails.code}/${currentObject.Id}/update`"
                    list-type="picture-card"
                    :auto-upload="true"
                    :limit="1"
                    :file-list="imageFileList"
                    class="image-upload"
                    :class="{ [`upload-done`]: imageFileList.length }"
                    :on-change="handleImageUploadChange"
                  >
                    <i slot="default" class="el-icon-plus"></i>
                    <div slot="file" slot-scope="{ file }">
                      <img
                        class="el-upload-list__item-thumbnail"
                        :src="file.url"
                        alt=""
                      />
                      <span class="el-upload-list__item-actions">
                        <span
                          class="el-upload-list__item-preview"
                          @click="handleImagePreview(file)"
                        >
                          <i class="el-icon-zoom-in"></i>
                        </span>
                        <span
                          class="el-upload-list__item-delete"
                          @click="handleImageRemove(file)"
                        >
                          <i class="el-icon-delete"></i>
                        </span>
                      </span>
                    </div>
                  </el-upload>
                </span>
              </div>
              <div class="prop-item" style="align-items: flex-start">
                <span class="prop-label">选项</span>
                <span class="prop-value"></span>
              </div>
              <template
                v-if="
                  currentObject &&
                  (currentObject.properties[90000001] == '90002016' ||
                    currentObject.properties[90000001] == '90002032')
                "
              >
                <div class="prop-item">
                  <span class="prop-label"></span>
                  <span class="prop-value2">
                    <span class="prop-label2">默认值</span>
                    <datablau-input
                      v-model="currentObject.properties[80100034]"
                      style="width: 80%"
                    ></datablau-input>
                  </span>
                </div>
                <div
                  class="prop-item"
                  v-if="
                    currentObject.properties[90000002] !== '90000004' &&
                    currentObject.properties[90000002] !== '90000002' &&
                    currentObject.properties[90000002] !== '80100005' &&
                    currentObject.properties[90000002] !== '90000003'
                  "
                >
                  <span class="prop-label"></span>
                  <span class="prop-value2">
                    <span class="prop-label2">长度</span>
                    <datablau-input
                      v-model="currentObject.properties[80100032]"
                      style="width: 80%"
                    ></datablau-input>
                  </span>
                </div>
                <div
                  class="prop-item"
                  v-if="
                    currentObject.properties[90000002] !== '90000004' &&
                    currentObject.properties[90000002] !== '90000002' &&
                    currentObject.properties[90000002] !== '80100005' &&
                    currentObject.properties[90000002] !== '90000003'
                  "
                >
                  <span class="prop-label"></span>
                  <span class="prop-value2">
                    <span class="prop-label2">精度</span>
                    <datablau-input
                      v-model="currentObject.properties[80000107]"
                      style="width: 80%"
                    ></datablau-input>
                  </span>
                </div>
                <div class="prop-item">
                  <span class="prop-label"></span>
                  <span class="prop-value2">
                    <span class="prop-label2"></span>
                    <el-checkbox v-model="currentObject.properties[90000026]">
                      是否必填
                    </el-checkbox>
                  </span>
                </div>
                <div class="prop-item">
                  <span class="prop-label"></span>
                  <span class="prop-value2">
                    <span class="prop-label2"></span>
                    <el-checkbox v-model="currentObject.properties[90000020]">
                      是否数组
                    </el-checkbox>
                  </span>
                </div>
                <div class="prop-item">
                  <span class="prop-label"></span>
                  <span class="prop-value2">
                    <span class="prop-label2"></span>
                    <el-checkbox v-model="currentObject.properties[90000014]">
                      是否引用其他对象
                    </el-checkbox>
                  </span>
                </div>
                <div
                  class="prop-item"
                  v-if="currentObject && currentObject.properties[90000014]"
                >
                  <span class="prop-label"></span>
                  <span class="prop-value2">
                    <span class="prop-label2">引用对象</span>
                    <datablau-input
                      v-model="currentObject.properties[80500060]"
                      style="width: 80%"
                    ></datablau-input>
                  </span>
                </div>
              </template>

              <div class="prop-item" style="align-items: flex-start">
                <span class="prop-label"></span>
                <span class="prop-value">
                  <el-checkbox
                    v-if="
                      currentObject &&
                      currentObject.properties[90000001] == '90002016'
                    "
                    v-model="currentObject.properties[90000033]"
                  >
                    是否允许注册到数据资产
                  </el-checkbox>
                </span>
              </div>

              <div class="prop-item" style="align-items: flex-start">
                <span class="prop-label"></span>
                <span class="prop-value">
                  <el-checkbox v-model="currentObject.properties[90000012]">
                    是否UI显示
                  </el-checkbox>
                </span>
              </div>
              <template
                v-if="
                  currentObject &&
                  currentObject.properties[90000012] &&
                  (currentObject.properties[90000001] == '90002016' ||
                    currentObject.properties[90000001] == '90002032')
                "
              >
                <div class="prop-item">
                  <span class="prop-label"></span>
                  <span class="prop-value2">
                    <span class="prop-label2">控件</span>
                    <datablau-input
                      v-model="currentObject.properties[80000021]"
                      style="width: 80%"
                    ></datablau-input>
                  </span>
                </div>

                <div class="prop-item">
                  <span class="prop-label"></span>
                  <span class="prop-value2">
                    <span class="prop-label2">分组名</span>
                    <datablau-input
                      v-model="currentObject.properties[80010076]"
                      style="width: 80%"
                    ></datablau-input>
                  </span>
                </div>
                <div class="prop-item">
                  <span class="prop-label"></span>
                  <span class="prop-value2">
                    <span class="prop-label2">显示顺序号</span>
                    <datablau-input
                      v-model="currentObject.properties[80010108]"
                      style="width: 80%"
                    ></datablau-input>
                  </span>
                </div>
              </template>
            </template>
            <!-- <div style="margin-top: 15vh">
            <el-checkbox v-model="currentObject.properties[90000012]">
              Visible on UI
            </el-checkbox>
            <el-checkbox v-model="currentObject.properties[90000016]">
              Is Database Physical
            </el-checkbox>
            <br />
            <el-checkbox v-model="currentObject.properties[90000014]">
              Is Object Referenced
            </el-checkbox>
            <el-checkbox v-model="currentObject.properties[90000020]">
              Is Array
            </el-checkbox>
            <br />
            <el-checkbox v-model="currentObject.properties[90000021]">
              Is UDP
            </el-checkbox>
            <el-checkbox v-model="currentObject.properties[90000024]">
              Dynamic
            </el-checkbox>
          </div> -->
          </template>
        </div>
        <div v-if="currentObject && currentObject.Property.length">
          <datablau-button
            @click="updateProps"
            style="position: absolute; bottom: 0px; right: 10px"
            :disabled="
              currentObject.properties[90000003] == '' ||
              currentObject.properties[90000015] == ''
            "
          >
            保存
          </datablau-button>
        </div>
      </div>
    </div>
    <object-selector
      :all="objectSelectorOptions"
      @close="handleObjectSelectorClose"
      :visible="showObjectSelectorDialog"
      v-if="showObjectSelectorDialog"
      :parent="currentOperateObject"
      :type="bindType"
      @handleObjectSelectorConfirm="handleObjectSelectorConfirm"
    ></object-selector>
    <add-object
      :visible="showAddObjectDialog"
      :type="addType"
      v-if="showAddObjectDialog"
      @close="handleAddObjectClose"
      @confirm="handleAddObjectConfirm"
    ></add-object>
    <datablau-dialog :visible.sync="imageDialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="" />
    </datablau-dialog>
  </div>
</template>

<script>
import ModelDetail from '@/view/map/modelDetail.vue'
import DetailsJs from './details.js'
export default DetailsJs
</script>

<style lang="scss" scoped>
.page-content {
  margin-top: 10px;
  padding-top: 10px;
  position: relative;
  width: 100%;
  height: calc(100% - 40px);
  overflow: auto;
  .tree-content {
    position: absolute;
    left: 0;
    width: 600px;
    top: 0;
    bottom: 0;
    overflow: auto;
  }
  .middle-line {
    position: absolute;
    top: 0;
    left: 605px;
    bottom: 0;
    z-index: 2;
    width: 7px;
    cursor: e-resize !important;
    background-color: transparent;
  }
  .prop-content {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 610px;
    width: calc(100% - 610px);
    border-left: 1px solid #ccc;
    padding-left: 20px;
  }
}

.prop-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  .prop-label {
    display: inline-block;
    width: 120px;
  }
  .prop-label2 {
    display: inline-block;
    width: 100px;
  }
  .prop-value2 {
    display: flex;
    align-items: center;
    width: 450px;
  }
  .prop-value {
    display: inline-block;
    width: 450px;
  }
}
</style>
<style lang="scss">
.image-upload {
  display: inline-block;
  .el-upload--picture-card,
  .el-upload-list--picture-card .el-upload-list__item {
    width: 64px;
    height: 64px;
  }
  .el-upload-list--picture-card .el-upload-list__item-actions {
    font-size: 16px;
  }
  .el-upload--picture-card {
    width: 64px;
    height: 64px;
    line-height: 64px;
  }
  .el-upload--picture-card i {
    font-size: 18px;
  }
  &.upload-done {
    .el-upload--picture-card {
      display: none;
    }
  }
}
</style>
