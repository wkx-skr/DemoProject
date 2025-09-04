<template>
  <div class="setting-cont">
    <div class="ul">
      <datablau-detail-subtitle
        class="tile"
        mt="0"
        title="资产目录编号设置"
      ></datablau-detail-subtitle>
      <datablau-form
        :model="formData"
        ref="formData"
        :label-width="'180px'"
        :rules="rules"
      >
        <el-form-item label="自动生成">
          <datablau-switch
            v-model="formData.autoIncState"
            active-text="开启"
            inactive-text="关闭"
            type="innerText"
            @change="handleIncStateChange"
          ></datablau-switch>
          <span
            v-if="!formData.autoIncState"
            style="
              font-size: 12px;
              color: #999;
              display: inline-block;
              height: 26px;
              line-height: 28px;
              margin-left: 8px;
            "
          >
            前往【目录详情】设置
          </span>
        </el-form-item>
        <el-form-item label="固定前缀" prop="prefix">
          <datablau-input
            v-model="formData.prefix"
            :placeholder="$t('common.placeholder.prefix')"
            clearable
            style="width: 500px"
            :disabled="!formData.autoIncState"
            maxlength="30"
          ></datablau-input>
        </el-form-item>
        <div>
          <el-form-item
            label="数据部分位数"
            prop="digitPart"
            style="display: inline-block"
          >
            <datablau-input
              v-model.number="formData.digitPart"
              @input="
                val => {
                  handleEdit(val, 'digitPart')
                }
              "
              placeholder="最大值为9"
              clearable
              style="width: 100px"
              :disabled="!formData.autoIncState"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="起始值"
            prop="startVal"
            style="display: inline-block"
          >
            <datablau-input
              v-model.number="formData.startVal"
              @input="
                val => {
                  handleEdit(val, 'startVal')
                }
              "
              :placeholder="$t('common.placeholder.prefix')"
              clearable
              style="width: 100px"
              :maxlength="formData.digitPart"
              :disabled="!formData.autoIncState"
            ></datablau-input>
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="自增量"
            prop="incStepSize"
            style="display: inline-block"
          >
            <datablau-input
              v-model.number="formData.incStepSize"
              @input="
                val => {
                  handleEdit(val, 'incStepSize')
                }
              "
              placeholder="最大值为9"
              clearable
              style="width: 100px"
              :disabled="!formData.autoIncState"
            ></datablau-input>
          </el-form-item>
        </div>
        <el-form-item label="固定后缀">
          <datablau-input
            v-model="formData.suffix"
            :placeholder="$t('common.placeholder.prefix')"
            clearable
            style="width: 500px"
            :disabled="!formData.autoIncState"
            maxlength="30"
          ></datablau-input>
        </el-form-item>
        <el-form-item label="下次生成编码样例">
          <p>
            {{ getNextCodeExample() }}
          </p>
        </el-form-item>
      </datablau-form>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  name: 'CodeConfig',
  props: {
    initData: {
      type: Object,
      default: () => ({}),
    },
  },
  mounted() {},
  data() {
    return {
      formData: {},
      originData: {},
      rules: {
        prefix: [
          {
            required: true,
            message: this.$t('common.placeholder.prefix'),
            trigger: 'blur',
          },
        ],
        digitPart: [
          {
            required: true,
            message: this.$t('common.placeholder.prefix'),
            trigger: 'blur',
          },
        ],
        startVal: [
          {
            required: true,
            message: this.$t('assets.catalogue.startError'),
            trigger: 'blur',
          },
        ],
        incStepSize: [
          {
            required: true,
            message: this.$t('assets.catalogue.incrementError'),
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    handleIncStateChange() {
      this.rules = {
        prefix: [
          {
            required: this.formData.autoIncState,
            message: this.$t('common.placeholder.prefix'),
            trigger: 'blur',
          },
        ],
        digitPart: [
          {
            required: this.formData.autoIncState,
            message: this.$t('common.placeholder.prefix'),
            trigger: 'blur',
          },
        ],
        startVal: [
          {
            required: this.formData.autoIncState,
            message: this.$t('assets.catalogue.startError'),
            trigger: 'blur',
          },
        ],
        incStepSize: [
          {
            required: this.formData.autoIncState,
            message: this.$t('assets.catalogue.incrementError'),
            trigger: 'blur',
          },
        ],
      }
      this.$nextTick(() => {
        this.$refs.formData.$refs.form.clearValidate()
      })
    },
    fillZero(number, digits) {
      number = String(number)
      let length = number.length
      if (number.length < digits) {
        for (let i = 0; i < digits - length; i++) {
          number = '0' + number
        }
      }
      return number
    },
    handleEdit(e, type) {
      if (type === 'digitPart') {
        let value = e.replace(/^(0+)|[^\d]+/g, '')
        if (parseInt(value) > 9) value = 9
        this.formData.digitPart = value
        this.formData.startVal = 0
        this.formData.nextVal = 0
      } else if (type === 'startVal') {
        let value = e.replace(/[^\d]/g, '')
        value = value.replace(/^0+(\d)/, '$1')
        this.formData.startVal = value
        this.formData.nextVal = value
      } else if (type === 'incStepSize') {
        let value = e.replace(/^(0+)|[^\d]+/g, '')
        if (parseInt(value) > 9) value = 9
        this.formData.incStepSize = value
      }
    },
    getNextCodeExample() {
      if (
        this.formData.prefix ||
        this.formData.digitPart ||
        this.formData.suffix
      ) {
        return (
          (this.formData.prefix ? this.formData.prefix : '') +
          this.fillZero(this.formData.startVal, this.formData.digitPart) +
          (this.formData.suffix ? this.formData.suffix : '')
        )
      } else {
        return ''
      }
    },
  },
  watch: {
    initData: {
      handler() {
        this.originData = _.cloneDeep(this.initData)
        this.formData = _.cloneDeep(this.initData)
        this.rules = {
          digitPart: [
            {
              required: this.formData.autoIncState,
              message: this.$t('common.placeholder.prefix'),
              trigger: 'blur',
            },
          ],
          startVal: [
            {
              required: this.formData.autoIncState,
              message: this.$t('assets.catalogue.startError'),
              trigger: 'blur',
            },
          ],
          incStepSize: [
            {
              required: this.formData.autoIncState,
              message: this.$t('assets.catalogue.incrementError'),
              trigger: 'blur',
            },
          ],
        }
      },
      immediate: true,
      deep: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.setting-cont {
  background: #fff;
  height: 100%;
  padding: 0 20px;

  /deep/.el-tabs__content {
    height: 16px;
    overflow: hidden;
  }
  .title {
    height: 44px;
    line-height: 44px;
    font-weight: 600;
    font-size: 16px;
    color: #555;
  }
  .tile {
    height: 44px;
    line-height: 44px;
  }
}
</style>
<style lang="scss">
.setting-cont-tab {
  .el-tabs__content {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 20px;
    right: 20px;
    margin-top: 34px;
  }
}
</style>
