<template>
  <div>
    <datablau-dialog title="绑定业务对象" :visible.sync="binObject" width="500px" height="300px" :before-close="close">
      <div v-loading="loadings">
        <datablau-form :model="binForm" label-width="80px" ref="objectEditForm" v-show="!treeShow">
          <el-form-item label="模型" prop="name" class="chooseModel">
            <el-input v-model="binForm.name" placeholder="请点击右侧按钮选择模型" size="small"></el-input>
            <el-button size="small" @click="chooseModel" class="selectMode">选择模型</el-button>
          </el-form-item>
          <el-form-item label="逻辑表" prop="elementId">
            <el-select v-model="binForm.elementId" clearable="true">
              <el-option v-for="t in elementList" :key="t.combinedId" :value="t.combinedId" :label="t.alias ? t.name+'('+t.alias+')': t.name" />
            </el-select>
          </el-form-item>

        </datablau-form>
      </div>
      <div slot="footer" class="dialog-footer" v-show="!treeShow">
        <datablau-button size="small" @click="bindBtn">绑定</datablau-button>
      </div>
      <div class="treeBox" v-show="treeShow">
        <datablau-tree
          v-loading="loading"
          ref="treeList"
          :data="menu"
          node-key="id"
          :props="defaultProps"
          default-expand-all
          highlight-current
          :data-icon-function="dataIconFunction"
          @node-click="nodeClick"
          :expand-on-click-node="false">
        </datablau-tree>
      </div>
      <div class="dialog-footer" slot="footer" >
        <datablau-button size="small" @click="selectBtn" :disabled="disabled" v-show="treeShow" class="treeSelectBtn">确定</datablau-button>
        <datablau-button size="small" @click="treeShow = !treeShow" v-show="treeShow" class="treeSelectBtn">取消</datablau-button>
      </div>
    </datablau-dialog>
  </div>
</template>

<script>
import HTTP from '@/resource/http'
export default {
  props: {
    bindId: {
      type: String,
      default: () => ''
    },
    webFlag: {
      type: Boolean,
      default: () => false
    },
    binObject: {
      type: Boolean,
      default: () => false
    }
  },
  data () {
    return {
      binForm: {
        name: '',
        elementId: ''
      },
      elementList: [],
      treeShow: false,
      menu: [],
      loading: true,
      loadings: true,
      defaultProps: {
        label: 'name',
        children: 'child',
        id: 'id'
      },
      disabled: true
    }
  },
  methods: {
    dataIconFunction (data) {
      if (!data.categoryId) {
        return 'iconfont icon-openfile'
      } else {
        return 'iconfont icon-shujuyuan'
      }
    },
    close () {
      this.$emit('close')
    },
    bindBtn () {
      this.$emit('clientId', this.binForm.elementId)
    },
    chooseModel () {
      this.treeShow = true
      this.disabled = true
      this.treeList()
    },
    //  请求模型树
    treeList (id) {
      this.loading = true
      HTTP.getRelationModelTree('ModelB').then(res => {
        this.dataEach([res], id)
        this.loading = false
        this.menu = [res]
      }).catch(e => {
        this.loading = false
      })
    },
    dataEach (val, id) {
      val.forEach(item => {
        item.models && item.models.length !== 0 && item.child.push(...item.models)
        if (item.child) {
          item.child.forEach(items => {
            if (items.id === Number(id)) {
              this.binForm.name = items.name
            }
          })
        }
        if (item.child && item.child.length !== 0) {
          this.dataEach(item.child, id)
        }
      })
    },
    //  节点点击
    nodeClick (obj, node) {
      if (obj.categoryId) {
        this.binForm.name = obj.name
        this.binForm.id = obj.id
        this.disabled = false
      } else {
        this.disabled = true
      }
    },
    selectBtn (val) {
      this.binForm.elementId = ''
      this.treeShow = false
      this.loadings = true
      HTTP.getBusinessObjectList({ modelId: this.binForm.id }).then(res => {
        this.elementList = res
        if (val) {
          res.forEach(item => {
            if (item.elementId === Number(val)) {
              this.binForm.elementId = item.combinedId
              // this.loadings = false
            }
          })
        }
        this.loadings = false
      }).catch(e => {
        this.loadings = false
      })
    },
    webItemAry (val) {
      let ary = val.split('/')
      this.treeList(ary[0])
      this.binForm.id = ary[0]
      this.selectBtn(ary[1])
    },
    bindModel () {
      this.bindId && this.webItemAry(this.bindId)
      if (!this.bindId) {
        this.binForm.elementId = ''
        this.binForm.name = ''
      }
      this.$refs.objectEditForm.clearValidate()
    }
  },
  mounted () {
    this.bindId && this.webItemAry(this.bindId)
    if (!this.bindId) {
      this.loadings = false
    }
  },
  watch: {
    bindId (val) {
      val && this.webItemAry(val)
    },
    webFlag (val) {
      this.treeShow = false
      this.bindModel()
    }
  }
}
</script>

<style scoped lang='scss'>
.colorF{
  color: #409eff;
}
/deep/.chooseModel > div{
  display: flex;
  align-item:center;
}
/deep/ button.selectMode{
  margin-left: 10px;
  height: 32px;
  position: relative;;
  top: 5px;
}
  .treeBox{
    /*height: 235px;*/
    overflow: auto;
  }
  /deep/.el-dialog .el-dialog__body{
    div {
      padding: 0 20px 22px;
      text-align: right;
    }
  }
  .butBox{
    text-align: right;
    padding-right: 30px;
    /*right: 30px;*/
  }
  .bindBtnBox{
    text-align: right;
  }
</style>
