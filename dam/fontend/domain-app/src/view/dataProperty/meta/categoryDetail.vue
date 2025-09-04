<template>
  <div style="padding: 20px">
    <div class="fieldMessage-title">
      <p class="message-title">
        {{ $t('meta.modelCategory.systemDetail.property') }}
      </p>
    </div>
    <div class="system-properties">
      <ul>
        <li>
          <p :style="{ width: $i18n.locale === 'zh' ? '100px' : '134px' }">
            {{ $t('meta.modelCategory.categoryName') }}：
          </p>
          <p>{{ category.categoryName }}</p>
        </li>
        <li>
          <p :style="{ width: $i18n.locale === 'zh' ? '100px' : '134px' }">
            {{ $t('meta.modelCategory.categoryAbbreviation') }}：
          </p>
          <p>{{ category.categoryAbbreviation }}</p>
        </li>
        <li>
          <p :style="{ width: $i18n.locale === 'zh' ? '100px' : '134px' }">
            {{ $t('meta.modelCategory.zone') }}：
          </p>
          <p>{{ category.zone }}</p>
        </li>
        <li>
          <p :style="{ width: $i18n.locale === 'zh' ? '100px' : '134px' }">
            {{ $t('meta.modelCategory.itDepartment') }}：
          </p>
          <p>{{ category.itDepartment }}</p>
        </li>
        <li>
          <p :style="{ width: $i18n.locale === 'zh' ? '100px' : '134px' }">
            {{ $t('meta.modelCategory.businessDepartment') }}：
          </p>
          <p>{{ category.businessDepartment }}</p>
        </li>
        <li>
          <p :style="{ width: $i18n.locale === 'zh' ? '100px' : '134px' }">
            {{ $t('meta.modelCategory.importance') }}：
          </p>
          <p>
            {{ category.importance }}
          </p>
        </li>
        <li>
          <p :style="{ width: $i18n.locale === 'zh' ? '100px' : '134px' }">
            {{ $t('meta.modelCategory.owner') }}：
          </p>
          <p>{{ category.owner }}</p>
        </li>
        <li>
          <p :style="{ width: $i18n.locale === 'zh' ? '100px' : '134px' }">
            {{ $t('meta.modelCategory.deployment') }}：
          </p>
          <p>{{ category.deployment }}</p>
        </li>
        <li>
          <p :style="{ width: $i18n.locale === 'zh' ? '100px' : '134px' }">
            {{ $t('meta.DS.treeSubOperation.desc') }}：
          </p>
          <p>{{ category.description }}</p>
        </li>
        <li v-for="item in udps">
          <p :style="{ width: $i18n.locale === 'zh' ? '100px' : '134px' }">
            {{ item.name }}：
          </p>
          <p>{{ item.value }}</p>
        </li>
      </ul>
    </div>
    <div style="clear: both">
      <div class="fieldMessage-title">
        <p class="message-title">
          {{ $t('meta.modelCategory.systemDetail.dataSource') }}
        </p>
      </div>
      <datablau-table
        style="margin-top: 10px"
        v-if="bindedModels"
        :data="bindedModels"
        :show-column-selection="option.showColumnSelection"
        :column-selection="option.columnSelection"
        :border="option.columnResizable"
      >
        <el-table-column
          width="60"
          align="center"
          :label="$t('meta.DS.treeSubOperation.num')"
        >
          <template slot-scope="scope">
            {{ $utils.string.appendLeadingZero(scope.$index + 1) }}
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('meta.modelCategory.modelName')"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.definition }}
            <el-tooltip
              :content="$t('meta.DS.treeSubOperation.mainDataSource')"
              placement="right"
              v-show="scope.row.primaryModel"
            >
              <i class="el-icon-circle-check"></i>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          prop="type"
          :label="$t('meta.modelCategory.modelType')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="owner"
          :label="$t('meta.DS.treeSubOperation.owner')"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="creationTime"
          :label="$t('meta.DS.treeSubOperation.createTime')"
          show-overflow-tooltip
          :formatter="$timeFormatter"
        ></el-table-column>
      </datablau-table>
    </div>
    <!-- <el-form
      class="page-form"
      label-position="right"
      label-width="100px"
      size="small"
      :model="category"
      ref="form"
      disabled
    >
      <el-form-item
        :label="$version.modelCategory.categoryName"
        prop="categoryName"
      >
        <el-input v-model="category.categoryName"></el-input>
      </el-form-item>
      <el-form-item
        :label="$version.modelCategory.categoryAbbreviation"
        prop="categoryAbbreviation"
      >
        <el-input v-model="category.categoryAbbreviation"></el-input>
      </el-form-item>
      <el-form-item :label="$version.common.description">
        <el-input
          type="textarea"
          autosize
          v-model="category.description"
        ></el-input>
      </el-form-item>
      <el-form-item :label="$version.modelCategory.zone">
        <el-input v-model="category.zone" clearable></el-input>
      </el-form-item>
      <el-form-item
        :label="$version.modelCategory.itDepartment"
        prop="itDepartment"
      >
        <el-input v-model="category.itDepartment" clearable></el-input>
      </el-form-item>
      <el-form-item :label="$version.modelCategory.businessDepartment">
        <el-input v-model="category.businessDepartment" clearable></el-input>
      </el-form-item>
      <el-form-item :label="$version.modelCategory.importance">
        <el-select v-model="category.importance" clearable>
          <el-option :label="$version.value.high" value="高"></el-option>
          <el-option :label="$version.value.medium" value="中"></el-option>
          <el-option :label="$version.value.low" value="低"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item :label="$version.modelCategory.owner">
        <el-input v-model="category.owner" clearable></el-input>
      </el-form-item>
      <el-form-item :label="$version.modelCategory.deployment">
        <el-input v-model="category.deployment"></el-input>
      </el-form-item>
      <el-form-item :label="$version.modelCategory.systemStatus">
        <el-input v-model="category.status"></el-input>
      </el-form-item>
    </el-form> -->
  </div>
</template>
<script>
export default {
  props: {
    categoryId: String,
  },
  data() {
    return {
      category: null,
      bindedModels: null,
      option: {
        // selectable: true,
        showColumnSelection: false,
        // columnSelection: [],
        columnResizable: true,
      },
      udps: [],
    }
  },
  beforeMount() {
    this.getUdps()
    while (isNaN(this.categoryId[1] - 0)) {
      this.categoryId = this.categoryId.slice(1)
    }
    this.category = _.clone(
      this.$modelCategoriesDetailsMap[Number.parseInt(this.categoryId.slice(1))]
    )
    this.category.status =
      this.category.status === '1'
        ? this.$t('meta.DS.treeSubOperation.onLine')
        : this.$t('meta.DS.treeSubOperation.offLine')
    this.getBindedModels()
  },
  watch: {
    categoryId(val) {
      this.category = _.clone(
        this.$modelCategoriesDetailsMap[
          Number.parseInt(this.categoryId.slice(1))
        ]
      )
      this.category.status =
        this.category.status === '1'
          ? this.$t('meta.DS.treeSubOperation.onLine')
          : this.$t('meta.DS.treeSubOperation.offLine')
      this.getBindedModels()
    },
  },
  mounted() {},
  methods: {
    getUdps() {
      this.$http
        .get(this.$url + `/service/entities/udps/80000000`)
        .then(res => {
          let temp = res.data
          this.$utils.sort.sort(temp, 'order')
          temp = temp.map(item => {
            return {
              name: item.name,
              value: '',
            }
          })
          let hasValueUdp = this.category.udpValues?.split(',').map(item => {
            return {
              name: item.split(':')[0],
              value: item.split(':')[1],
            }
          })
          if (hasValueUdp) {
            hasValueUdp.forEach(hv => {
              temp.forEach(tp => {
                if (hv.name === tp.name) {
                  tp.value = hv.value
                }
              })
            })
          }
          this.udps = temp
        })
        .catch(e => {})
    },
    getBindedModels() {
      this.$http
        .get(
          this.$url +
            '/service/models/category/' +
            Number.parseInt(this.categoryId.slice(1))
        )
        .then(res => {
          this.bindedModels = res.data
          //      this.getPrimaryModel();
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
}
</script>
<style lang="scss" scoped>
@import './_color.scss';
.message-title {
  display: inline-block;
  // padding: 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: $text-default;
  position: relative;
  padding-left: 10px;
  &:before {
    position: absolute;
    content: '';
    left: 0;
    top: 4px;
    width: 4px;
    height: 14px;
    background: $primary-color;
    border-radius: 1px;
  }
}
.system-properties {
  padding-top: 22px;
  ul {
    li {
      width: 50%;
      float: left;
      margin-bottom: 20px;
      p {
        display: inline-block;
        font-size: 12px;
        color: #555555;
        &:first-child {
          width: 100px;
          text-align: right;
          font-weight: 500;
        }
        &:last-child {
          padding-left: 10px;
          font-weight: 400;
        }
      }
    }
  }
}
</style>
