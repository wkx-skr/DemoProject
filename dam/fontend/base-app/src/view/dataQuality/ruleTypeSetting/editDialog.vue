<template>
  <div class="editDialog">
    <datablau-dialog
      width="500px"
      height="400"
      :title="title"
      :visible.sync="isShow"
      append-to-body
      @close="cancel"
    >
      <div>
        <datablau-form
          :label-width="isSub ? '70px' : '60px'"
          :rules="rules"
          ref="form"
          :model="formData"
          size="mini"
        >
          <el-form-item
            :label="$t('quality.page.ruleTypeSetting.name')"
            prop="name"
          >
            <datablau-input
              clearable
              maxlength="15"
              style="width: 100%"
              v-model="formData.name"
              :placeholder="$t('quality.page.ruleTypeSetting.namePlaceholder')"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.ruleTypeSetting.code')"
            prop="code"
          >
            <datablau-input
              :disabled="isEdit"
              clearable
              maxlength="15"
              style="width: 100%"
              v-model="formData.code"
              :placeholder="$t('quality.page.ruleTypeSetting.namePlaceholder')"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.ruleTypeSetting.index')"
            prop="index"
          >
            <datablau-input
              clearable
              maxlength="9"
              style="width: 100%"
              v-model="formData.index"
              :placeholder="$t('quality.page.ruleTypeSetting.indexPlaceholder')"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.ruleTypeSetting.parentName')"
            v-if="isSub"
            prop="parentName"
          >
            <datablau-select
              class="filter-input"
              clearable
              style="width: 100%"
              v-model="formData.parentName"
              @change="changeP"
              :placeholder="$t('el.select.placeholder')"
            >
              <el-option
                v-for="(item, index) in parentData"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item :label="$t('quality.page.ruleTypeSetting.desc')">
            <datablau-input
              type="textarea"
              clearable
              maxlength="200"
              size="small"
              style="width: 100%"
              v-model="formData.desc"
              :rows="3"
              :placeholder="$t('common.placeholder.prefix')"
            ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <div slot="footer">
        <datablau-button type="secondary" @click="cancel">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button type="important" @click="save">
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import editDialog from './editDialog.js'
export default editDialog
</script>

<style lang="scss" scoped>
.editDialog {
}
</style>
