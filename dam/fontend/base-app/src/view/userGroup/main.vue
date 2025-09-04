<!--
 * @Author: your name
 * @Date: 2022-02-17 17:31:44
 * @LastEditTime: 2022-02-23 10:59:28
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \dam产品-2079\dam-web\datablau-web\src\view\userGroup\main.vue
-->
<template>
  <div class="manage-box">
    <div class="left-tree">
      <list
        ref="listTree"
        @showAdd="showAdd"
        @show-tree-data="showTreeData"
      ></list>
    </div>
    <div class="user-group-line"></div>
    <div class="right-table">
      <tab-pane @editGroup="editGroup"></tab-pane>
    </div>
    <datablau-dialog
      :title="groupTitle"
      :visible.sync="dialogVisible"
      append-to-body
      size="m"
    >
      <div class="form-part">
        <datablau-form
          :model="form"
          label-width="75px"
          :rules="rules"
          ref="addForm"
        >
          <el-form-item
            :label="$t('system.userGroup.groupName')"
            prop="groupName"
          >
            <datablau-input
              clearable
              type="text"
              maxlength="100"
              style="width: 100%"
              v-model="form.groupName"
            ></datablau-input>
          </el-form-item>
          <el-form-item :label="$t('system.userGroup.mask')" prop="note">
            <datablau-input
              clearable
              type="textarea"
              maxlength="100"
              style="width: 100%"
              v-model="form.note"
            ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <div slot="footer" class="dialog-bottom">
        <datablau-button type="secondary" size="small" @click="cancel">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        &nbsp;
        <datablau-button type="important" size="small" @click="addGroup">
          <!-- 保存 -->
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <empty-page
      v-show="showEmptyPage"
      @create-user-group="showAdd"
    ></empty-page>
  </div>
</template>

<script>
import main from './main.js'
export default main
</script>

<style scoped>
.left-tree {
  position: absolute;
  left: 0;
  width: 280px;
  top: 0;
  bottom: 0;
  /* border: 1px solid var(--border-color-lighter); */
  /* border-left: none; */
  /* border-right: none; */
  background-color: var(--heading-ddc-bgc);
}
.user-group-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 280px;
  width: 1px;
  z-index: 5;
  cursor: e-resize !important;
  background-color: #e0e0e0;
}
.right-table {
  position: absolute;
  left: 281px;
  right: 0;
  bottom: 0;
  top: 0;
  background-color: var(--default-bgc);
  z-index: 3;
}
</style>
