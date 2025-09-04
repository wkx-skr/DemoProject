<template>
  <div>
    <ul class="column-properties">
      <li v-for="(u, i) in udps">
        <span class="label">{{ u.name }}:</span>
        <span class="value">
          <span v-show="!u.editMode">{{ u.value }}</span>
          <el-button
            class="edit-btn"
            v-if="!u.editMode && stas !== 'false' && $auth['METADATA_EDIT']"
            type="text"
            size="mini"
            @click="startEdit(u, i)"
          >
            <i
              style="font-size: 12px; margin-left: 1.3em"
              class="icon-edit"
            ></i>
          </el-button>
          <el-input
            v-if="u.editMode === 'STRING' || u.editMode === 'NUM_RANGE'"
            size="mini"
            style="width: 12em"
            v-model="value"
          ></el-input>
          <el-input
            v-else-if="u.editMode === 'NUM'"
            size="mini"
            style="width: 12em"
            v-model.number="value"
          ></el-input>
          <el-select
            v-else-if="u.editMode === 'BOOL'"
            size="mini"
            style="width: 12em"
            v-model="value"
          >
            <el-option value="true" label="true"></el-option>
            <el-option value="false" label="false"></el-option>
          </el-select>
          <el-select
            v-else-if="u.editMode === 'ENUM'"
            size="mini"
            style="width: 12em"
            v-model="value"
          >
            <el-option
              v-for="o in options"
              :value="o"
              :label="o"
              :key="o"
            ></el-option>
          </el-select>
          <el-button
            v-show="u.editMode"
            type="text"
            size="mini"
            @click="save(u, i)"
          >
            {{ $t('common.button.save') }}
          </el-button>
          <el-button
            v-show="u.editMode"
            type="text"
            size="mini"
            @click="cancel(u, i)"
          >
            {{ $t('common.button.cancel') }}
          </el-button>
        </span>
      </li>
    </ul>
  </div>
</template>
<script>
import axios from 'axios'
export default {
  props: ['summary'],
  mounted() {
    this.getUdps()
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
      const typeId = this.summary.properties.TypeId
      const udpValueMap = new Map()
      this.summary.udps.forEach(item => {
        udpValueMap.set(item.id, item)
      })
      this.$http
        .get(this.$url + `/service/entities/udps/${typeId}`)
        .then(res => {
          res.data.forEach(item => {
            if (udpValueMap.has(item.id)) {
              item.fullValue = udpValueMap.get(item.id)
              item.value = item.fullValue.value
            } else {
              item.value = ''
              item.fullValue = null
            }
            item.editMode = false
          })
          this.$utils.sort.sort(res.data, 'order')
          this.udps = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    addPropertyValue(u, i) {
      const propId = u.id
      const requestBody = this.value
      this.$plainRequest
        .post(
          this.$url +
            `/service/entities/${this.summary.objectId}/udps/${propId}?modelId=${this.summary.modelId}`,
          requestBody
        )
        .then(res => {
          this.udps[i].editMode = false
          u.value = this.value
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    updatePropertyValue(u, i) {
      const requestBody = this.value
      const valueId = u.fullValue.valId
      this.$plainRequest
        .put(
          this.$url +
            `/service/entities/${this.summary.objectId}/udps/values/${valueId}`,
          requestBody
        )
        .then(res => {
          this.udps[i].editMode = false
          u.value = this.value
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    save(u, i) {
      const value = _.trim(this.value)
      if (u.type === 'NUM' && isNaN(value - 0)) {
        this.$message.info('请输入数值')
        return
      }
      if (u.fullValue && u.fullValue.valId) {
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
  computed: {
    stas() {
      return this.$route.path.includes('embeddedModule') ? 'false' : ''
    },
  },
  watch: {},
}
</script>
<style scoped lang="scss">
.column-properties {
  li {
    line-height: 3em;
    min-height: 3em;
    .edit-btn {
      display: none;
    }
    &:hover {
      .edit-btn {
        display: inline-block;
      }
    }
  }
  .label {
    line-height: 1.5em;
    min-height: 1.5em;
    width: 8.5em;
    margin-right: 1em;
    text-align: right;
    display: inline-block;
  }
  .value {
    display: inline-block;
  }
}
</style>
