<template>
  <el-dialog
    :visible.sync="visible"
    append-to-body
    width="90%"
    title="产品文档"
  >
    <div :style="style">
      <el-checkbox v-model="showCurrentOnly">仅显示当前页面的文档</el-checkbox>
      <!--{{this.$version.nav[this.currentLv1]}} {{this.$version.nav[this.currentLv2]}}-->
      <template v-if="!showCurrentOnly">
        <el-card
          v-for="(v, k) in levelMap"
          :key="k"
          v-if="DATA[k]"
          style="margin-top: 1em"
          :header="$t(`common.page.${k}`)"
        >
          <template
            v-for="(i, idx) in v.filter(item => DATA[k] && DATA[k][item])"
          >
            <el-table
              :key="idx"
              class="datablau-table"
              :data="DATA[k][i]"
              style="margin-bottom: 10px"
            >
              <el-table-column
                :label="$t('common.page.' + i)"
                header-align="center"
              >
                <el-table-column
                  prop="function"
                  show-overflow-tooltip
                  label="功能点"
                ></el-table-column>
                <el-table-column
                  prop="version"
                  show-overflow-tooltip
                  label="版本"
                ></el-table-column>
                <el-table-column
                  prop="description"
                  show-overflow-tooltip
                  label="描述"
                ></el-table-column>
                <el-table-column
                  prop="access"
                  show-overflow-tooltip
                  label="权限"
                ></el-table-column>
              </el-table-column>
            </el-table>
          </template>
        </el-card>
      </template>

      <el-table class="datablau-table" v-if="showCurrentOnly" :data="tableData">
        <el-table-column
          prop="function"
          show-overflow-tooltip
          label="功能点"
        ></el-table-column>
        <el-table-column
          prop="version"
          show-overflow-tooltip
          label="版本"
        ></el-table-column>
        <el-table-column
          prop="description"
          show-overflow-tooltip
          label="描述"
        ></el-table-column>
        <el-table-column
          prop="access"
          show-overflow-tooltip
          label="权限"
        ></el-table-column>
      </el-table>
    </div>
  </el-dialog>
</template>
<script>
import DATA from './data.json'
export default {
  data() {
    return {
      DATA: DATA,
      visible: false,
      levelMap: {},
      style: {
        height: '500px',
        overflow: 'auto',
      },
      tableData: [],
      currentLv1: null,
      currentLv2: null,
      lastLv2: null,
      showCurrentOnly: true,
    }
  },
  mounted() {
    this.$bus.$on('open-document', () => {
      this.showDocument()
    })
  },
  beforeDestroy() {
    this.$bus.$off('open-document')
  },
  methods: {
    showDocument() {
      this.style.height = window.innerHeight * 0.7 + 'px'
      const menuMap = this.$store.state.menuMap
      const levelMap = menuMap.levelMap
      this.levelMap = levelMap
      Object.keys(levelMap).forEach(k => {
        const v = levelMap[k]
        if (v.includes(this.$route.name)) {
          this.currentLv1 = k
          this.currentLv2 = this.$route.name
        }
      })
      if (this.currentLv2 !== this.lastLv2) {
        if (
          DATA &&
          DATA[this.currentLv1] &&
          DATA[this.currentLv1][this.currentLv2]
        ) {
          this.tableData = DATA[this.currentLv1][this.currentLv2]
        } else {
          this.tableData = []
        }
      }

      this.lastLv2 = this.currentLv2
      this.visible = true
    },
  },
}
</script>
