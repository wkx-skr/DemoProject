<template>
  <div>
    <el-form-item
      prop="assetName"
      :inline="true"
      v-for="item in list"
      :key="item.name"
    >
      <div class="labelName">
        <el-tooltip
          :content="item.name"
          placement="top"
          class="tooltipBox"
          :disabled="item.name.length <= 8"
          effect="dark"
        >
          <span>
            {{
              item.name.length <= 8
                ? item.name + '：'
                : item.name.substr(0, 8) + '...' + '：'
            }}
          </span>
        </el-tooltip>
      </div>
      <div
        :ref="item.refName"
        :class="[
          'moreBox',
          {
            stringBox: item.type === 'STRING' || item.type === 'NUM',
            normalName:
              item['tagName' + item.content.tagId + 'Height'] === 'auto' &&
              !item['tagName' + item.content.tagId + 'Show'],
          },
        ]"
        :style="{
          height: item['tagName' + item.content.tagId + 'Height'],
        }"
      >
        <!--扩展属性中的字符串-->
        <datablau-input
          :placeholder="'请输入'"
          clearable
          v-model="item.udpsString"
          @change="
            val => {
              udpsChange(val, item.name)
            }
          "
          style="width: 240px; height: 32px"
          v-if="item.type === 'STRING'"
        ></datablau-input>
        <!--扩展属性中的枚举值-->
        <!--扩展属性中的布尔值-->
        <datablau-checkbox
          v-model="tagIdAry"
          v-else-if="item.type === 'ENUM' || item.type === 'BOOL'"
          @change="checkChange(item)"
          class="arySelect"
        >
          <el-checkbox
            :label="item.name"
            class="allSelect"
            @change="allChecked(item, item.name)"
          >
            全选
          </el-checkbox>
          <el-checkbox
            :label="item.name + '-' + v"
            v-for="v in item.children"
            :key="v"
          >
            <span v-if="v.length < 20">
              {{ v === 'true' ? '是' : v === 'false' ? '否' : v }}
            </span>
            <el-tooltip
              :content="v"
              placement="top"
              class="tooltipBox"
              effect="dark"
              v-else
            >
              <span>{{ v.substr(0, 20) + '...' }}</span>
            </el-tooltip>
          </el-checkbox>
        </datablau-checkbox>
        <!--扩展属性中的数值-->
        <el-input-number
          v-else-if="item.type === 'NUM'"
          class="numberInput"
          size="small"
          v-model="item.udpNumber"
          @change="
            val => {
              udpsChange(val, item.name)
            }
          "
        ></el-input-number>
        <!--安全属性、数据标签-->
        <datablau-checkbox
          v-model="tagIdAry"
          class="arySelect"
          @change="checkChange(item)"
          v-else
        >
          <el-checkbox
            :label="item.name"
            @change="allChecked(item, item.name)"
            class="allSelect"
          >
            全选
          </el-checkbox>
          <el-checkbox
            :label="v.content.tagId"
            v-for="v in item.children"
            :key="v.content.tagId"
          >
            <span v-if="v.name.length < 20">{{ v.name }}</span>
            <el-tooltip
              :content="v.name"
              placement="top"
              class="tooltipBox"
              effect="dark"
              v-else
            >
              <!--                  {{ v.name.substr(0, 20) + '...' }}-->
              <span>{{ v.name.substr(0, 20) + '...' }}</span>
            </el-tooltip>
          </el-checkbox>
        </datablau-checkbox>
      </div>
      <datablau-button
        v-if="item['tagName' + item.content.tagId + 'Show']"
        :type="
          item['tagName' + item.content.tagId + 'Type'] ? 'normal' : 'secondary'
        "
        @click="butAll(item)"
        class="butAll"
      >
        {{ item['tagName' + item.content.tagId + 'Type'] ? '收起' : '更多' }}
        <i
          :class="
            item['tagName' + item.content.tagId + 'Type']
              ? 'el-icon-arrow-up'
              : 'el-icon-arrow-down'
          "
        ></i>
      </datablau-button>
    </el-form-item>
  </div>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    oldNameList: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    oldNameList: {
      handler(val) {
        if (!val.length) {
          this.$set(this, 'tagIdAry', [])
          this.$set(this, 'nameList', [])
        }
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      tagIdAry: [],
      nameList: [],
    }
  },
  methods: {
    butAll(item) {
      item[item.refName + 'Type'] = !item[item.refName + 'Type']
      item[item.refName + 'Height'] = item[item.refName + 'Type']
        ? 'auto'
        : '65px'
    },
    allChecked(item, name) {
      let nameHas = this.tagIdAry.indexOf(name)
      item.children.forEach(v => {
        let tagId = v.content ? v.content.tagId : item.name + '-' + v
        if (this.tagIdAry.indexOf(tagId) == -1 && nameHas !== -1) {
          this.tagIdAry.push(tagId)
        } else if (nameHas == -1) {
          this.tagIdAry.splice(this.tagIdAry.indexOf(tagId), 1)
        }
      })
    },
    checkChange(item) {
      let nameHas = this.tagIdAry.indexOf(item.name) !== -1
      let nameListHas = this.nameList.indexOf(item.name) !== -1
      let flag = item.children.every(v => {
        let tagId = v.content ? v.content.tagId : item.name + '-' + v
        return this.tagIdAry.indexOf(tagId) !== -1
      })
      let nameListFlag = item.children.some(v => {
        let tagId = v.content ? v.content.tagId : item.name + '-' + v
        return this.tagIdAry.indexOf(tagId) !== -1
      })
      // 删除全选
      flag && !nameHas && this.tagIdAry.push(item.name)
      !flag &&
        nameHas &&
        this.tagIdAry.splice(this.tagIdAry.indexOf(item.name), 1)
      // 记录选择的条数
      nameListFlag && !nameListHas && this.nameList.push(item.name)
      !nameListFlag &&
        nameListHas &&
        this.nameList.splice(this.nameList.indexOf(item.name), 1) // 记录选择的条数
      this.$emit('checkChange', {
        tagIdAry: this.tagIdAry,
        nameList: this.nameList,
      })
    },
    udpsChange(val, name) {
      let nameHas = this.nameList.indexOf(name) !== -1
      if (nameHas) {
        this.tagIdAry.forEach((item, i) => {
          if (item.indexOf(name) !== -1) {
            this.tagIdAry.splice(i, 1, `${name}-${val}`)
          }
        })
      } else {
        this.nameList.push(name)
        this.tagIdAry.push(`${name}-${val}`)
      }
      this.$emit('checkChange', {
        tagIdAry: this.tagIdAry,
        nameList: this.nameList,
      })
    },
  },
  mounted() {},
}
</script>

<style scoped lang="scss">
/deep/.el-checkbox.allSelect {
  display: inline-block;
  position: relative;
  margin-top: -10px;
  &:after {
    content: '';
    display: block;
    height: 16px;
    border-right: 1px solid #dddddd;
    position: absolute;
    right: -8px;
    top: 5px;
  }
}
/deep/.el-checkbox.allSelect {
  margin-right: 16px;
}
.datablau-checkbox2.arySelect {
  display: inline-block;

  width: 85%;
}
/deep/.el-form-item__label {
  line-height: 23px;
}
/deep/.el-form-item__content {
  position: relative;
  line-height: 23px;
}
.butAll {
  display: inline-block;
  position: absolute;
  top: 0px;
  right: 0;
}
.moreBox {
  overflow: hidden;
  border-bottom: 1px solid #f5f5f5;
}
.normalName {
  padding-bottom: 7px;
}
.stringBox {
  padding-bottom: 14px;
}
.labelName {
  width: 120px;
  float: left;
  color: #555;
  text-align: right;
  padding-right: 8px;
}
.numberInput {
  width: 240px;
}
</style>
