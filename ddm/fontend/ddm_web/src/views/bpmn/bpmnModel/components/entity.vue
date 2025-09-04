<template>
  <div>
    <div class="boxTop">
      <datablau-input
        v-model="entityQuery"
        :iconfont-state="true"
        placeholder="搜索中文名称、英文名称"
        @input="getEntityPageData"
        clearable
        style="width: 240px"
      ></datablau-input>
      <div class="table-container">
      <datablau-table
        :data="entitiesLoading ? null : entitiesShowData"
        key="entityTable"
        :auto-hide-selection="false"
        ref="entityTable"
        row-key="elementId"
        :data-selectable="true"
        v-loading="entitiesLoading"
        @selection-change="handleSelectionChange"
        height="100%"
      >
        <el-table-column
          prop="alias"
          label="名称"
          min-width="120"
          sortable
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <datablau-list-icon
              iconType="svg"
              :dataType="'table'"
            ></datablau-list-icon>
            <span

              class="list-table-link"
            >
                      {{ scope.row.name }}
                    </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="alias"
          label="中文名"
          sortable
          show-overflow-tooltip
          min-width="120"
        >
        </el-table-column>
        <el-table-column
          prop="modelId"
          label="模型"
          show-overflow-tooltip
          min-width="160"
        >
          <template>
                    <span
                      class="list-table-link"
                    >
                      {{ modelInfo.modelPath }}
                    </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="definition"
          label="业务定义"
          show-overflow-tooltip
          min-width="160"
        >
        </el-table-column>
      </datablau-table>
      </div>
    </div>
    <div slot="footer" class="footer">
      <datablau-pagination
        style="float: left"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="entityPage.current"
        :page-sizes="[20, 50,100]"
        :page-size="entityPage.size"
        layout="total, sizes,  pager,  jumper"
        :total="entityPage.total">
      </datablau-pagination>
      <div style="float: right">
        <datablau-button type="secondary" @click="closeStructure">
          {{ $t('common.button.cancel') }}
        </datablau-button>
        <datablau-button
          type="primary"
          @click="saveStructure"
          :disabled="structureDisabled"
        >
          {{ $t('common.button.ok') }}
        </datablau-button>
      </div>
    </div>
  </div>
</template>

<script>
import HTTP from '@/resource/http'

export default {
  data () {
    return {
      entityQuery: '',
      entitiesLoading: true,
      entitiesShowData: [],
      modelInfo: {},
      entities: [],
      entityPage: {
        current: 1,
        size: 20,
        total: 0
      },
      selection: [],
      structureDisabled: true
    }
  },
  props: {
    id: {
      type: String,
      default: ''
    },
    oldData: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    id () {
      this.getModelInfo()
    },
    oldData (val) {
      /* console.log(val, 'val')
      this.handleSelectionChange(val)
      val.forEach(item => {
        this.$refs.entityTable.toggleRowSelection(item, true)
      }) */
    }
  },
  methods: {
    closeStructure () {
      this.$emit('closeMode', this.selection)
    },
    saveStructure () {
      this.$emit('result', this.selection)
      this.$emit('closeMode', this.selection)
    },
    handleSizeChange (val) {
      this.entityPage.size = val
      this.getEntityPageData()
    },
    handleCurrentChange (val) {
      this.entityPage.current = val
      this.getEntityPageData()
    },
    searchEntityData () {},
    handleSelectionChange (val) {
      this.selection = val
      if (this.selection.length) {
        this.structureDisabled = false
      } else {
        this.structureDisabled = true
      }
    },
    getModelInfo () {
      this.$http.post(`${HTTP.$archyServerUrl}object/object/info/${this.id}?setEntity=true`, { version: true })
        .then(res => {
          this.modelInfo = res.data
          if (res.data.entities) {
            this.entities = res.data.entities || []
          } else {
            this.entities = []
          }

          this.entitiesLoading = false
          this.getEntityPageData()
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getEntityPageData () {
      let lq = this.entityQuery.toLowerCase()
      let tmpData = this.entities.filter(item => (item.alias && item.alias.toLowerCase().indexOf(lq) !== -1) || (item.name && item.name.toLowerCase().indexOf(lq) !== -1))
      this.entityPage.total = tmpData.length
      this.entitiesShowData = tmpData.slice((this.entityPage.current - 1) * this.entityPage.size, this.entityPage.current * this.entityPage.size)
      this.$nextTick(() => {
        this.oldData.forEach(item => {
          let index = this.entities.findIndex(v => v.elementId ===
            item.elementId
          )
          this.$refs.entityTable.toggleRowSelection(this.entities[index])
        })
      })
    }
  },
  mounted () {
    this.getModelInfo()
  }
}
</script>

<style scoped lang='scss'>

  .boxTop{
    border-bottom: 1px solid #ddd;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 37px;
    padding: 20px 20px 0 20px;
    display: flex;
    flex-direction: column;
  }
  .table-container{
    flex: 1;
  }
  .footer{
    position: absolute;
    bottom: -7px;
    left: 20px;
    right: 20px;
  }
</style>
