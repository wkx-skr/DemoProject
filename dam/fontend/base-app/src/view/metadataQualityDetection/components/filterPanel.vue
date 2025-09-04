<template>
  <div class="filter-panel">
    <datablau-form :inline="true" :model="filterForm" class="filter-form">
      <el-form-item label="负责人：">
        <el-select
          v-model="filterForm.responsiblePerson"
          @change="handleFilterChange('user')"
          placeholder="请选择"
          clearable
          multiple
        >
          <el-option
            v-for="item in responsiblePersonOptions"
            :key="item.id"
            :label="item.username"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="业务域：">
        <el-select
          v-model="filterForm.businessDomain"
          @change="handleFilterChange('bu')"
          placeholder="请选择"
          clearable
          multiple
        >
          <el-option
            v-for="item in businessDomainOptions"
            :key="item.id"
            :label="item.buName"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="统计时间：">
        <el-date-picker
          @change="handleFilterChange('time')"
          v-model="filterForm.statisticalPeriod"
          type="date"
          value-format="yyyyMMdd"
          placeholder="选择日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item class="btn" style="float: right">
        <datablau-button type="normal" @click="openEmptyTable">为空数据</datablau-button>
      </el-form-item>
    </datablau-form>
  </div>
</template>

<script>
import { bus, users } from '@/view/metadataQualityDetection/components/mockData'

export default {
  data() {
    return {
      mock: false,
      filterForm: {
        responsiblePerson: [],
        responsiblePersonNames: [],
        businessDomain: [],
        businessDomainNames: [],
        statisticalPeriod: undefined,
      },
      responsiblePersonOptions: [],
      businessDomainOptions: [],
    }
  },
  methods: {
    openEmptyTable() {
      this.$emit('open-empty-table')
    },
    handleFilterChange(prop) {
      if (prop === 'bu') {
        this.filterForm.businessDomainNames = (
          this.filterForm.businessDomain || []
        ).map(id => {
          return this.businessDomainOptions.find(item => item.id === id).buName
        })
      } else if (prop === 'user') {
        this.filterForm.responsiblePersonNames = (
          this.filterForm.responsiblePerson || []
        ).map(id => {
          return this.responsiblePersonOptions.find(item => item.id === id)
            .username
        })
      }
      this.$emit('filter-change', this.filterForm, prop)
    },
    // 获取负责人列表
    fetchResponsiblePersons() {
      if (this.mock) {
        this.responsiblePersonOptions = users
        return
      }
      this.$http
        .get('/assets/checkResult/user/list')
        .then(res => {
          this.responsiblePersonOptions = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    // 获取业务域列表
    fetchBusinessDomains() {
      if (this.mock) {
        this.businessDomainOptions = bus
        return
      }
      this.$http
        .get('/assets/checkResult/bu/list')
        .then(res => {
          this.businessDomainOptions = res.data
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
  },
  created() {
    this.fetchResponsiblePersons()
    this.fetchBusinessDomains()
  },
}
</script>

<style lang="scss" scoped>
.filter-panel {
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
  transition: all 0.3s ease;
}
</style>
