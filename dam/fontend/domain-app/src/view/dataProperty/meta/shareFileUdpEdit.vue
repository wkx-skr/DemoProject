<template>
  <div class="share-file-udp">
    <ul class="column-properties" v-if="udps.length > 0">
      <li v-for="(u, i) in udps" :key="u.name">
        <span class="label">{{ u.name }}</span>
        <span
          class="value"
          style="vertical-align: top; width: 520px; word-break: break-all"
        >
          <span v-show="!u.editMode">
            {{ u.value }}
          </span>
          <datablau-button
            class="edit-btn"
            v-if="!u.editMode && couldEdit && !Boolean($route.query.isAssets)"
            type="text"
            @click="startEdit(u, i)"
          >
            <i
              style="font-size: 12px; margin-left: 1.3em"
              class="icon-edit"
            ></i>
          </datablau-button>
          <datablau-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            maxlength="200"
            show-word-limit
            v-if="u.editMode === 'STRING' || u.editMode === 'NUM_RANGE'"
            v-model="value"
          ></datablau-input>
          <datablau-input
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            maxlength="200"
            show-word-limit
            v-else-if="u.editMode === 'NUM'"
            v-model.number="value"
          ></datablau-input>
          <datablau-select
            v-else-if="u.editMode === 'BOOL'"
            style="display: inline-block; width: 12em"
            v-model="value"
            clearable
          >
            <el-option value="true" label="true"></el-option>
            <el-option value="false" label="false"></el-option>
          </datablau-select>
          <datablau-select
            style="display: inline-block; width: 12em"
            v-else-if="u.editMode === 'ENUM'"
            v-model="value"
            clearable
          >
            <el-option
              v-for="o in options"
              :value="o"
              :label="o"
              :key="o"
            ></el-option>
          </datablau-select>
          <datablau-button v-show="u.editMode" type="text" @click="save(u, i)">
            {{ $t('common.button.save') }}
          </datablau-button>
          <datablau-button
            v-show="u.editMode"
            type="text"
            @click="cancel(u, i)"
          >
            {{ $t('common.button.cancel') }}
          </datablau-button>
        </span>
      </li>
    </ul>
    <div class="no-data-show" v-else>
      {{ $t('meta.DS.tableDetail.noData') }}
    </div>
  </div>
</template>
<script>
import axios from 'axios'
export default {
  props: ['summary', 'couldEdit'],
  mounted() {
    this.getUdps()
    this.$bus.$on('updateShareFileUdp', this.getUdps)
  },
  beforeDestroy() {
    this.$bus.$off('updateShareFileUdp')
  },
  data() {
    return {
      udps: [],
      value: '',
      fullValue: null,
      options: [],
    }
  },
  methods: {
    getUdps() {
      // let udpValueMap = {
      //   label: '',
      //   udpId: '',
      //   type: '',
      //   typeData: '',
      //   order: '',
      //   value: '',
      //   shareFileId: '',
      // }
      const udpValueMap = {}
      const id = this.summary.id
      const url = `${this.$url}/service/shareFileUdpVal/${id}`
      const udpsKeys = this.$shareFileUdpData.data
      const udps = []
      udpsKeys.forEach(item => {
        const obj = {
          name: item.name,
          udpId: item.propertyId,
          type: item.type,
          typeData: item.typeData,
          order: item.order,

          shareFileId: this.summary.id,
          value: '',

          editMode: false,
        }
        udpValueMap[item.propertyId] = obj
        udps.push(obj)
      })
      this.$http
        .get(url)
        .then(res => {
          const data = res.data
          if (data && Array.isArray(data)) {
            data.forEach(item => {
              const propertyId = item.propertyValue.udpId
              const fullValue = item.propertyValue
              let obj = null
              if (udpValueMap[propertyId]) {
                obj = udpValueMap[propertyId]
                obj.fullValue = fullValue
                obj.value = fullValue.value == 'null' ? '' : fullValue.value
                obj.shareFileId = fullValue.shareFileId || obj.shareFileId
                obj.id = fullValue.id || ''
              }
            })
          }

          this.$utils.sort.sort(udps, 'order')
          this.udps = udps
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    addPropertyValue(u, i) {
      const url = `${this.$url}/service/shareFileUdpVal/`
      const body = {
        shareFileId: u.shareFileId,
        udpId: u.udpId,
        value: this.value,
      }
      this.$http
        .put(url, body)
        .then(res => {
          this.udps[i].editMode = false
          u.value = this.value
          this.getUdps()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updatePropertyValue(u, i) {
      const url = `${this.$url}/service/shareFileUdpVal/`
      const body = {
        id: u.id,
        shareFileId: u.shareFileId,
        udpId: u.udpId,
        value: this.value,
      }
      this.$http
        .post(url, body)
        .then(res => {
          this.udps[i].editMode = false
          u.value = this.value
          this.getUdps()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    save(u, i) {
      const value = _.trim(this.value)
      if (u.type === 'NUM' && isNaN(value - 0)) {
        this.$message.info(this.$t('meta.DS.message.fillNum'))
        return
      }
      if (u.fullValue && u.fullValue.id) {
        this.updatePropertyValue(u, i)
      } else {
        this.addPropertyValue(u, i)
      }
    },
    startEdit(u, i) {
      this.udps.forEach(item => {
        item.editMode = false
      })
      this.value = u.value
      if (u.type === 'ENUM') {
        this.options = u.typeData.split('\n')
      }
      u.editMode = u.type
    },
    cancel(u, i) {
      u.editMode = false
    },
  },
  computed: {},
  watch: {},
}
</script>
<style scoped lang="scss">
.share-file-udp {
  padding: 10px 0 0 10px;
}
.column-properties {
  li {
    line-height: 34px;
    &:after {
      content: '';
      clear: both;
      display: block;
    }
    .edit-btn {
      display: none;
    }
    &:hover {
      .edit-btn {
        display: inline-block;
      }
    }
    .label {
      line-height: 1.5em;
      min-height: 1.5em;
      width: 180px;
      padding-right: 12px;
      text-align: right;
      display: inline-block;
      word-break: break-word;
    }
    .value {
      display: inline-block;
      word-break: normal;
      max-width: 520px;
    }
  }
}
</style>
