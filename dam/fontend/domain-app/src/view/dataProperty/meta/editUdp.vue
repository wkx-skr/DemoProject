<template>
  <div>
    <!-- <div class="top-border"></div> -->
    <el-form
      size="mini"
      :model="body"
      :label-width="$i18n.locale === 'zh' ? '6em' : '10em'"
      :rules="editRules"
    >
      <el-form-item :label="$t('meta.DS.udp.udpName')" prop="name">
        <datablau-input
          test-name="metadata_udp_add_name"
          class="formItem"
          v-model="body.name"
          maxlength="100"
        ></datablau-input>
      </el-form-item>
      <el-form-item :label="$t('meta.DS.udp.udpGroup')" prop="udpGroup">
        <!-- <datablau-select-weak
          :optionsData="optionsData"
          v-model="body.catalog"
          placeholder="请选择"
          clearable
          filterable
          @blur="selectBlur"
          @clear="selectClear"
          @change="selectChange"
        ></datablau-select-weak> -->
        <datablau-select
          test-name="metadata_udp_add_catalog"
          class="formItem"
          v-model="body.catalog"
          :placeholder="$t('meta.common.pleaseSelect')"
          clearable
          filterable
          @blur="selectBlur"
          @clear="selectClear"
          @change="selectChange"
        >
          <el-option
            v-for="item in udpGroupOptions"
            :key="item.id"
            :value="item.value"
            :label="item.label"
          ></el-option>
        </datablau-select>
      </el-form-item>
      <el-form-item :label="$t('meta.DS.udp.udpType')" prop="type">
        <datablau-select
          v-model="body.type"
          class="formItem"
          test-name="metadata_udp_add_type"
        >
          <el-option
            value="STRING"
            :label="$t('meta.DS.udp.valueType.string')"
          ></el-option>
          <el-option
            value="NUM"
            :label="$t('meta.DS.udp.valueType.num')"
          ></el-option>
          <el-option
            value="NUM_RANGE"
            :label="$t('meta.DS.udp.valueType.numRange')"
          ></el-option>
          <el-option
            value="BOOL"
            :label="$t('meta.DS.udp.valueType.boolean')"
          ></el-option>
          <el-option
            value="ENUM"
            :label="$t('meta.DS.udp.valueType.enum')"
          ></el-option>
        </datablau-select>
      </el-form-item>
      <el-form-item
        :label="$t('meta.DS.udp.enumOption')"
        v-show="body.type === 'ENUM'"
      >
        <datablau-input
          class="formItem"
          type="textarea"
          :row="4"
          v-model="body.typeData"
          :placeholder="$t('meta.DS.udp.enumPlaceholder')"
        ></datablau-input>
      </el-form-item>
      <el-form-item :label="$t('meta.DS.udp.desc')">
        <datablau-input
          type="textarea"
          class="max-textarea formItem"
          maxlength="200"
          :minRow="3"
          :maxRows="5"
          style="max-height: 100px"
          v-model="body.desc"
          show-word-limit
        ></datablau-input>
      </el-form-item>
    </el-form>
    <div
      class="dialog-bottom"
      style="margin-top: 20px; overflow: auto; text-align: right"
    >
      <datablau-button class="white-btn" type="secondary" @click="close">
        {{ $t('common.button.cancel') }}
      </datablau-button>
      <datablau-button
        test-name="metadata_udp_add_confirm_btn"
        type="important"
        @click="beforeSave"
        :disabled="disabledSave"
      >
        {{ $t('common.button.ok') }}
      </datablau-button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['typeId', 'currentRow', 'maxOrder', 'dupUdpNamMap'],
  data() {
    const nameValidate = (rule, value, callback) => {
      value = _.trim(value)
      if (!value) {
        callback(new Error(this.$t('meta.DS.udp.validate.nameRequired')))
      } else if (this.dupUdpNamMap[value] && this.oldName !== value) {
        callback(
          new Error(
            this.$t('meta.DS.udp.validate.nameDuplicateTips', { name: value })
          )
        )
      } else {
        callback()
      }
    }
    return {
      body: {
        name: '',
        order: this.maxOrder + 1,
        desc: '',
        type: 'STRING', // STRING, NUM, NUM_RANGE, ENUM, BOOL
        typeData: '',
        catalog: '',
      },
      oldName: '',
      editRules: {
        name: {
          validator: nameValidate,
          required: true,
          trigger: 'blur',
        },
        udpGroup: [
          {
            required: true,
            message: this.$t('meta.DS.udp.validate.selectRequired'),
            trigger: 'blur',
          },
        ],
        type: [
          {
            required: true,
            message: this.$t('meta.DS.udp.validate.selectRequired'),
            trigger: 'blur',
          },
        ],
      },
      udpGroupOptions: [],
      addUdpGroup: '',
      optionsData: {},
    }
  },
  mounted() {
    if (this.currentRow) {
      this.oldName = this.currentRow.name
      if (this.currentRow.typeData) {
        this.currentRow.typeData = this.currentRow.typeData.replace(/\n/g, ';')
      }
      this.body = this.currentRow
    }
    this.getUdpList()
  },
  computed: {
    disabledSave() {
      const name = _.trim(this.body.name)
      const catalog = _.trim(this.body.catalog)
      const type = _.trim(this.body.type)
      return (
        !name ||
        (!!this.dupUdpNamMap[name] && this.oldName !== name) ||
        !catalog ||
        !type
      )
    },
  },
  methods: {
    selectBlur(e) {
      // 意见类型
      if (e.target.value !== '') {
        this.body.catalog = e.target.value
        this.$forceUpdate() // 强制更新
      }
    },
    selectClear() {
      this.body.catalog = ''
      this.$forceUpdate()
    },
    selectChange(val) {
      this.body.catalog = val
      this.$forceUpdate()
    },
    getUdpList() {
      this.$http
        .get(this.$url + '/service/entities/udp/select')
        .then(res => {
          res.data.forEach(element => {
            this.udpGroupOptions.push({
              value: element,
              label: element,
            })
          })
          this.optionsData.data = this.udpGroupOptions
          this.optionsData.value = 'value'
          this.optionsData.key = 'value'
          this.optionsData.label = 'label'
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    beforeSave() {
      if (!this.body.name) {
        this.$message.error(this.$t('meta.DS.message.nameRequired'))
        return
      }
      if (this.body.name.length > 127) {
        this.$message.error(this.$t('meta.DS.message.nameLenTooLong'))
        return
      }
      this.createOrUpdateUdp()
    },
    createOrUpdateUdp() {
      const requestBody = _.cloneDeep(this.body)
      if (requestBody.type !== 'ENUM') {
        delete requestBody.typeData
      } else {
        /* requestBody.typeData = requestBody.typeData.replace(/;/g, '\n')
        requestBody.typeData = requestBody.typeData.replace(/；/g, '\n') */
        requestBody.typeData = requestBody.typeData.replace(/；/g, ';')
      }
      this.$http
        .post(this.$url + `/service/entities/udps/${this.typeId}`, requestBody)
        .then(res => {
          this.$emit('refresh')
          this.$emit('close')
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    close() {
      this.$emit('close')
      this.$emit('refresh')
    },
  },
}
</script>

<style lang="scss" scoped>
$border-color: #dddddd;
.top-border {
  width: 800px;
  height: 1px;
  background-color: $border-color;
  // margin-left: -20px;
  // margin-right: 20px;
  margin: -10px -4px 10px -20px;
  overflow: hidden;
}
/deep/ .el-form-item {
  margin-bottom: 14px;
  .formItem {
    width: 100%;
  }
}
/deep/ .el-form-item__label {
  line-height: 34px;
  height: 34px;
}
</style>
