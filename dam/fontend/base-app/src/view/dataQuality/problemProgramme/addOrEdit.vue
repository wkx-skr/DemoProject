<template>
  <div class="addOrEdit-content">
    <datablau-form-submit>
      <div style="margin-top: 64px; margin-left: 20px; margin-right: 20px">
        <div class="db-fieldMessage-title">
          <p class="message-title">
            {{ $t('quality.page.problemProgramme.detail.baseInfo') }}
          </p>
        </div>

        <datablau-form
          style="margin: 10px 0"
          ref="form"
          :model="form"
          :label-width="$i18n.locale === 'en' ? '228px' : '180px'"
          :rules="rules"
          :disabled="type === 'scan'"
        >
          <el-form-item
            :label="$t('quality.page.problemProgramme.detail.scheme')"
            prop="name"
          >
            <datablau-input
              v-model="form.name"
              class="maxlengthInput"
              ref="name"
              maxlength="40"
              style="width: 500px"
              show-word-limit
              :placeholder="
                $t('quality.page.problemProgramme.detail.schemePlaceholder')
              "
            ></datablau-input>
          </el-form-item>
          <el-form-item
            :label="$t('quality.page.problemProgramme.detail.description')"
            prop="description"
          >
            <el-input
              v-model="form.description"
              type="textarea"
              style="width: 500px"
              maxlength="500"
              rows="5"
              show-word-limit
              :placeholder="
                $t(
                  'quality.page.problemProgramme.detail.descriptionPlaceholder'
                )
              "
            ></el-input>
          </el-form-item>
        </datablau-form>
        <div class="db-fieldMessage-title">
          <p class="message-title">
            {{ $t('quality.page.problemProgramme.detail.distributionBasis') }}
          </p>
        </div>
        <el-form
          style="margin-left: 126px; margin-top: 10px"
          :model="form"
          ref="dispatchData"
          :disabled="type === 'scan'"
        >
          <el-form-item
            v-for="(item, index) in form.dispatchData"
            :key="index"
            :label="''"
            :prop="'dispatchData.' + index + '.data'"
            :rules="[
              {
                required: true,
                message: $t(
                  'quality.page.problemProgramme.detail.cannotBeEmpty'
                ),
                trigger: 'blur',
              },
              {
                max: 255,
                message: $t(
                  'quality.page.problemProgramme.detail.字符长度255以下'
                ),
                trigger: 'blur',
              },
            ]"
          >
            <div class="auth-ul">
              <div class="auth-li">
                <span>
                  {{
                    $t('quality.page.problemProgramme.detail.distributionBasis')
                  }}
                </span>
                <span v-if="type === 'scan'">：</span>
                <datablau-input
                  v-if="type !== 'scan'"
                  v-model="item.data"
                  show-word-limit
                  placeholder=""
                  style="width: 250px"
                ></datablau-input>
                <datablau-tooltip
                  v-if="type === 'scan'"
                  :content="item.data"
                  placement="bottom-start"
                  effect="dark"
                >
                  <span
                    style="
                      width: 250px;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                      vertical-align: bottom;
                    "
                  >
                    {{ item.data }}
                  </span>
                </datablau-tooltip>
              </div>
              <div class="auth-li">
                <span>
                  {{ $t('quality.page.problemProgramme.detail.assignUsers') }}
                </span>
                <span v-if="type === 'scan'">：</span>
                <datablau-input
                  v-if="type !== 'scan'"
                  @focus="selectSubmitter2(index)"
                  v-model="item.owner"
                ></datablau-input>
                <span
                  v-if="type === 'scan'"
                  style="
                    width: 260px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    vertical-align: bottom;
                  "
                >
                  {{ item.owner }}
                </span>
              </div>
              <datablau-button
                type="icon"
                v-if="index !== 0 && type !== 'scan'"
                @click="deleteClick(index)"
              >
                <i class="iconfont icon-delete"></i>
              </datablau-button>
              <datablau-button
                type="icon"
                v-if="type !== 'scan'"
                @click="addClick(index)"
              >
                <i class="iconfont icon-tianjia"></i>
              </datablau-button>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <div class="footer-button" slot="buttons">
        <datablau-button
          type="important"
          @click="commitForm('form')"
          v-if="type !== 'scan'"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
        <datablau-button type="secondary" @click="cancel">
          {{ $t('common.button.cancel') }}
        </datablau-button>
      </div>
    </datablau-form-submit>
  </div>
</template>

<script>
import addOrEdit from './addOrEdit.js'
export default addOrEdit
</script>

<style lang="scss">
.addOrEdit-content {
  .el-form-item {
    margin-bottom: 16px;
  }
}

.auth-ul {
  .auth-li {
    display: inline-block;
    margin-right: 20px;
    span {
      display: inline-block;
      padding-right: 6px;
    }
  }
}
</style>
