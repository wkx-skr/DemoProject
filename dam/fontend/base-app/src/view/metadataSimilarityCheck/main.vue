<template>
  <div class="similarity-check-container">
    <div class="left-panel">
      <!-- 左侧环形动画 -->
      <div class="background-box" :class="{ 'dark-box': themeName === 'dark' }">
        <img src="../../assets/images/ring.png" alt="" />
      </div>
      <div class="outer-ring">
        <span class="ball"></span>
        <div class="inner-ring">
          <span class="ball1"></span>
          <span class="ball2"></span>
        </div>
      </div>
    </div>

    <div class="right-panel">
      <div class="right-content">
        <div v-if="loading" style="margin-bottom: 10px; color: #888">
          加载中...
        </div>
        <div v-if="errorMsg" style="color: red; margin-bottom: 10px">
          {{ errorMsg }}
          <datablau-button
            type="normal"
            @click="fetchJobDetail"
            :disabled="loading"
            style="margin-left: 10px"
          >
            刷新任务详情
          </datablau-button>
        </div>
        <!-- 标题部分 -->
        <div class="title-container">
          <h2>运行结束</h2>
          <div class="blue-line"></div>
        </div>

        <!-- 进度状态显示 -->
        <div class="progress-container" v-if="showProgress && !loading">
          <p class="result-head">
            <span v-if="scanning">任务正在运行，请稍候...</span>
            <span v-else-if="neverRun">任务从未运行</span>
            <span v-else>扫描完成</span>
          </p>
          <div class="progress-bar">
            <div
              class="finished"
              :style="{ width: scanning ? '50%' : '100%' }"
            ></div>
          </div>
          <p class="finish-count">
            <span
              class="result-icon"
              :class="scanning ? 'checking-icon' : 'finish-icon'"
            >
              <i v-if="!scanning" class="el-icon-check"></i>
            </span>
            <span>
              <span v-if="scanning">扫描进度计数：</span>
              <span v-else>推荐总数：</span>
              <datablau-button type="text" class="ele-count big-font-btn">
                {{ resultCount }}
              </datablau-button>
              项
            </span>
          </p>
        </div>

        <!-- 表单部分 -->
        <div class="form-container" v-if="!showProgress && !loading">
          <!-- 第一行：数据库A、SchemaA、表A -->
          <div class="form-row">
            <div class="form-item">
              <span class="form-label">数据库A</span>
              <datablau-select
                v-model="databaseA"
                placeholder="请选择"
                class="select-box"
                clearable
                filterable
                :disabled="!canEdit || loading || scanning"
              >
                <el-option
                  v-for="item in databaseOptions"
                  :key="item.value + ''"
                  :label="item.label"
                  :value="item.value + ''"
                ></el-option>
              </datablau-select>
            </div>
            <div class="form-item">
              <span class="form-label">SchemaA</span>
              <datablau-select
                v-model="schemaA"
                placeholder="请选择"
                class="select-box"
                clearable
                filterable
                :disabled="!canEdit || loading || scanning"
              >
                <el-option
                  v-for="item in schemaAOptions"
                  :key="item.value + ''"
                  :label="item.label"
                  :value="item.value + ''"
                ></el-option>
              </datablau-select>
            </div>
            <div class="form-item">
              <span class="form-label">表A</span>
              <datablau-select
                v-model="tableA"
                placeholder="请选择表/视图（可选）"
                class="select-box"
                clearable
                filterable
                :disabled="!canEdit || loading || scanning || !schemaA"
                remote
                reserve-keyword
                :remote-method="getTableListA"
              >
                <el-option
                  v-for="item in tableAOptions"
                  :key="item.objectId"
                  :label="item.splicingName"
                  :value="String(item.objectId)"
                >
                  <datablau-icon
                    style="margin-right: 2px; vertical-align: sub; margin-bottom: 1px;"
                    v-if="item.typeId === 80000004"
                    :data-type="'table'"
                    :icon-type="'svg'"
                    :size="14"
                  ></datablau-icon>
                  <datablau-icon
                    style="margin-right: 2px; vertical-align: sub; margin-bottom: 1px;"
                    v-if="item.typeId === 80500008"
                    :data-type="'view'"
                    :icon-type="'svg'"
                    :size="14"
                  ></datablau-icon>
                  {{ item.splicingName }}
                </el-option>
              </datablau-select>
            </div>
          </div>
          <!-- 第二行：数据库B、SchemaB、表B -->
          <div class="form-row">
            <div class="form-item">
              <span class="form-label">数据库B</span>
              <datablau-select
                v-model="databaseB"
                placeholder="请选择"
                class="select-box"
                clearable
                filterable
                :disabled="!canEdit || loading || scanning"
              >
                <el-option
                  v-for="item in databaseOptions"
                  :key="item.value + ''"
                  :label="item.label"
                  :value="item.value + ''"
                ></el-option>
              </datablau-select>
            </div>
            <div class="form-item">
              <span class="form-label">SchemaB</span>
              <datablau-select
                v-model="schemaB"
                placeholder="请选择"
                class="select-box"
                clearable
                filterable
                :disabled="!canEdit || loading || scanning"
              >
                <el-option
                  v-for="item in schemaBOptions"
                  :key="item.value + ''"
                  :label="item.label"
                  :value="item.value + ''"
                ></el-option>
              </datablau-select>
            </div>
            <div class="form-item">
              <span class="form-label">表B</span>
              <datablau-select
                v-model="tableB"
                placeholder="请选择表/视图（可选）"
                class="select-box"
                clearable
                filterable
                :disabled="!canEdit || loading || scanning || !schemaB"
                remote
                reserve-keyword
                :remote-method="getTableListB"
              >
                <el-option
                  v-for="item in tableBOptions"
                  :key="item.objectId"
                  :label="item.splicingName"
                  :value="String(item.objectId)"
                >
                  <datablau-icon
                    style="margin-right: 2px; vertical-align: sub; margin-bottom: 1px;"
                    v-if="item.typeId === 80000004"
                    :data-type="'table'"
                    :icon-type="'svg'"
                    :size="14"
                  ></datablau-icon>
                  <datablau-icon
                    style="margin-right: 2px; vertical-align: sub; margin-bottom: 1px;"
                    v-if="item.typeId === 80500008"
                    :data-type="'view'"
                    :icon-type="'svg'"
                    :size="14"
                  ></datablau-icon>
                  {{ item.splicingName }}
                </el-option>
              </datablau-select>
            </div>
          </div>
        </div>

        <!-- 按钮部分 -->
        <div class="button-container">
          <datablau-button
            v-if="!scanning"
            type="primary"
            @click="startProcess"
            class="action-button"
            :disabled="jobStatus === 'RUNNING' || loading || !isFormValid"
          >
            开始运行
          </datablau-button>
          <datablau-button
            v-if="scanning"
            type="secondary"
            @click="stopProcess"
            class="action-button"
            :disabled="loading"
          >
            停止扫描
          </datablau-button>
          <datablau-button
            type="normal"
            @click="exportResult"
            class="action-button"
            :disabled="jobStatus !== 'FINISHED' || loading"
          >
            结果导出
          </datablau-button>
          <!-- <datablau-button
            v-if="!neverRun && !scanning"
            type="important"
            @click="viewResult"
            class="action-button"
            style="background: #0084ff; color: #fff;"
          >
            <span class="check-result-btn">查看结果</span>
          </datablau-button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import http from '@/http/main'
export default {
  name: 'MetadataSimilarityCheck',
  data() {
    return {
      databaseA: '',
      databaseB: '',
      schemaA: '',
      schemaB: '',
      databaseOptions: [], // { value, label, schemas: [{ value, label }] }
      schemaAOptions: [],
      schemaBOptions: [],
      // 新增状态变量
      showProgress: false,
      scanning: false,
      neverRun: true,
      percent: 0,
      resultCount: 0,
      themeName: 'light', // 默认亮色主题
      // 新增任务相关变量
      taskId: null,
      pollingTimer: null,
      jobStatus: '',
      jobDetail: null,
      errorMsg: '',
      loading: false,
      canEdit: false,
      // 新增表选择相关变量
      tableA: '',
      tableAOptions: [],
      tableB: '',
      tableBOptions: [],
      // 待设置的表值（用于任务详情回显）
      pendingTableA: '',
      pendingTableB: '',
    }
  },
  computed: {
    // 验证表单是否完整
    isFormValid() {
      return this.databaseA && this.schemaA && this.databaseB && this.schemaB
    }
  },
  watch: {
    databaseA(newVal) {
      if (newVal) {
        const selectedDb = this.databaseOptions.find(db => db.value === newVal)
        this.schemaAOptions = selectedDb ? selectedDb.schemas : []
        // 如果当前选中的schema不在新的选项中，则清空
        if (this.schemaA && !this.schemaAOptions.find(s => s.value === this.schemaA)) {
          this.schemaA = ''
        }
        // 如果只有一个选项，自动选择
        if (this.schemaAOptions.length === 1) {
          this.schemaA = this.schemaAOptions[0].value
        }
      } else {
        this.schemaAOptions = []
        this.schemaA = ''
      }
    },
    databaseB(newVal) {
      if (newVal) {
        const selectedDb = this.databaseOptions.find(db => db.value === newVal)
        this.schemaBOptions = selectedDb ? selectedDb.schemas : []
        // 如果当前选中的schema不在新的选项中，则清空
        if (this.schemaB && !this.schemaBOptions.find(s => s.value === this.schemaB)) {
          this.schemaB = ''
        }
        // 如果只有一个选项，自动选择
        if (this.schemaBOptions.length === 1) {
          this.schemaB = this.schemaBOptions[0].value
        }
      } else {
        this.schemaBOptions = []
        this.schemaB = ''
      }
    },
    schemaA(newVal) {
      // 当schemaA变化时，清空表A的选择并重新加载表列表
      this.tableA = ''
      this.tableAOptions = []
      if (newVal) {
        // 延迟加载表列表，确保schema选项已经更新
        this.$nextTick(() => {
          this.getTableListA('')
        })
      }
    },
    schemaB(newVal) {
      // 当schemaB变化时，清空表B的选择并重新加载表列表
      this.tableB = ''
      this.tableBOptions = []
      if (newVal) {
        // 延迟加载表列表，确保schema选项已经更新
        this.$nextTick(() => {
          this.getTableListB('')
        })
      }
    },
  },
  methods: {
    // 获取数据库和schema列表
    async fetchDatasourceList() {
      try {
        const res = await http.getModelTree()
        const tree = res.data && res.data.subNodes ? res.data.subNodes : []
        console.log(tree)
        // 递归提取 type=MODEL 且 subNodes 有数据的节点
        function extractModels(nodes) {
          console.log(nodes)
          let result = []
          for (const node of nodes) {
            if (
              node.type === 'MODEL' &&
              Array.isArray(node.subNodes) &&
              node.subNodes.length > 0
            ) {
              // 提取schema
              const schemas = node.subNodes
                .filter(s => s.type === 'MODEL_SCHEMA')
                .map(s => ({
                  value: String(s.id), // schema用id字符串
                  label: s.name,
                }))
              if (schemas.length > 0) {
                result.push({
                  value: String(node.id), // 数据库用id字符串
                  label: node.name,
                  schemas,
                })
              }
            }
            if (Array.isArray(node.subNodes)) {
              result = result.concat(extractModels(node.subNodes))
            }
          }
          return result
        }
        this.databaseOptions = extractModels(tree)
        console.log(this.databaseOptions)
      } catch (e) {
        this.errorMsg = '获取数据库列表失败，请稍后重试'
      }
    },
    // 获取任务详情并回显
    async fetchJobDetail() {
      this.loading = true
      this.errorMsg = ''
      try {
        // 直接请求任务详情接口，不依赖路由参数
        const res = await this.$http.get('/job/main/query/jobs/byDto/byName')
        const job = res.data
        if (!job) {
          this.errorMsg = '未获取到任务详情，请稍后重试'
          this.loading = false
          return
        }
        this.jobDetail = job
        this.taskId = job.jobId
        this.jobStatus = job.lastRunStatus
        // 解析参数
        if (job.jobContent) {
          let jobContent = {}
          try {
            jobContent = JSON.parse(job.jobContent)
          } catch (e) {}
          const params = jobContent.parameters || []
          // modelA/modelB 形如 5600103.dam_stdcode_fullgoal
          const getParam = name =>
            (params.find(p => p.parameterName === name) || {}).value || ''
          const modelA = getParam('modelA')
          const modelB = getParam('modelB')
          
          if (modelA) {
            const parts = modelA.split('.')
            const dbA = parts[0]
            const schemaA = parts[1]
            const tableA = parts[2] // 可能不存在
            
            this.databaseA = String(dbA) // 确保是字符串类型
            this.schemaA = String(schemaA) // 确保是字符串类型
            // 延迟初始化schemaA的选项，等待databaseOptions加载完成
            this.$nextTick(() => {
              this.initSchemaOptions('A', String(dbA), String(schemaA))
            })
            
            // 保存表A的值，等待schema初始化完成后再设置
            if (tableA) {
              this.pendingTableA = String(tableA) // 确保表ID是字符串类型
            }
          }
          if (modelB) {
            const parts = modelB.split('.')
            const dbB = parts[0]
            const schemaB = parts[1]
            const tableB = parts[2] // 可能不存在
            
            this.databaseB = String(dbB) // 确保是字符串类型
            this.schemaB = String(schemaB) // 确保是字符串类型
            // 延迟初始化schemaB的选项，等待databaseOptions加载完成
            this.$nextTick(() => {
              this.initSchemaOptions('B', String(dbB), String(schemaB))
            })
            
            // 保存表B的值，等待schema初始化完成后再设置
            if (tableB) {
              this.pendingTableB = String(tableB) // 确保表ID是字符串类型
            }
          }
        }
        // 允许编辑的条件：任务已完成（FINISHED）或失败（FAILED）
        this.canEdit =
          this.jobStatus === 'FINISHED' || this.jobStatus === 'FAILED'
        if (this.jobStatus === 'FINISHED') {
          this.showProgress = false
          this.scanning = false
          this.neverRun = false
          this.errorMsg = ''
        } else if (this.jobStatus === 'RUNNING') {
          this.showProgress = true
          this.scanning = true
          this.neverRun = false
          this.errorMsg = ''
          this.canEdit = false
          this.pollTaskStatus()
        } else if (this.jobStatus === 'FAILED') {
          this.showProgress = false
          this.scanning = false
          this.neverRun = false
          this.errorMsg = '任务运行失败，请前往任务调度查看具体任务日志'
        } else {
          this.showProgress = false
          this.scanning = false
          this.neverRun = true
          this.errorMsg = ''
          this.canEdit = false
        }
      } catch (e) {
        this.errorMsg = '获取任务详情失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    // 初始化schema选项的方法
    initSchemaOptions(type, databaseId, schemaId) {
      // 如果databaseOptions还没加载完成，等待一下再试
      if (this.databaseOptions.length === 0) {
        setTimeout(() => {
          this.initSchemaOptions(type, databaseId, schemaId)
        }, 100)
        return
      }
      
      const selectedDb = this.databaseOptions.find(db => db.value === String(databaseId))
      if (selectedDb) {
        if (type === 'A') {
          this.schemaAOptions = selectedDb.schemas
          // 如果schemaId在选项中，则选中；否则清空
          if (schemaId && this.schemaAOptions.find(s => s.value === String(schemaId))) {
            this.schemaA = String(schemaId)
            // 延迟加载表A列表并设置待设置的表值
            this.$nextTick(() => {
              this.getTableListA('').then(() => {
                // 如果有待设置的表A值，则设置它
                if (this.pendingTableA) {
                  this.tableA = this.pendingTableA
                  this.pendingTableA = ''
                }
              })
            })
          } else {
            this.schemaA = ''
          }
        } else if (type === 'B') {
          this.schemaBOptions = selectedDb.schemas
          // 如果schemaId在选项中，则选中；否则清空
          if (schemaId && this.schemaBOptions.find(s => s.value === String(schemaId))) {
            this.schemaB = String(schemaId)
            // 延迟加载表B列表并设置待设置的表值
            this.$nextTick(() => {
              this.getTableListB('').then(() => {
                // 如果有待设置的表B值，则设置它
                if (this.pendingTableB) {
                  this.tableB = this.pendingTableB
                  this.pendingTableB = ''
                }
              })
            })
          } else {
            this.schemaB = ''
          }
        }
      }
    },
    // 启动任务
    async startProcess() {
      if (!this.taskId || this.loading) return
      this.loading = true
      this.errorMsg = ''
      try {
        // 先更新任务参数
        const updateData = {
          schedule: null,
          canExecuteDateTemplates: null,
          expectedMemory: null,
          runCycle: "暂不调度",
          "@class": "com.datablau.job.scheduler.data.DatablauJobDescriptor",
          disabled: false,
          parameters: [
            {
              parameterName: "modelA",
              parameterDescription: "数据库A",
              value: this.tableA ? `${this.databaseA}.${this.schemaA}.${this.tableA}` : `${this.databaseA}.${this.schemaA}`,
              type: null,
              mandatory: false,
              deleted: false,
            },
            {
              parameterName: "modelB",
              parameterDescription: "数据库B",
              value: this.tableB ? `${this.databaseB}.${this.schemaB}.${this.tableB}` : `${this.databaseB}.${this.schemaB}`,
              type: null,
              mandatory: false,
              deleted: false,
            },
          ],
        }
        await this.$http.post(`/job/main/updateJobInfo?jobId=${this.taskId}`, updateData)
        // 更新成功后启动任务
        await this.$http.post(
          `/job/main/startJob?jobId=${this.taskId}&executor=admin`
        )
        this.showProgress = true
        this.scanning = true
        this.neverRun = false
        this.canEdit = false
        this.errorMsg = ''
        this.pollTaskStatus()
      } catch (e) {
        this.errorMsg = '启动任务失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    // 轮询获取任务状态
    async pollTaskStatus() {
      if (this.pollingTimer) {
        clearInterval(this.pollingTimer)
      }
      this.pollingTimer = setInterval(async () => {
        try {
          const res = await this.$http.post('/job/main/query/jobResults/byCriteria', {
            '@type': '.MultipleCriteria',
            criteria: [
              {
                '@type': '.FieldEqualsCriteria',
                page: null,
                fieldName: 'jobId',
                compareValue: this.taskId,
                notEqual: false,
              },
            ],
          })
          const job = res.data.content && res.data.content[0]
          if (!job) return
          this.jobStatus = job.status
          if (this.jobStatus === 'FINISHED') {
            this.scanning = false
            this.showProgress = false
            this.canEdit = true // 任务完成后允许重新编辑
            this.errorMsg = ''
            clearInterval(this.pollingTimer)
          } else if (this.jobStatus === 'FAILED') {
            this.scanning = false
            this.showProgress = false
            this.canEdit = true // 任务失败后也允许重新编辑
            this.errorMsg = '任务运行失败，请前往任务调度查看具体任务日志'
            clearInterval(this.pollingTimer)
          }
          // RUNNING状态继续轮询
        } catch (e) {
          this.errorMsg = '查询任务状态失败'
          clearInterval(this.pollingTimer)
        }
      }, 2000)
    },
    stopProcess() {
      this.scanning = false
      clearInterval(this.pollingTimer)
    },
    exportResult() {
      if (this.jobStatus !== 'FINISHED') return
      this.$downloadFile && this.$downloadFile('/metadata/mm/export/result')
    },
    viewResult() {},
    resetError() {
      this.errorMsg = ''
    },
         // 获取表列表 (A) - 复用qualityRule的逻辑
     async getTableListA(query) {
       if (!this.schemaA) {
         this.tableAOptions = []
         return Promise.resolve()
       }
       try {
                   // 获取schema名称
          const selectedSchema = this.schemaAOptions.find(s => s.value === this.schemaA)
          const schemaName = selectedSchema ? selectedSchema.label : ''
          
          const obj = {
            currentPage: 1,
            keyword: query || '',
            modelIds: this.databaseA ? [this.databaseA] : null,
            pageSize: 100,
            tagIds: null,
            typeIds: [80000004, 80500008], // TABLE和VIEW类型
            schema: schemaName,
          }
                   const res = await this.$http.post(`${this.$meta_url}/entities/searchMetadata`, obj)
          
          // 处理表名显示逻辑，复用qualityRule的逻辑
          res.data.content.forEach(element => {
            if (element.logicalName !== null && element.logicalName !== '') {
              element.splicingName = element.physicalName + '(' + element.logicalName + ')'
            } else {
              element.splicingName = element.physicalName
            }
          })
          
          this.tableAOptions = res.data.content || []
                } catch (e) {
           console.error('获取表A列表失败:', e)
           this.tableAOptions = []
         }
         return Promise.resolve()
     },
     // 获取表列表 (B) - 复用qualityRule的逻辑
     async getTableListB(query) {
       if (!this.schemaB) {
         this.tableBOptions = []
         return Promise.resolve()
       }
       try {
                   // 获取schema名称
          const selectedSchema = this.schemaBOptions.find(s => s.value === this.schemaB)
          const schemaName = selectedSchema ? selectedSchema.label : ''
          
          const obj = {
            currentPage: 1,
            keyword: query || '',
            modelIds: this.databaseB ? [this.databaseB] : null,
            pageSize: 100,
            tagIds: null,
            typeIds: [80000004, 80500008], // TABLE和VIEW类型
            schema: schemaName,
          }
                   const res = await this.$http.post(`${this.$meta_url}/entities/searchMetadata`, obj)
          
          // 处理表名显示逻辑，复用qualityRule的逻辑
          res.data.content.forEach(element => {
            if (element.logicalName !== null && element.logicalName !== '') {
              element.splicingName = element.physicalName + '(' + element.logicalName + ')'
            } else {
              element.splicingName = element.physicalName
            }
          })
          
          this.tableBOptions = res.data.content || []
                } catch (e) {
           console.error('获取表B列表失败:', e)
           this.tableBOptions = []
         }
         return Promise.resolve()
     },
  },
  mounted() {
    // 先获取数据库列表，再获取任务详情
    this.fetchDatasourceList().then(() => {
      this.fetchJobDetail()
    })
  },
  beforeDestroy() {
    // 清除定时器
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer)
    }
  },
}
</script>

<style lang="scss" scoped>
// 主容器样式
.similarity-check-container {
  position: relative;
  height: 100%;
  background-color: #fff;
  overflow: hidden;
}

// 左侧面板样式
.left-panel {
  position: absolute;
  left: 0;
  right: 65%; // 调整左侧面板宽度
  top: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 40px;
  overflow: hidden;

  .background-box {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 240px;
    height: 240px;
    border-radius: 50%;
    background: #fff url('../../assets/images/bolang-line.png');
    background-repeat: repeat-x;
    background-position-y: 75%;
    background-position-x: 100%;
    animation: xscroll 8s linear infinite;

    &.dark-box {
      background-color: #303133;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.4);
      }
    }
  }

  .outer-ring {
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: 2px solid rgba(33, 117, 224, 0.3);

    .ball {
      position: absolute;
      width: 10px;
      height: 10px;
      background-color: #2175e0;
      border-radius: 50%;
      top: -5px;
      left: 50%;
      transform: translateX(-50%);
    }

    .inner-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 150px;
      height: 150px;
      border-radius: 50%;
      border: 2px solid rgba(33, 117, 224, 0.5);

      .ball1,
      .ball2 {
        position: absolute;
        width: 8px;
        height: 8px;
        background-color: #2175e0;
        border-radius: 50%;
      }

      .ball1 {
        top: -4px;
        left: 50%;
        transform: translateX(-50%);
      }

      .ball2 {
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
      }
    }
  }
}

// 右侧面板样式
.right-panel {
  position: absolute;
  right: 0;
  left: 40%; // 增加右侧面板的宽度
  top: 0;
  bottom: 0;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;

  .right-content {
    width: 100%;
    padding: 20px;
    max-width: 800px; // 限制最大宽度，防止在大屏幕上过宽
  }
}

// 标题容器样式
.title-container {
  margin-bottom: 30px;

  h2 {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 10px;
  }

  .blue-line {
    height: 4px;
    background-color: #1890ff;
    width: 100%;
  }
}

// 进度容器样式
.progress-container {
  margin-bottom: 30px;

  .result-head {
    margin-bottom: 30px;
    font-size: 30px;
    font-weight: bold;
  }

  .progress-bar {
    position: relative;
    width: 65%;
    height: 15px;
    background-color: #f0f4f8;

    .finished {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      background: linear-gradient(to right, #2175e0, #91cdff);
    }
  }

  .finish-count {
    position: relative;
    margin-top: 30px;
    padding-left: 32px;

    .result-icon {
      position: absolute;
      left: 0;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      vertical-align: top;
    }

    .finish-icon {
      background-color: #2074df;
      text-align: center;
      line-height: 24px;
      color: #fff;
    }

    .checking-icon {
      background: url('../../assets/images/checking-icon.png') center/cover;
      animation: transCircle 1s infinite linear;
    }

    .ele-count {
      color: #2074df;
      display: inline-block;
      margin: 0 12px;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

// 表单容器样式
.form-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
}

.form-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  gap: 10px; // 减少间距
  
  &:last-child {
    margin-bottom: 0;
  }
  
  // 在小屏幕上调整布局
  @media (max-width: 1200px) {
    gap: 8px;
  }
}

.form-item {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0; // 防止flex项目溢出
}

.form-label {
  margin-right: 6px;
  min-width: 55px;
  white-space: nowrap;
  flex-shrink: 0; // 防止标签被压缩
  font-size: 13px; // 稍微减小字体大小
  
  // 在小屏幕上进一步优化
  @media (max-width: 1200px) {
    min-width: 50px;
    font-size: 12px;
  }
}

.select-box {
  flex: 1;
  min-width: 0; // 防止选择框溢出
  max-width: 160px; // 减少最大宽度
  
  // 在小屏幕上进一步减少宽度
  @media (max-width: 1200px) {
    max-width: 140px;
  }
}

// 按钮容器样式
.button-container {
  display: flex;
  justify-content: flex-start;
}

.action-button {
  margin-right: 15px;
}

// 动画关键帧
@keyframes xscroll {
  from {
    background-position-x: 0%;
  }
  to {
    background-position-x: 100%;
  }
}

@keyframes transCircle {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}
</style>
