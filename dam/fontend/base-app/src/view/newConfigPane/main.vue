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
    <el-card class="box-card" v-loading="isLoading">
      <div slot="header" class="clearfix">
        <!-- <span>控制面板</span> -->
        <datablau-button
          @click="showDescription = !showDescription"
          size="mini"
          style="margin-left: 2em; padding: 3px 0"
          type="text"
        >
          <span v-if="!showDescription">
            {{ $t('system.configPane.show') }}
          </span>
          <span v-else>{{ $t('system.configPane.hide') }}</span>
          {{ $t('system.configPane.description') }}
        </datablau-button>
        <!--<el-button
          @click="save"
          size="mini"
          type="text"
          style="margin-left:2em;"
        >保存</el-button>-->
      </div>
      <div class="text" v-if="configs">
        <datablau-form class="margin-thin" label-width="4em" size="small">
          <div
            v-for="(config, key) in configs"
            class="new-config-pane-content"
            :key="key"
          >
            <el-collapse
              v-model="showArr"
              @change="changeCollapse"
              style="border-top: none; margin: 0"
              class="new-config-pane-content"
            >
              <el-collapse-item :name="key">
                <template slot="title">
                  <div class="collapse-title">
                    <h4>{{ key }}</h4>
                  </div>
                </template>
                <div
                  v-for="item in config"
                  :key="item.propertyName + '_' + item.featureCode"
                  class="new-config-pane-item"
                >
                  <el-form-item label="">
                    <span style="margin-left: -3em">
                      {{ item.propertyName }}=
                    </span>
                    <datablau-input
                      v-model="item.propertyValue"
                      style="width: 20em; display: inline-block"
                      @change="handleSave(item, 'value')"
                    ></datablau-input>
                  </el-form-item>
                  <el-form-item
                    label=""
                    v-show="showDescription"
                    style="color: #999"
                  >
                    <div class="form-miaoshu">
                      <span>{{ $t('system.configPane.desc') }}：</span>
                      <div style="color: #999; white-space: normal">
                        <!-- item.propertyDescription -->
                        {{
                          $i18n.locale === 'zh'
                            ? item.propertyCnDescription
                            : item.propertyEnDescription
                        }}
                      </div>
                    </div>
                  </el-form-item>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </datablau-form>
      </div>
      <div
        v-if="!isLoading && configs && Object.keys(configs).length === 0"
        class="empty"
      >
        <datablau-icon :data-type="'no-result'" :size="160"></datablau-icon>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showDescription: true,
      configs: null,
      isLoading: true,
      showArr: [],
    }
  },
  mounted() {
    console.debug('ignore works!')
    this.getData()
  },
  methods: {
    getData() {
      this.isLoading = true
      this.$http
        .get(this.$url + '/configs/')
        .then(res => {
          let resData = res.data || []
          let newArr = resData.reduce((groups, item) => {
            const groupName = item.featureName
            if (!groups[groupName]) {
              groups[groupName] = []
            }
            groups[groupName].push(item)
            return groups
          }, {})
          this.configs = newArr
          this.showArr = Object.keys(newArr)
          this.isLoading = false
          // this.configs = res.data.concat(
          //   JSON.parse(window.localStorage.getItem('configurable.data.access'))
          // )
        })
        .catch(e => {
          this.$showFailure(e)
          this.isLoading = false
        })
    },
    save() {},
    handleSave(arg, type) {
      if (arg.propertyName.startsWith('configurable.data.access.')) {
        const parsed = JSON.parse(
          window.localStorage.getItem('configurable.data.access')
        )
        parsed.forEach((item, index, array) => {
          if (arg.propertyName === item.propertyName) {
            array[index].propertyValue = arg.propertyValue
            array[index].propertyDescription = arg.propertyDescription
          }
        })
        const configurableDataAccess = parsed
        this.$messageTypeMap[1000] = configurableDataAccess[0].propertyValue
        this.$messageTypeMap[1001] = configurableDataAccess[1].propertyValue
        this.$messageTypeMap[1002] = configurableDataAccess[2].propertyValue
        this.$messageTypeMap[1003] = configurableDataAccess[3].propertyValue
        this.$messageTypeMap[9999] = configurableDataAccess[4].propertyValue
        this.$messageTypeMap[1500] = configurableDataAccess[5].propertyValue
        window.localStorage.setItem(
          'configurable.data.access',
          JSON.stringify(parsed)
        )
      } else {
        this.$http
          .put(this.$url + '/configs/', arg)
          .then(res => {
            this.$message.success(
              this.$t('system.configPane.modifyMsg', {
                name: arg.propertyName,
                val:
                  type === 'value'
                    ? this.$t('system.configPane.value')
                    : this.$t('system.configPane.description'),
                valNew:
                  type === 'value'
                    ? arg.propertyValue
                    : arg.propertyDescription,
              })
            )
            this.$getAbout()
          })
          .catch(e => {
            this.$showFailure(e)
            this.getData()
          })
      }
    },
    changeCollapse() {},
  },
  watch: {},
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
    min-height: calc(100vh - 400px);
  }
  .empty {
    text-align: center;
    padding-top: 100px;
  }
}

.new-config-pane-content {
  .collapse-title {
    padding-left: 10px;
    h4 {
      position: relative;
      display: inline-block;
      font-size: 14px;
      font-weight: bold;
      &::after {
        content: '';
        display: block;
        position: absolute;
        left: -10px;
        top: 50%;
        transform: translateY(-50%);
        height: 14px;
        width: 4px;
        background: #409eff;
      }
    }
  }
  .new-config-pane-item {
    border-bottom: 1px dashed #ccc;
    padding-top: 10px;
  }
  /deep/ .el-collapse-item:last-child {
    margin-bottom: 0 !important;
  }
}
</style>
<style lang="scss">
.margin-thin {
  .el-form-item--mini.el-form-item,
  .el-form-item--small.el-form-item {
    margin-bottom: 10px;
    .form-miaoshu {
      display: flex;
      margin-left: -3em;
    }
  }
}
</style>
