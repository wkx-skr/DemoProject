<template>
  <div class="setting-detail">
    <datablau-dialog
      :visible.sync="seeDetail"
      :title="content.name + $t('common.button.scan')"
      :size="'l'"
      :before-close="handleClose"
      append-to-body
      :close-on-click-modal="true"
    >
      <div class="content seeDetail">
        <el-form
          label-position="right"
          label-width="120px"
          :model="content"
          :rules="rules"
          ref="form"
        >
          <el-form-item :label="$t('quality.page.settingList.table.name')">
            <p>{{ content.name }}</p>
          </el-form-item>
          <!-- <el-form-item label="可见范围">
            <p>{{ scopeArr[content.scope] }}</p>
          </el-form-item> -->
          <el-form-item :label="$t('quality.page.settingList.table.valueType')">
            <p>{{ content.valueType }}</p>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.settingList.table.valueGenerator')"
          >
            <p>{{ content.valueGenerator }}</p>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.settingList.table.description')"
          >
            <p style="width: 540px">{{ content.description }}</p>
          </el-form-item>
        </el-form>
        <el-form
          label-position="right"
          label-width="120px"
          :model="value"
          :rules="rules"
          ref="valueForm"
          :disabled="readOnly"
        >
          <el-form-item
            :label="$t('quality.page.settingList.table.model')"
            v-if="content.valueGenerator == 'SQL'"
          >
            <datablau-select v-model="value.modelId" style="width: 500px">
              <el-option
                v-for="r in restaurants"
                :value="r.modelId"
                :label="r.definition"
                :key="r.modelId"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.settingList.table.expression')"
          >
            <p
              style="width: 540px; white-space: pre-line"
              v-html="value.expression"
            ></p>
          </el-form-item>
          <el-form-item></el-form-item>
        </el-form>
      </div>
      <span slot="footer">
        <datablau-button type="secondary" @click="handleClose">
          {{ $t('common.button.close') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-form-submit v-if="!preData || preData.builtIn === false">
      <div style="margin: 64px 20px 0">
        <el-form
          label-position="right"
          label-width="180px"
          :model="content"
          :rules="rules"
          ref="form"
          :disabled="readOnly"
        >
          <el-form-item
            :label="$t('quality.page.settingList.table.name')"
            prop="name"
          >
            <datablau-input
              v-model="content.name"
              style="width: 500px"
              :disabled="Boolean(preData)"
              :placeholder="
                $t('quality.page.settingList.table.namePlaceholder')
              "
            ></datablau-input>
          </el-form-item>
          <!-- <el-form-item label="可见范围">
            <datablau-select
              v-model="content.scope"
              :disabled="scopeDisabled"
              style="width: 500px"
            >
              <el-option value="INDIVIDUAL" label="私有"></el-option>
              <el-option
                value="PUBLIC"
                label="公共"
                :disabled="content.valueGenerator === 'SQL'"
              ></el-option>
            </datablau-select>
          </el-form-item> -->
          <el-form-item :label="$t('quality.page.settingList.table.valueType')">
            <datablau-select v-model="content.valueType" style="width: 500px">
              <el-option value="LONG"></el-option>
              <el-option value="DOUBLE"></el-option>
              <el-option value="STRING"></el-option>
              <!--<el-option value="SECRET"></el-option>-->
              <el-option value="LIST_LONG"></el-option>
              <el-option value="LIST_DOUBLE"></el-option>
              <el-option value="LIST_STRING"></el-option>
              <!--<el-option value="LIST_SECRET"></el-option>-->
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.settingList.table.valueGenerator')"
          >
            <datablau-select
              v-model="content.valueGenerator"
              style="width: 500px"
            >
              <el-option value="PLAIN"></el-option>
              <el-option
                value="SQL"
                :disabled="content.scope === 'PUBLIC'"
              ></el-option>
              <el-option value="GROOVY"></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.settingList.table.describe')"
            prop="description"
          >
            <datablau-input
              type="textarea"
              style="width: 750px"
              :autosize="{ minRows: 2, maxRows: 80 }"
              v-model="content.description"
              :placeholder="
                $t('quality.page.settingList.table.describePlaceholder')
              "
            ></datablau-input>
          </el-form-item>
        </el-form>
        <el-form
          style="margin-top: 10px"
          label-position="right"
          label-width="180px"
          :model="value"
          :rules="rules"
          ref="valueForm"
          :disabled="readOnly"
        >
          <el-form-item
            :label="$t('quality.page.settingList.table.model')"
            v-if="content.valueGenerator == 'SQL'"
          >
            <datablau-select v-model="value.modelId" style="width: 500px">
              <el-option
                v-for="r in restaurants"
                :value="r.modelId"
                :label="r.definition"
                :key="r.modelId"
              ></el-option>
            </datablau-select>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.settingList.table.expression')"
            prop="expression"
          >
            <datablau-input
              v-model="value.expression"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 80 }"
              :placeholder="
                $t('quality.page.settingList.table.expressionPlaceholder')
              "
              style="width: 750px"
            ></datablau-input>
          </el-form-item>
          <el-form-item></el-form-item>
        </el-form>
      </div>
      <div class="footer-button" slot="buttons">
        <div class="button-box">
          <datablau-button type="important" v-if="!readOnly" @click="confirm">
            {{ $t('common.button.ok') }}
          </datablau-button>
          <datablau-button type="secondary" @click="remove">
            {{ $t('common.button.close') }}
          </datablau-button>
        </div>
      </div>
    </datablau-form-submit>
  </div>
</template>

<script>
import detail from './detail.js'
export default detail
</script>
<style lang="scss">
.setting-detail {
  .el-form-item {
    margin-bottom: 16px;
  }
}
.seeDetail {
  .el-form-item {
    margin-bottom: 0;
  }
}
</style>
