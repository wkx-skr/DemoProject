<template>
  <div>
    <datablau-dialog
      title="创建层"
      :visible.sync="createLayerModal"
      :append-to-body="true"
      size="l">
      <datablau-form
        size="small"
        label-width='90px'
        :model="layerData"
        :rules="rules"
        ref="form"
      >
        <el-form-item
          label="分层ID"
          prop="layerId"
        >
          <datablau-input
            v-model="layerData.layerId"
            maxlength="40"
            show-word-limit
            class="input-detail"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          label="名称"
          prop="name"
        >
          <datablau-input
            v-model="layerData.name"
            class="input-detail"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          label="描述"
          prop="description"
        >
          <datablau-input
            type="textarea"
            v-model="layerData.description"
            class="input-detail"
            style="width: 500px;"
            maxlength="200"
            show-word-limit
          ></datablau-input>
        </el-form-item>
        <el-form-item
          label="抽取规范"
          prop="extractRule">
          <datablau-input
            v-model="layerData.extractRule"
            class="input-detail"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          label="命名规范"
          prop="namingRule">
          <datablau-input
            v-model="layerData.namingRule"
            class="input-detail"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          label="设计质量"
          prop="designQuality"
        >
          <datablau-input
            v-model="layerData.designQuality"
            class="input-detail"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <div slot="footer">
        <datablau-button @click="cancelLayer(1)">取消</datablau-button>
        <datablau-button @click="createLayer" type="important">确定</datablau-button>
      </div>
    </datablau-dialog>
    <datablau-dialog
      title="编辑层"
      :visible.sync="editLayerModal"
      :append-to-body="true"
      size="l">
      <datablau-form
        size="small"
        label-width='90px'
        :model="layerData"
        :rules="rules"
        ref="form2"
      >
        <el-form-item
          label="分层ID"
          prop="layerId"
        >
          <datablau-input
            v-model="layerData.layerId"
            maxlength="40"
            show-word-limit
            class="input-detail"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          label="名称"
          prop="name"
        >
          <datablau-input
            v-model="layerData.name"
            class="input-detail"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          label="描述"
          prop="description"
        >
          <datablau-input
            type="textarea"
            v-model="layerData.description"
            class="input-detail"
            style="width: 500px;"
            maxlength="200"
            show-word-limit
          ></datablau-input>
        </el-form-item>
        <el-form-item
          label="抽取规范"
          prop="extractRule">
          <datablau-input
            v-model="layerData.extractRule"
            class="input-detail"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          label="命名规范"
          prop="namingRule">
          <datablau-input
            v-model="layerData.namingRule"
            class="input-detail"
          ></datablau-input>
        </el-form-item>
        <el-form-item
          label="设计质量"
          prop="designQuality"
        >
          <datablau-input
            v-model="layerData.designQuality"
            class="input-detail"
          ></datablau-input>
        </el-form-item>
      </datablau-form>
      <div slot="footer">
        <datablau-button @click="cancelLayer(2)">取消</datablau-button>
        <datablau-button @click="modifyLayer" type="important">确定</datablau-button>
      </div>
    </datablau-dialog>
    <div class="banner-content">
      <div class="content-left">
        <h2>数据仓库分层</h2>
        <p>良好的分层设计能够让整个数据体系更容易被理解和使用，让数据结构化更清晰、极大地减少重复计算的工作、简化复杂问题、提高效率。</p>
        <datablau-button  class="addLayer iconfont icon-tianjia"  @click="openCreateLayer" type="important">
          创建分层规范</datablau-button>
      </div>
      <div class="content-right">
        <!-- <img src="@/assets/images/bg/dataWarehouse.png" alt=""> -->
      </div>
    </div>
    <div class="layer-list-wrapper">
      <datablau-table
        class="layer-data-list"
        height="100%"
        :data="layerList"
      >
        <el-table-column
          label="分层ID"
          show-overflow-tooltip
          min-width="100"
          prop="layerId">
        </el-table-column>
        <el-table-column
          label="名称"
          min-width="100"
          show-overflow-tooltip
          prop="name">
        </el-table-column>
        <el-table-column
          label="描述"
          min-width="280"
          prop="description">
        </el-table-column>
        <el-table-column
          label="抽取规范"
          min-width="140"
          prop="extractRule">
        </el-table-column>
        <el-table-column
          min-width="140"
          label="命名规范"
          prop="namingRule">
        </el-table-column>
        <el-table-column
          label="设计质量"
          min-width="80"
          prop="designQuality">
        </el-table-column>
        <el-table-column
        min-width="140"
          label="更新时间">
          <template slot-scope="scope">
            {{moment(scope.row.updateTime).format('YYYY-MM-DD HH:mm:ss')}}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="80px" fixed="right">
          <template slot-scope="scope">
            <datablau-button type="icon" @click.stop="editLayer(scope.row)" class="iconfont icon-bianji"></datablau-button>
            <datablau-button type="icon" @click.stop="deleteLayer(scope.row)" class="iconfont icon-delete"></datablau-button>
          </template>
        </el-table-column>
      </datablau-table>
    </div>
    <div class="pagination-wrapper">
      <datablau-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page.current"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="page.size"
        :total="page.count"
        :layout="'total, sizes, prev, pager, next, jumper'"
      ></datablau-pagination>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  data () {
    return {
      auth: this.$store.state.$auth,
      moment,
      query: '',
      layerList: [],
      page: {
        current: 1,
        size: 20,
        count: 0
      },
      createLayerModal: false,
      editLayerModal: false,
      layerData: {
        description: '',
        designQuality: '',
        extractRule: '',
        name: '',
        namingRule: '',
        updateTime: '',
        layerId: ''
      },
      rules: {
        name: {
          required: true,
          message: '请输入项目名称',
          trigger: 'blur'
        },
        layerId: {
          required: true,
          message: '请输入分层ID',
          trigger: 'blur'
        }
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    cancelLayer (type) {
      if (type === 1) {
        this.$refs.form.resetFields()
      } else {
        this.$refs.form2.resetFields()
      }
      this.createLayerModal = false
      this.editLayerModal = false
      this.layerData = {
        description: '',
        designQuality: '',
        extractRule: '',
        name: '',
        namingRule: '',
        updateTime: '',
        layerId: ''
      }
    },
    init () {
      this.page.current = 1
      this.page.size = 20
      this.getLayerData()
    },
    openCreateLayer () {
      this.layerData = {
        description: '',
        designQuality: '',
        extractRule: '',
        name: '',
        namingRule: '',
        updateTime: '',
        layerId: ''
      }
      this.createLayerModal = true
    },
    getLayerData () {
      this.$http.get(`${this.$url}/service/layers?currentPage=${this.page.current}&pageSize=${this.page.size}`).then(res => {
        let { data } = res
        this.layerList = data.content
        this.page.count = data.totalItems
      }).catch(err => {
        this.$showFailure(err)
      })
    },
    createLayer () {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$http.post(`${this.$url}/service/layer`, {
            layerId: this.layerData.layerId,
            name: this.layerData.name,
            description: this.layerData.description,
            extractRule: this.layerData.extractRule,
            namingRule: this.layerData.namingRule,
            designQuality: this.layerData.designQuality
          }).then(res => {
            this.$datablauMessage.success('创建成功！')
            this.createLayerModal = false
            this.$refs.form.resetFields()
            this.init()
          }).catch(err => {
            this.$showFailure(err)
          })
        }
      })
    },
    modifyLayer () {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$http.put(`${this.$url}/service/layer`, {
            layerId: this.layerData.layerId,
            id: this.layerData.id,
            name: this.layerData.name,
            description: this.layerData.description,
            extractRule: this.layerData.extractRule,
            namingRule: this.layerData.namingRule,
            designQuality: this.layerData.designQuality
          }).then(res => {
            this.$datablauMessage.success('修改成功！')
            this.editLayerModal = false
            this.$refs.form.resetFields()
            this.init()
          }).catch(err => {
            this.$showFailure(err)
          })
        }
      })
    },
    editLayer (row) {
      this.$set(this, 'layerData', {
        id: row.id,
        name: row.name,
        description: row.description,
        extractRule: row.extractRule,
        namingRule: row.namingRule,
        designQuality: row.designQuality,
        layerId: row.layerId
      })
      this.editLayerModal = true
    },
    deleteLayer (row) {
      this.$DatablauCofirm('确定要删除项目？').then(() => {
        this.$http.delete(`${this.$url}/service/layer/${row.id}`).then(res => {
          this.$datablauMessage.success('删除成功')
          this.init()
        }).catch(err => {
          this.$showFailure(err)
        })
      }).catch(() => {

      })
    },
    handleSizeChange (size) {
      this.page.size = size
      this.getLayerData()
    },
    handleCurrentChange (current) {
      this.page.current = current
      this.getLayerData()
    }
  }
}
</script>

<style lang="scss" scoped>
.banner-content{
  width: 100%;
  height: 208px;
  background: rgba(64, 158, 255, .1);
  background-image: url(~@/assets/images/bg/dataWarehouse.png);
  background-repeat:no-repeat;
  background-size: auto 176px;
  background-position: right 5% top 44%;
  // display: flex;
  // align-items: center;
  // justify-content: space-between;
  .content-left{
    padding-left: 26px;
    width: 33%;
    display: inline-block;
    h2{
      font-size: 18px;
      font-weight: 600;
      color: #555555;
      line-height: 25px;
      padding-bottom: 8px;
      padding-top: 36px;
    }
    p{
      font-size: 14px;
      font-weight: 400;
      color: #555555;
      line-height: 20px;
      // padding-right: 45px;
      padding-bottom: 24px;
    }
    .addLayer{
      display: inline-block;
    }
  }
  .content-right{
    width: 40%;
    // display: inline-block;
    float: right;
    height: 208px;
    display: flex;
    align-items: center;
    margin-right: 20px;
      img{
        width: auto;
        height: 176px;
        // max-height: 176px;
      }
    }
}
  .layer-list-wrapper {
    position: absolute;
    top: 258px;
    left: 20px;
    right: 20px;
    bottom: 50px;
  }
  .pagination-wrapper {
    position: absolute;
    bottom: 0;
    height: 50px;
    left: 20px;
    right: 20px;
    text-align: right;
    border-top: 1px solid #DDDDDD;;
    .datablau-pagination {
      position: relative;
      top: 10px;
    }
  }
</style>
