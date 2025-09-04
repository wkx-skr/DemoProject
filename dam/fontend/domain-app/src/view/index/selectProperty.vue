<template>
  <div>
    <el-dialog
      title="请输入目录名称"
      width="400px"
      :visible.sync="nameDialogVisible"
      append-to-body
      v-if="nameDialogVisible"
    >
      <el-input v-model="catalogName"></el-input>
      <el-button
        type="primary"
        size="small"
        :disabled="!catalogName"
        @click="handleCreateOrUpdateCatalog"
      >

        {{ $t('common.button.ok') }}

      </el-button>
    </el-dialog>
    <el-dialog
      title="修改属性"
      width="400"
      :visible.sync="propertyUpdateDialogVisible"
      append-to-body
      v-if="propertyUpdateDialogVisible"
    >
      <el-form size="small" label-width="6em">
        <el-form-item label="所属类别">
          <el-input
            readonly
            disabled
            v-model="currentProp.catalog.catalog"
          ></el-input>
        </el-form-item>
        <el-form-item label="属性编码">
          <el-input readonly disabled v-model="currentProp.propId"></el-input>
        </el-form-item>
        <el-form-item label="属性名称" :rules="{ required: true }">
          <el-input v-model="currentProp.name"></el-input>
        </el-form-item>
        <el-form-item label="值域">
          <el-tooltip
            effect="dark"
            content="未填写值域时，该属性值为纯文本类型，使用时可取任何值；填写了值域，该属性值只能从设定的值中选择"
            placement="left"
          >
            <i class="el-icon-info"></i>
          </el-tooltip>
          <el-tag
            :key="tag"
            v-for="tag in dynamicTags"
            closable
            :disable-transitions="false"
            @close="handleClose(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            class="input-new-tag"
            v-if="inputVisible"
            v-model="inputValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          ></el-input>
          <el-button
            v-else
            class="button-new-tag"
            size="small"
            @click="showInput"
          >
            + 添加
          </el-button>
        </el-form-item>
      </el-form>
      <el-button
        type="primary"
        size="small"
        :disabled="!currentProp.name"
        @click="executeUpdateProperty"
      >

        {{ $t('common.button.ok') }}

      </el-button>
    </el-dialog>
    <el-dialog
      title="创建属性"
      width="400"
      :visible.sync="propertyDialogVisible"
      append-to-body
      v-if="propertyDialogVisible"
    >
      <el-form size="small" label-width="6em">
        <el-form-item label="所属类别">
          <el-input
            readonly
            disabled
            v-model="referenceCatalog.name"
          ></el-input>
        </el-form-item>
        <el-form-item label="属性编码">
          <el-input
            placeholder="如果为空，将自动生成"
            v-model="propertyId"
          ></el-input>
        </el-form-item>
        <el-form-item label="属性名称" :rules="{ required: true }">
          <el-input v-model="propertyName"></el-input>
        </el-form-item>
        <el-form-item label="值域">
          <el-tooltip
            effect="dark"
            content="未填写值域时，该属性值为纯文本类型，使用时可取任何值；填写了值域，该属性值只能从设定的值中选择"
            placement="left"
          >
            <i class="el-icon-info"></i>
          </el-tooltip>
          <el-tag
            :key="tag"
            v-for="tag in dynamicTags"
            closable
            :disable-transitions="false"
            @close="handleClose(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            class="input-new-tag"
            v-if="inputVisible"
            v-model="inputValue"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm"
            @blur="handleInputConfirm"
          ></el-input>
          <el-button
            v-else
            class="button-new-tag"
            size="small"
            @click="showInput"
          >
            + 添加
          </el-button>
        </el-form-item>
      </el-form>
      <el-button
        type="primary"
        size="small"
        :disabled="!propertyName"
        @click="handleAppendProperty"
      >

        {{ $t('common.button.ok') }}

      </el-button>
    </el-dialog>
    <div class="tree-box" style="min-height: 300px">
      <el-tree
        lazy
        :key="treeKey"
        class="light-blue-tree"
        :props="defaultProps"
        :load="loadProperty"
        :render-content="renderContent"
        ref="tree"
        :show-checkbox="false"
        @node-click="handleNodeClick"
        node-key="propId"
        :expand-on-click-node="false"
        default-expand-all
      ></el-tree>
    </div>
    <!--<el-button-->
    <!--class=""-->
    <!--size="small"-->
    <!--@click="createNewCatalog"-->
    <!--&gt;创建目录-->
    <!--</el-button>-->
    <!--<el-button-->
    <!--type="primary"-->
    <!--size="small"-->
    <!--@click="handlePropertySelected"-->
    <!--&gt;确定</el-button>-->
  </div>
</template>

<script>
import js from './selectProperty.js'
export default js
</script>
<style lang="scss" scoped>
.tree-box {
  position: absolute;
  top: 20px;
  left: 20px;
  bottom: 20px;
  right: 20px;
}
</style>
<style scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
