<template>
  <div>
    <datablau-dialog
      :title="$t('intelligence.lableSelect')"
      size="l"
      :height="500"
      append-to-body
      v-if="showLable"
      :visible.sync="showLable"
    >
      <div class="lable-content">
        <div class="content-left">
          <div
            class="tree-list"
            :class="{ active: curName === item.name }"
            v-for="item in treeList"
            :key="item.name"
            @click="choseTree(item)"
          >
            <is-show-tooltip
              :content="item.name"
              :refName="'name'"
            ></is-show-tooltip>
          </div>
        </div>
        <div class="content-right">
          <datablau-input
            :placeholder="$t('intelligence.searchLable')"
            v-model="tagFilterText"
            clearable
            :iconfont-state="true"
          ></datablau-input>
          <div class="table-box">
            <div class="table-item" v-for="item in tagList" :key="item.name">
              <div class="title-box">
                <div class="title">{{ item.name }}</div>
              </div>
              <div class="tag-box">
                <datablau-radio v-model="item.hasChose">
                  <el-radio
                    :style="{ width: tag.name.length > 6 ? '208px' : '96px' }"
                    v-for="tag in item.children"
                    :key="tag.content.tagId"
                    :label="tag.content.tagId + '-' + tag.content.name"
                  >
                    {{ tag.name }}
                  </el-radio>
                </datablau-radio>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <datablau-button type="secondary" @click="closeDialog">
          {{ $t('securityModule.cancel') }}
        </datablau-button>
        <datablau-button
          type="primary"
          :disabled="!canNext()"
          @click="choseTag"
        >
          {{ $t('securityModule.sure') }}
        </datablau-button>
      </span>
    </datablau-dialog>
    <datablau-button
      type="important"
      class="iconfont icon-tianjia add-btn"
      style="margin-left: 10px"
      @click="addLable"
    >
      选择标签
    </datablau-button>
  </div>
</template>

<script>
import API from '@/view/dataSecurity/util/api'
import isShowTooltip from '@/view/dataSecurity/components/isShowTooltip.vue'
export default {
  name: 'DatablauLable',
  components: {
    isShowTooltip,
  },
  data() {
    return {
      showLable: false,
      tagFilterText: '',
      treeList: [],
      allTagList: [],
      tagList: [],
      curName: '',
      choseTags: [36, 56],
    }
  },
  mounted() {
    this.getTagTree()
  },
  methods: {
    canNext() {
      const bool = this.tagList.some(m => m.hasChose)
      return bool
    },
    getTagFun() {
      this.treeList.map(item => {
        if (item.name === this.curName) {
          this.allTagList = item.children.filter(
            i =>
              i.name !== '数据安全等级' &&
              i.name !== '重要程度' &&
              i.name !== '影响程度' &&
              i.name !== '影响对象' &&
              i.name !== '影响范围' &&
              i.name !== '敏感数据' &&
              i.children.length > 0
          )
          this.tagList = this.allTagList
        }
      })
    },
    choseTree(row) {
      this.curName = row.name
      this.getTagFun()
    },
    getTagTree() {
      API.tagListApi().then(res => {
        this.$utils.sort.sortConsiderChineseNumber(res.data)
        res.data.forEach(item => {
          if (item.children && item.children.length > 0) {
            this.$utils.sort.sortConsiderChineseNumber(item.children)
            item.children.map(m => {
              m.hasChose = ''
            })
          }
        })
        this.treeList = res.data
        this.curName = res.data[0].name
        this.getTagFun()
      })
    },
    addLable() {
      this.showLable = true
    },
    closeDialog() {
      this.showLable = false
    },
    choseTag() {
      let newList = []
      this.tagList.map(item => {
        if (item.hasChose) {
          const newMap = {
            tagName: item.name,
            tagId: item.content.tagId,
            childChose: item.hasChose,
          }
          newList.push(newMap)
        }
      })
      console.log(newList)
    },
  },
  watch: {
    tagFilterText(val) {
      if (val) {
        let newList = []
        this.allTagList.map(item => {
          const bool = item.children.some(m => m.name.includes(val))
          if (bool) {
            newList.push(item)
          }
        })
        this.tagList = newList
      } else {
        this.tagList = this.allTagList
      }
    },
  },
}
</script>

<style scoped lang="scss">
.lable-content {
  position: absolute;
  top: 0;
  left: 16px;
  right: 16px;
  bottom: 0;
  .content-left {
    padding-top: 12px;
    width: 120px;
    position: absolute;
    left: 0;
    bottom: 0;
    top: 0;
    &:after {
      content: '';
      position: absolute;
      right: -8px;
      top: 0;
      bottom: 0;
      width: 1px;
      background: #ddd;
    }
    .tree-list {
      height: 32px;
      line-height: 32px;
      width: 120px;
      padding: 0 12px;
      box-sizing: border-box;
      cursor: pointer;
      &:hover {
        background: transparentize($color: #409eff, $amount: 0.9);
        color: #409eff;
      }
      &.active {
        background: transparentize($color: #409eff, $amount: 0.9);
        color: #409eff;
      }
    }
  }
  .content-right {
    padding-top: 12px;
    position: absolute;
    left: 136px;
    bottom: 0;
    right: 0;
    top: 0;
    .table-box {
      position: absolute;
      top: 48px;
      left: 0;
      right: 0;
      bottom: 0;
      overflow-y: auto;
      .table-item {
        .title-box {
          margin-top: 12px;
          margin-bottom: 6px;
          width: 100%;
          height: 18px;
          line-height: 18px;
          position: relative;
          &:after {
            content: '';
            position: absolute;
            left: 0;
            right: 0px;
            top: 9px;
            // width: 495px;
            height: 1px;
            background: #efefef;
          }
          .title {
            height: 18px;
            line-height: 18px;
            display: inline-block;
            padding-right: 10px;
            background: #fff;
            position: relative;
            z-index: 9;
          }
        }

        .tag-box {
          /deep/ .el-radio {
            height: 30px;
            line-height: 30px;
            width: 96px;
            margin-right: 16px;
            .el-radio__input {
              // display: inline-block;
              // height: 30px;
            }
            .el-radio__label {
              margin-left: 1px;
              width: 78px;
              height: 30px;
              // overflow: hidden;
              display: inline-block;
            }
          }
        }
      }
    }
  }
}
</style>
