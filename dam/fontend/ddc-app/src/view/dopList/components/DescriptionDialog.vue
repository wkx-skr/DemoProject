<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :show-close="false"
    top="15vh"
    width="900px"
    @close="handleClose"
    append-to-body
  >
    <div v-if="descriptionType == 1">
      <div class="descriptionMessage-title">
        <p class="message-title">标识类属性</p>
      </div>
      <div class="description-line">
        <div class="details-box">
          <div class="detail">
            <span class="label">标准编码</span>
            <span class="value">{{ details.domainCode }}</span>
          </div>
          <div class="detail" data-id="domainChName">
            <span class="label">中文名称</span>
            <span class="value">{{ details.chineseName }}</span>
          </div>
          <div class="detail">
            <span class="label">英文名称</span>
            <span class="value">{{ details.englishName }}</span>
          </div>
          <div id="long-text" class="detail">
            <span class="label">同义词</span>
            <span class="value" v-html="nl2br(details.synonym)"></span>
          </div>
        </div>
      </div>
      <div class="prop-line alg-line">
        <div class="descriptionMessage-title">
          <p class="message-title">定义类属性</p>
        </div>
        <div class="details-box">
          <div class="detail broader">
            <span class="label">业务定义</span>
            <span class="value" v-html="nl2br(details.description)"></span>
          </div>
          <div class="detail broader" style="display: none"></div>
          <div id="long-text" class="detail">
            <span class="label">业务规则</span>
            <span class="value" v-html="nl2br(details.businessRule)"></span>
          </div>
        </div>
      </div>
      <div class="prop-line alg-line">
        <div class="descriptionMessage-title">
          <p class="message-title">关系类属性</p>
        </div>
        <div class="details-box">
          <!--          TODO -->
          <!--          <div class="detail2">-->
          <!--                <span class="label">-->
          <!--                  关联旧标准-->
          <!--                </span>-->
          <!--          </div>-->
          <!--          -->
          <!--          <div class="list-outer">-->
          <!--                        <relation-domain-list-->
          <!--                          :domainCodes="details.relationDomain"-->
          <!--                          :relationDomainState="details.relationDomainState"-->
          <!--                          :categoryTypeId="categoryTypeId"-->
          <!--                        ></relation-domain-list>-->
          <!--          </div>-->
          <div class="detail">
            <span class="label">关联术语</span>
            <span class="value" v-html="nl2br(details.referenceTerm)"></span>
          </div>
        </div>
      </div>
      <div class="prop-line alg-line">
        <div class="descriptionMessage-title">
          <p class="message-title">表示类属性</p>
        </div>
        <div class="details-box">
          <div class="detail">
            <span class="label">数据类型</span>
            <span class="value">{{ details.dataType }}</span>
          </div>
          <div class="detail">
            <span class="label">数据长度</span>
            <span class="value">{{ details.dataScale }}</span>
          </div>
          <div class="detail">
            <span class="label">数据精度</span>
            <span class="value">{{ details.dataPrecision }}</span>
          </div>
          <div class="detail broader">
            <span class="label">参考数据</span>
            <span class="value" style="margin-left: 0.1em; color: #479eff">
              <datablau-tooltip
                :content="details.referenceCodeState === 'X' ? '已废弃' : ''"
                placement="bottom-start"
                :disabled="details.referenceCodeState !== 'X'"
              >
                <span
                  style="cursor: pointer"
                  :class="{
                    XStyle: details.referenceCodeState === 'X',
                  }"
                  @click="viewCode(details.referenceCode)"
                >
                  {{ details.referenceCode }}
                </span>
              </datablau-tooltip>
            </span>
          </div>
          <div id="long-text" class="detail">
            <span class="label">取值范围</span>
            <span class="value">
              {{
                details.minValue ||
                details.minValue === 0 ||
                details.maxValue ||
                details.maxValue === 0
                  ? `${
                      details.minValue || details.minValue === 0
                        ? details.minValue
                        : ''
                    } 至 ${
                      details.maxValue || details.maxValue === 0
                        ? details.maxValue
                        : ''
                    }`
                  : ''
              }}
            </span>
          </div>
          <div id="long-text" class="detail">
            <span class="label">数据格式</span>
            <span class="value">{{ details.dataFormat }}</span>
          </div>
        </div>
      </div>
      <div class="prop-line alg-line">
        <div class="descriptionMessage-title">
          <p class="message-title">管理类属性</p>
        </div>
        <div class="details-box">
          <div class="detail">
            <span class="label">业务域</span>
            <span class="value">
              <i class="iconfont icon-file"></i>
              {{ details.pathStr }}
            </span>
          </div>
          <div class="detail">
            <span class="label">权威系统</span>
            <span class="value" v-html="nl2br(details.authCategoryName)"></span>
          </div>
        </div>
      </div>
      <div class="prop-line alg-line">
        <div class="descriptionMessage-title">
          <p class="message-title">附加类属性</p>
        </div>
        <div class="details-box">
          <div id="long-text" class="detail">
            <span class="label">标准来源</span>
            <span class="value" v-html="nl2br(details.source)"></span>
          </div>
          <div class="detail">
            <span class="label">创建人</span>
            <span class="value">{{ details.submitter }}</span>
          </div>
          <div class="detail">
            <span class="label">创建时间</span>
            <span class="value">
              {{ $timeFormatter(details.createTime) }}
            </span>
          </div>
          <div class="detail">
            <span class="label">发布时间</span>
            <span class="value">
              {{ $timeFormatter(details.firstPublish) }}
            </span>
          </div>
          <div class="detail">
            <span class="label">最后更新时间</span>
            <span class="value">
              {{ $timeFormatter(details.lastModification) }}
            </span>
          </div>
        </div>
      </div>
      <div class="prop-line alg-line">
        <div class="descriptionMessage-title">
          <p class="message-title">标签信息</p>
        </div>
        <div
          class="detail"
          v-for="(tagsTree, key, index) in tagsTreeArr"
          :key="index"
        >
          <div class="value" style="margin-top: 1em;margin-left: 80px">
            <img src="/static/images/metadataIcon/metadataTags.svg" alt="" />
            {{ tagsTree.parentName }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="descriptionType == 2">
      <div class="descriptionMessage-title">
        <p class="message-title">代码信息</p>
      </div>
      <div class="description-line">
        <div class="details-box">
          <div class="detail">
            <span class="label">业务域</span>
            <span class="value">
              {{
                details.paths && details.paths.length > 0
                  ? details.paths[details.paths.length - 1]
                  : ''
              }}
            </span>
          </div>
          <div class="detail">
            <span class="label">编号</span>
            <span class="value">{{ details.realCode }}</span>
          </div>
          <div class="detail" data-id="domainChName">
            <span class="label">中文名称</span>
            <span class="value">{{ details.name }}</span>
          </div>
          <div class="detail">
            <span class="label">英文名称</span>
            <span class="value">{{ details.englishName }}</span>
          </div>
          <div class="detail">
            <span class="label">创建人</span>
            <span class="value">{{ details.submitter }}</span>
          </div>
          <div class="detail">
            <span class="label">创建人</span>
            <span class="value">{{ details.submitter }}</span>
          </div>
        </div>
      </div>

      <div class="prop-line alg-line">
        <div class="descriptionMessage-title">
          <p class="message-title">代码取值</p>
        </div>
        <datablau-table
          class="datablau-table-info"
          :data="details.values || []"
          height="250px"
          highlight-current-row
          :border="true"
        >
          <el-table-column
            show-overflow-tooltip
            label="顺序号"
            prop="order"
          ></el-table-column>
          <el-table-column
            show-overflow-tooltip
            label="编码取值"
            prop="value"
          ></el-table-column>
          <el-table-column
            show-overflow-tooltip
            label="中文描述"
            prop="name"
          ></el-table-column>
          <el-table-column
            show-overflow-tooltip
            label="父编码取值"
            prop="parentValue"
          ></el-table-column>
          <el-table-column
            show-overflow-tooltip
            v-if="details.categoryId === 1"
            label="父编码映射值"
            prop="value"
          >
            <template v-slot="{ row }">
              {{ row.refValue ? row.refValue.value : '' }}
            </template>
          </el-table-column>
          <!--          映射编码取值中文名-->
          <el-table-column
            show-overflow-tooltip
            v-if="details.categoryId !== 1"
            :label="$t('domain.code.mappingCodeName')"
            show-overflow-tooltip
          >
            <template v-slot="{ row }">
              {{ row.refValue ? row.refValue.name : '' }}
            </template>
          </el-table-column>
          <el-table-column
            show-overflow-tooltip
            label="英文描述"
            prop="definition"
          ></el-table-column>
          <el-table-column
            show-overflow-tooltip
            label="备注2"
            prop="definition2"
          ></el-table-column>
          <el-table-column
            show-overflow-tooltip
            label="备注3"
            prop="definition3"
          ></el-table-column>
        </datablau-table>
      </div>

      <div class="prop-line alg-line">
        <div class="descriptionMessage-title">
          <p class="message-title">标签信息</p>
        </div>
        <div
          class="detail"
          v-for="(tagsTree, key, index) in tagsTreeArr"
          :key="index"
        >
          <div class="value" style="margin-top: 1em;margin-left: 80px">
            <img src="/static/images/metadataIcon/metadataTags.svg" alt="" />
            {{ tagsTree.parentName }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="descriptionType == 3">
      <div class="descriptionMessage-title">
        <p class="message-title">业务术语</p>
      </div>
      <div class="description-line">
        <div class="details-box">
          <div class="detail">
            <span class="label">业务域</span>
            <span class="value">
              {{
                details.paths && details.paths.length > 0
                  ? details.paths[details.paths.length - 1]
                  : ''
              }}
            </span>
          </div>
          <div class="detail">
            <span class="label">编号</span>
            <span class="value">{{ details.domainCode }}</span>
          </div>
          <div class="detail" data-id="domainChName">
            <span class="label">中文名称</span>
            <span class="value">{{ details.chName }}</span>
          </div>
          <div class="detail">
            <span class="label">英文名称</span>
            <span class="value">{{ details.enName }}</span>
          </div>
          <div class="detail">
            <span class="label">缩写</span>
            <span class="value">{{ details.abbr }}</span>
          </div>
          <div class="detail">
            <span class="label">定义</span>
            <span class="value">{{ details.explanationTerms }}</span>
          </div>
          <div class="detail">
            <span class="label">应用场景</span>
            <span class="value">{{ details.scene }}</span>
          </div>
          <div class="detail">
            <span class="label">示例</span>
            <span class="value">{{ details.example }}</span>
          </div>
          <!--          TODO 没返回同义词-->
          <!--          <div class="detail">-->
          <!--                <span class="label">-->
          <!--                  同义词-->
          <!--                </span>-->
          <!--            <span class="value">{{  }}</span>-->
          <!--          </div>-->
          <div class="detail">
            <span class="label">相关术语</span>
            <span class="value">{{ details.businessTermAliases }}</span>
          </div>
          <div class="detail">
            <span class="label">责任主体</span>
            <span class="value">{{ details.managementDepartmentName }}</span>
          </div>
          <div class="detail">
            <span class="label">参考来源</span>
            <span class="value">{{ details.source }}</span>
          </div>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <datablau-button @click="handleClose">关闭</datablau-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'DescriptionDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    tagsTreeArr: {
      type: Array,
      default: () => [],
    },
    details: {
      type: Object,
      default: () => {},
    },
    descriptionType: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible
      },
      set(value) {
        if (!value) {
          this.$emit('cancel')
        }
      },
    },
  },
  watch: {
    visible: {
      handler(newVal) {
        if (newVal) {
          setTimeout(()=>{
            this.$forceUpdate()
          })
        }
      },
      immediate: true,
    },
  },
  methods: {
    handleConfirm() {},
    handleClose() {
      this.$emit('cancel')
    },
  },
}
</script>

<style scoped lang="scss">
::v-deep .el-dialog {
  .el-dialog__header {
    display: none !important;
  }

  .el-dialog__body {
    padding-top: 12px;
    max-height: 75vh;
    min-height: 50vh;
    overflow-y: auto;
  }

  .el-dialog__footer {
    text-align: right;
  }
}

.prop-line {
  padding-top: 27px;

  // margin-top:40px;
  .title {
    //outline:1px solid pink;
    // margin-bottom: 17px;
    display: inline-block;
    font-size: 16px;
    font-weight: bold;
    // border-left:4px solid #4386f5;
    // padding-left:0.5em;
    color: var(--base-font-color);
  }

  .line {
    display: inline-block;
    width: 70%;
    margin-left: 1em;
    vertical-align: middle;
    border-top: 1px solid #e6e6e6;
  }

  .table {
    margin-top: 20px;
    margin-right: 40px;
  }
}

.details-box {
  box-sizing: border-box;
  width: 100%;

  .detail {
    margin-top: 1em;
    width: 100%;
    margin-right: 0;

    .label {
      width: 150px;
      text-align: right;
      display: inline-block;
      padding-right: 10px;
      color: #555;
      font-weight: 600;
    }

    .value {
      //width: 600px;
      color: #555;
    }
  }

  .detail2 {
    margin-top: 1em;
    width: 180px;
    margin-right: 10px;
    // padding-right: 10px;
    .label {
      display: inline-block;
      width: 150px;
      text-align: right;
      color: #555;
      font-weight: 600;
    }
  }

  .list-outer {
    width: 600px;
    margin-top: 12px;
    display: inline-block;
  }
}
</style>
