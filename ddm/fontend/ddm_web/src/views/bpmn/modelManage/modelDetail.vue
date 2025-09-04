<template>
  <div class="model-detail-show-wrapper">
    <datablau-dialog
      width="650px"
      height="343px"
      title="编辑模型"
      :visible.sync="modelInfoModal"
      append-to-body
    >
      <div class="new-model-wrapper">
        <datablau-form
          ref="newModelFormRef"
          label-width="50px"
          :model="modelInfoCopy"
        >
          <el-form-item
            label="名称"
            required
          >
            <datablau-input maxlength="100" show-word-limit placeholder="请输入" v-model="modelInfoCopy.name" ></datablau-input>
          </el-form-item>
          <el-form-item
            label="描述"
          >
            <datablau-input style="width: 500px;" type="textarea" placeholder="请输入" v-model="modelInfoCopy.description" ></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <span slot="footer">
        <datablau-button @click="handleEditModelInfoCancel">取 消</datablau-button>
        <datablau-button type="primary" @click="handleEditModelInfoSubmit">
          确 定
        </datablau-button>
      </span>
    </datablau-dialog>
    <div class="breadcrumb-wrapper">
      <datablau-breadcrumb
        :node-data="breadcrumbData"
        @back="goBack"
      ></datablau-breadcrumb>
    </div>
    <div class="top-header-wrapper">
      <datablau-icon style="display: inline-block;margin-right: 12px;" :data-type="'bpmnmodel'" icon-type="svg" :size="48" ></datablau-icon>
      <div class="model-name-wrapper">
        <h2>{{modelInfo.name}}<datablau-button type="icon" class="iconfont icon-bianji" @click="editModelName"></datablau-button></h2>
        <div class="type-wrapper">
          类型：{{modelInfo.modelType}}
        </div>
      </div>
      <div class="time-wrapper" style="float: right">
        <p>更新时间<br/>{{$timeFormatter(modelInfo.lastModificationTimestamp)}}</p>
        <datablau-button style="display: inline-block" type="normal" class="iconfont icon-bianji" @click="editModel">编辑</datablau-button>
      </div>
    </div>
    <div class="content-wrapper">
      <datablau-tabs v-model="activeTab">
        <el-tab-pane label="模型的对象" name="summary">
        </el-tab-pane>
        <el-tab-pane label="模型" name="model">
        </el-tab-pane>
      </datablau-tabs>
      <model-object-detail class="model-detail-wrapper" :modelId="modelId" v-if="activeTab === 'summary'"></model-object-detail>
      <bpmn-model-edit class="model-graph-wrapper" :is-edit="false" :id="modelInfo.id" v-if="activeTab === 'model'"></bpmn-model-edit>
    </div>
  </div>
</template>

<script>
import modelObjectDetail from './modelObjectDetail.vue'
import BpmnModelEdit from '@/views/bpmn/bpmnModel/bpmnModelEdit.vue'
export default {
  components: {
    BpmnModelEdit,
    modelObjectDetail
  },
  props: {
    modelId: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      modelInfo: {
      },
      modelInfoCopy: {},
      breadcrumbData: [],
      activeTab: 'summary',
      modelInfoModal: false
    }
  },
  mounted () {
    this.init()
    this.getModelDetailInfo()
  },
  methods: {
    init () {
      if (this.$route.query.id) {
        this.activeTab = 'model'
      } else {
        this.activeTab = 'summary'
      }
    },
    handleEditModelInfoSubmit () {
      this.$http.put(this.$bpmn + `editor/model/${this.modelId}`, {
        name: this.modelInfoCopy.name,
        description: this.modelInfoCopy.description,
        id: this.modelId
      }).then(res => {
        this.modelInfo = res.data
        this.$datablauMessage.success('保存成功')
        this.modelInfoModal = false
        this.$emit('refreshData', res.data.name)
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    handleEditModelInfoCancel () {
      this.modelInfoModal = false
    },
    editModel () {
      this.$http.put(this.$bpmn + `editor/${this.modelId}/lock`).then(res => {
        console.log(res.data)
        if (res.data) {
          const pos = location.href.indexOf('#/')
          const baseUrl = location.href.slice(0, pos + 2)
          window.open(baseUrl + `main/bpmnModelEdit?id=${this.modelId}`, '_blank')
        }
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    editModelName () {
      this.modelInfoModal = true
      this.modelInfoCopy = _.cloneDeep(this.modelInfo)
    },
    goBack () {
      this.$router.replace({
        query: null
      })
      this.$emit('goBack')
    },
    getModelDetailInfo () {
      this.$http.get(this.$bpmn + `editor/model/${this.modelId}?withPath=true`).then(res => {
        console.log(res.data)
        this.modelInfo = res.data
        let path = (this.modelInfo.fullPath || '').split('/').filter(item => item).map(item => {
          return {
            name: item,
            couldClick: false
          }
        })
        this.breadcrumbData = path
      }).catch(err => {
        this.$showFailure(err)
      })
    }
  }
}
</script>

<style scoped lang="scss">
.model-detail-show-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  z-index: 10;
  padding: 12px 20px;
}
.top-header-wrapper {
  border-top: 1px solid #ddd;
  padding-top: 11px;
}
.model-name-wrapper {
  display: inline-block;
  vertical-align: top;
}
.time-wrapper {
  p {
    display: inline-block;
    font-size: 12px;
    line-height: 16px;
    padding-right: 20px;
    margin-right: 20px;
    border-right: 1px solid #ddd;
    vertical-align: middle;
  }
  .datablau-button {
    display: inline-block;
    vertical-align: middle;
  }
}
.content-wrapper {
  .model-detail-wrapper {
    position: absolute;
    top: 133px;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    background: #fff;
    padding: 12px 20px;
  }
  .model-graph-wrapper {
    position: absolute;
    top: 137px;
    left: 20px;
    right: 20px;
    bottom: 20px;
    z-index: 10;
    background: #fff;
  }
}
</style>
