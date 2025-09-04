<template>
  <div
    style="
      padding: 0px;
      overflow: auto;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #fff;
    "
  >
    <datablau-page-title>
      {{ $t('system.configPane.title') }}
    </datablau-page-title>
<!--    <div v-if="!damConnectable">
      <tenantLogo ref="tenantLogo"></tenantLogo>
    </div>-->
    <el-card class="box-card" v-loading="isLoading">
      <div slot="header" class="clearfix">
        <!-- <span>控制面板</span> -->
        <datablau-button
          @click="showDescription = !showDescription"
          size="mini"
          style="line-height: 24px;"
          type="text"
        >
          <span v-if="!showDescription">{{ $t('system.configPane.show') }}</span><span
          v-else>{{ $t('system.configPane.hide') }}</span>{{ $t('system.configPane.description') }}
        </datablau-button>
      </div>
      <div class="text" v-if="configs">
        <datablau-form class="margin-thin" label-width="1em" size="small">
          <div
            v-for="config in configs"
            class="item"
            :key="config.propertyName"
          >
            <el-form-item label="">
              <span >{{ config.propertyName }} = </span>
              <datablau-input
                v-model="config.propertyValue"
                style="width: 30em; display: inline-block"
                type="textarea"
                :rows="1"
                :autosize="{min: 1, max: 10}"
                @change="handleSave(config, 'value')"
              ></datablau-input>
            </el-form-item>
            <el-form-item label="" v-show="showDescription" style="color: #999">
              <div class="form-miaoshu">
                <span class="label">{{ $t('system.configPane.desc') }}：</span>
                <div class="content">
                  {{ config.propertyDescription }}
                </div>
              </div>
              <!-- <datablau-input
                type="textarea"
                v-model="config.propertyDescription"
              ></datablau-input> -->
            </el-form-item>
          </div>
        </datablau-form>
      </div>
      <div v-if="!isLoading && configs && configs.length === 0" class="empty">
        <datablau-icon :data-type="'no-result'" :size="160"></datablau-icon>
      </div>
    </el-card>
  </div>
</template>

<script>
// import tenantLogo from './tenantLogo.vue'
import { mapState } from 'vuex'
export default {
  // components: { tenantLogo },
  data () {
    return {
      showDescription: false,
      configs: null,
      isLoading: true
    }
  },
  computed: {
    ...mapState(['damConnectable'])
  },
  mounted () {
    this.getData()
  },
  methods: {
    getData () {
      this.isLoading = true
      this.$http
        .get(this.$url + '/service/configs/')
        .then(res => {
          // 根据产品等级隐藏部分配置
          let configs = res.data
          let removeConfigs = [
          ]
          if (!this.$store.state.featureMap.ddm_WebDDLConfig) {
            removeConfigs.push('configurable.model.ddl.enable', 'configurable.model.store.use.fe.ddl.execute.disable')
          }
          if (!this.$store.state.featureMap.ddm_CustomModelCheckPolicy) {
            removeConfigs.push('configurable.model.rule.enable')
          }
          if (!this.$store.state.featureMap.ddm_CustomStatus) {
            removeConfigs.push('configurable.model.save.phase.check.force')
          }
          removeConfigs = removeConfigs.map(item => { return { propertyName: item } })
          _.pullAllBy(configs, removeConfigs, 'propertyName')
          this.configs = configs
          this.isLoading = false
        })
        .catch(e => {
          this.$showFailure(e)
          this.isLoading = false
        })
    },
    save () {
    },
    handleSave (arg, type) {
      this.$http
        .put(this.$url + '/service/configs/', arg)
        .then(res => {
          this.$message.success(
            this.$t('system.configPane.modifyMsg', {
              name: arg.propertyName,
              val: type === 'value' ? this.$t('system.configPane.value') : this.$t('system.configPane.description'),
              valNew:
                type === 'value'
                  ? arg.propertyValue
                  : arg.propertyDescription
            })
          )
          // this.$refreshConfig()
        })
        .catch(e => {
          this.$showFailure(e)
          this.getData()
        })
    }
  },
  watch: {}
}
</script>

<style scoped lang="scss">
.box-card {
  border-left: none;
  border-top: none !important;
  box-shadow: none !important;

  /deep/ .el-card__header {
    padding: 10px 20px;
  }

  /deep/ .el-card__body {
    padding-top: 0 !important;
    min-height: calc(100vh - 150px);
  }

  .empty {
    text-align: center;
    padding-top: 100px;
  }
}

.item {
  border-bottom: 1px dashed #ccc;
  padding-top: 10px;
}
</style>
<style lang="scss">
.margin-thin {
  .el-form-item--mini.el-form-item,
  .el-form-item--small.el-form-item {
    margin-bottom: 10px;

    .form-miaoshu {
      position: relative;

      .label {
        position: absolute;
        left: 0;
        top: 0;
      }
      .content {
        padding-left: 3em;
      }
    }
  }
}
</style>
