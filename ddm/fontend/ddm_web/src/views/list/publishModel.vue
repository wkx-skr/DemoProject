<template>
  <div>
    <datablau-dialog
    v-loading="verLoading"
    :visible.sync="verDialogVisible"
    title="版本比较"
    append-to-body
    height="500"
    size="xl"
    :before-close="handleExit"
  >
    <div class="ver-content">
      <div class="top">
        <datablau-select
        v-model="versionId"
        filterable
        style="width: 300px"
        @change="compareVersion"
        placeholder="请选择版本进行对比"
      >
        <el-option
          v-for="item in verList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
          :disabled="!item.display"
        ></el-option>
      </datablau-select>
      </div>
      <div class="inner-box" v-if="showCompare">
        <div class="left">
          <div class="title-box">
            模型
          </div>
          <div class="row" :class='{active:modelInfo.name !== webInfo.name}'>
            名称：{{modelInfo.name}}
          </div>
          <div class="row" :class='{active:modelInfo.purpose !== webInfo.purpose}'>
            目的：{{modelInfo.purpose}}
          </div>
          <div class="row" :class='{active:modelInfo.scope !== webInfo.scope}'>
            范围：{{modelInfo.scope}}
          </div>
          <div class="row" :class='{active:modelInfo.definition !== webInfo.definition}'>
            定义：{{modelInfo.definition}}
          </div>
          <div class="row" :class='{active:modelInfo.include !== webInfo.include}'>
            包括：{{modelInfo.include}}
          </div>
          <div class="row" :class='{active:modelInfo.exclude !== webInfo.exclude}'>
            不包括：{{modelInfo.exclude}}
          </div>
        </div>
        <div class="right">
          <div class="title-box">
            {{currentType === "object" ? '对象' : '领域'}}
          </div>
          <div class="row" :class='{active:modelInfo.name !== webInfo.name}'>
            名称：{{webInfo.name}}
          </div>
          <div class="row" :class='{active:modelInfo.purpose !== webInfo.purpose}'>
            目的：{{webInfo.purpose}}
          </div>
          <div class="row" :class='{active:modelInfo.scope !== webInfo.scope}'>
            范围：{{webInfo.scope}}
          </div>
          <div class="row" :class='{active:modelInfo.definition !== webInfo.definition}'>
            定义：{{webInfo.definition}}
          </div>
          <div class="row" :class='{active:modelInfo.include !== webInfo.include}'>
            包括：{{webInfo.include}}
          </div>
          <div class="row" :class='{active:modelInfo.exclude !== webInfo.exclude}'>
            不包括：{{webInfo.exclude}}
          </div>
        </div>
      </div>
      <datablau-table :data="testArr" >
        <el-table-column
          prop="archyObjectName"
          label="对象名称"
          >
        </el-table-column>
        <el-table-column
          prop="same"
          label="一致性"
          >
          <template slot-scope="scope">
            <span>{{scope.row.same ? '一致' : '不一致'}}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          header-align="left"
          align="left"
          width="220"
          >
          <template slot-scope="scope">
             <datablau-button
               type="text"
               @click="handleCheck(scope.row)"
               :disabled="scope.row.same"
               :tooltip-content="'查看'"
               class="iconfont icon-see"
             >
             </datablau-button>
          </template>
        </el-table-column>
      </datablau-table>

    </div>
      <span slot="footer">
      <datablau-button @click="handleExit" v-show="showCompare">取 消</datablau-button>
      <datablau-button type="primary" @click="releaseModel" :disabled="isDisable" v-show="showCompare">
        申请审批
      </datablau-button>
    </span>
    </datablau-dialog>

    <datablau-dialog
      :visible.sync="tableTreeVisible"
      title="对比数据"
      width="1000px"
      height='600px'
      append-to-body
    >
      <datablau-table :data="tableTree" row-key="id" v-if="tableTreeVisible">
        <el-table-column
          prop="type"
        >
          <template slot-scope="scope">
            <i class="table-icon" v-show="scope.row.type === '表'"></i>
            <i class="col-icon" v-show="scope.row.type === '字段'"></i>
            <span>{{ scope.row.type }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="left"
          label="当前值"
        >
        </el-table-column>
        <el-table-column
          prop="right"
          label="引用值"
        >
        </el-table-column>
      </datablau-table>

      <span slot="footer">
      <datablau-button @click="tableTreeVisible = false">取 消</datablau-button>
      <datablau-button type="primary" @click="tableTreeVisible = false">
        确 定
      </datablau-button>
    </span>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '@/resource/http'

export default {
  name: 'publishModel',
  data () {
    return {
      verDialogVisible: false,
      verLoading: false,
      versionId: null,
      verList: [],
      showCompare: false,
      webInfo: {},
      modelInfo: {},
      tableTreeVisible: false,
      testArr: [],
      isDisable: false,
      tableTree: []
    }
  },
  props: {
    currentType: {
      required: true
    },
    currentModel: {
      required: true
    }
  },
  components: {
  },
  computed: {
  },
  mounted () {
    // this.dataInit()
  },
  methods: {
    dataInit () {
      // console.log('dataInit')
      this.verDialogVisible = true
      this.testArr = []
      this.getCurrentVers()
    },
    getCurrentVers () {
      let url = null
      if (this.currentType === 'domain') {
        url = `${this.$url}/service/archy/domain/domain/release/versions/${this.currentModel.id}/${this.currentModel.modelType}`
      } else {
        url = `${this.$archyUrl}object/object/release/versions/${this.currentModel.id}`
      }
      this.$http.get(url)
        .then(res => {
          let arr = res.data.filter(v => v.name !== 'Latest Version')
          this.verList = arr.map(v => {
            v.release ? v.name += '  (已发布)' : v.name += '  (未发布)'
            return v
          })
        })
    },
    releaseModel () {
      this.verLoading = true
      let request = null
      if (this.currentType === 'object') {
        request = HTTP.releaseBusinessObject
      } else {
        request = HTTP.releaseBusinessArea
      }
      request({ modelId: this.currentModel.id, versionId: this.versionId })
        .then(res => {
          this.verLoading = false
          this.$blauShowSuccess('发布成功')
          this.handleExit()
        })
        .catch(err => {
          this.verLoading = false
          this.$showFailure(err)
        })
    },
    compareVersion () {
      this.verLoading = true
      let request = null
      if (this.currentType === 'object') {
        request = HTTP.compareBusinessObject
      } else {
        request = HTTP.compareBusinessArea
      }
      request({ modelId: this.currentModel.id, versionId: this.versionId })
        .then(res => {
          this.verLoading = false
          this.webInfo = res.web
          this.modelInfo = res.model
          this.testArr = res.objectList
          for (let key in this.webInfo) {
            if (this.modelInfo[key] === undefined) {
              this.modelInfo[key] = ''
            }
          }
          this.showCompare = true
          this.$nextTick(() => {
            this.handleDisable()
          })
        })
        .catch(err => {
          this.isDisable = true
          this.showCompare = false
          this.versionId = ''
          this.webInfo = {}
          this.modelInfo = {}
          this.verLoading = false
          this.$showFailure(err)
        })
    },
    handleExit (done) {
      this.verDialogVisible = false
      this.showCompare = false
      this.versionId = ''
      this.webInfo = {}
      this.modelInfo = {}
      if (done instanceof Function) {
        done()
      }
    },
    handleDisable () {
      let rows = document.querySelectorAll('.ver-content .row.active')
      this.isDisable = rows.length > 0
    },
    handleCheck (row) {
      this.getTableTreeData(row.subEntities)
    },
    getTableTreeData (tables) {
      let data = []
      let id = 1
      tables.forEach(table => {
        if (!table.same) {
          let currentTable = {
            id: id++,
            type: '表',
            left: table.self.name,
            right: table.reference ? table.reference.name : '',
            children: []
          }
          // console.log(_.cloneDeep(table.self.columns), _.cloneDeep(table.reference.columns), 11)
          // 遍历表的字段
          for (let i = 0, len = Math.max(table.self?.columns?.length || 0, table.reference?.columns?.length || 0); i < len; i++) {
            let left = table.self?.columns[i] || {}
            let right = table.reference?.columns[i] || {}
            let colData = {
              id: id++,
              type: '字段',
              left: left.name || '',
              right: right.name || '',
              children: []
            }

            let props = Object.keys(left).concat(Object.keys(right))
            // 去重
            props = Array.from(new Set(props))
            props.forEach(prop => {
              if (prop !== 'name' && (left[prop] !== undefined || right[prop] !== undefined)) {
                colData.children.push({
                  id: id++,
                  type: prop,
                  left: left[prop] || '',
                  right: right[prop] || ''
                })
              }
            })
            currentTable.children.push(colData)
          }
          data.push(currentTable)
        }
      })
      this.tableTree = data
      this.tableTreeVisible = true
    }
  },
  watch: {
  }
}
</script>

<style lang="scss" scoped>
.inner-box {
  padding-top: 20px;
  height: 240px;
  .left {
    width: 440px;
    margin-right: 20px;
    float: left;
    .title-box {
      background: rgb(245, 245, 245);
    }
    .active {
      background-color: rgb(254, 240, 240);
    }
  }
  .right {
    width: 440px;
    float: left;
    .title-box {
      color: rgb(102, 191, 22);
      background: rgba(102, 191, 22, 0.1);
    }
    .active {
      background-color: rgba(102, 191, 22, 0.1);
    }
  }
  .left div,.right div {
    margin-bottom: 10px;
    padding-left: 20px;
    //height: 34px;
    line-height: 34px;
  }
}
</style>
