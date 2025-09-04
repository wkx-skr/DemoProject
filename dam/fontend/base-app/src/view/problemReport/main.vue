<template>
  <div class="report-container">
    <div class="tab-container">
      <datablau-tabs v-model="activeName" type="border-card">
        <el-tab-pane
          :label="$t('quality.page.problemReport.tabbar.first')"
          name="first"
          class="shrink-white"
          style="padding: 0"
        >
          <div class="tab-item">
            <el-form :model="dateRange1" size="small" inline>
              <el-form-item
                :label="$t('quality.page.problemReport.startTime')"
                style="margin-right: 20px"
              >
                <datablau-datePicker
                  type="date"
                  v-model="dateRange1.startTime"
                  @change="changeTypeStart"
                  value-format="yyyy-MM-dd"
                  :placeholder="
                    $t('quality.page.problemReport.selectStartTime')
                  "
                ></datablau-datePicker>
              </el-form-item>
              <el-form-item :label="$t('quality.page.problemReport.endTime')">
                <datablau-datePicker
                  type="date"
                  v-model="dateRange1.endTime"
                  @change="changeTypeEnd"
                  value-format="yyyy-MM-dd"
                  :placeholder="$t('quality.page.problemReport.selectEndTime')"
                ></datablau-datePicker>
              </el-form-item>
              <el-form-item>
                <datablau-button type="normal" @click="initTypeTab">
                  {{ $t('quality.page.problemReport.query') }}
                </datablau-button>
              </el-form-item>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <el-form-item
                v-if="$auth['QUALITY_PROBLEM_REPORTING_DOWNLOAD']"
                label=""
                style="float: right"
              >
                <el-dropdown trigger="click" size="small">
                  <datablau-button type="secondary">
                    <i class="iconfont icon-download"></i>
                    {{ $t('quality.page.problemReport.download') }}
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </datablau-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click="downLoadType">
                      <div @click="downLoadType">
                        {{
                          $t('quality.page.problemReport.downloadSourceData')
                        }}
                      </div>
                    </el-dropdown-item>
                    <el-dropdown-item>
                      <div @click="generate('问题类型分析', '.report-first')">
                        {{ $t('quality.page.problemReport.downloadPdf') }}
                      </div>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </el-form-item>
            </el-form>
            <type-analysis class="report-first"></type-analysis>
          </div>
        </el-tab-pane>
        <el-tab-pane
          :label="$t('quality.page.problemReport.tabbar.second')"
          name="second"
          class="shrink-white"
          style="padding: 0"
        >
          <div class="tab-item">
            <el-form :model="dateRange2" size="small" inline>
              <el-form-item
                :label="$t('quality.page.problemReport.startTime')"
                style="margin-right: 20px"
              >
                <datablau-datePicker
                  type="date"
                  v-model="dateRange2.startTime"
                  @change="changeSystemStart"
                  value-format="yyyy-MM-dd"
                  :placeholder="
                    $t('quality.page.problemReport.selectStartTime')
                  "
                ></datablau-datePicker>
              </el-form-item>
              <el-form-item :label="$t('quality.page.problemReport.endTime')">
                <datablau-datePicker
                  type="date"
                  v-model="dateRange2.endTime"
                  @change="changeSystemEnd"
                  value-format="yyyy-MM-dd"
                  :placeholder="$t('quality.page.problemReport.selectEndTime')"
                ></datablau-datePicker>
              </el-form-item>
              <el-form-item>
                <datablau-button type="normal" @click="initSystemTab">
                  {{ $t('quality.page.problemReport.query') }}
                </datablau-button>
              </el-form-item>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <el-form-item
                v-if="$auth['QUALITY_PROBLEM_REPORTING_DOWNLOAD']"
                label=""
                style="float: right"
              >
                <el-dropdown trigger="click" size="small">
                  <datablau-button type="secondary">
                    <i class="iconfont icon-download"></i>
                    {{ $t('quality.page.problemReport.download') }}
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </datablau-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item>
                      <div @click="downLoadSystem">
                        {{
                          $t('quality.page.problemReport.downloadSourceData')
                        }}
                      </div>
                    </el-dropdown-item>

                    <el-dropdown-item>
                      <div
                        @click="generate('问题所属系统分析', '.report-second')"
                      >
                        {{ $t('quality.page.problemReport.downloadPdf') }}
                      </div>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </el-form-item>
            </el-form>
            <system-analysis class="report-second"></system-analysis>
          </div>
        </el-tab-pane>
        <el-tab-pane
          :label="$t('quality.page.problemReport.tabbar.third')"
          name="third"
          class="shrink-white"
          style="padding: 0"
        >
          <div class="tab-item">
            <el-form :model="dateRange3" size="small" inline>
              <el-form-item
                :label="$t('quality.page.problemReport.startTime')"
                style="margin-right: 20px"
              >
                <datablau-datePicker
                  type="date"
                  v-model="dateRange3.startTime"
                  @change="changeCurveStart"
                  value-format="yyyy-MM-dd"
                  :placeholder="
                    $t('quality.page.problemReport.selectStartTime')
                  "
                ></datablau-datePicker>
              </el-form-item>
              <el-form-item :label="$t('quality.page.problemReport.endTime')">
                <datablau-datePicker
                  type="date"
                  v-model="dateRange3.endTime"
                  @change="changeCurveEnd"
                  value-format="yyyy-MM-dd"
                  :placeholder="$t('quality.page.problemReport.selectEndTime')"
                ></datablau-datePicker>
              </el-form-item>
              <el-form-item>
                <datablau-button type="normal" @click="initCurveTab">
                  {{ $t('quality.page.problemReport.query') }}
                </datablau-button>
              </el-form-item>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <el-form-item
                v-if="$auth['QUALITY_PROBLEM_REPORTING_DOWNLOAD']"
                label=""
                style="float: right"
              >
                <el-dropdown trigger="click" size="small">
                  <datablau-button type="secondary">
                    <i class="iconfont icon-download"></i>
                    {{ $t('quality.page.problemReport.download') }}
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </datablau-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item>
                      <div @click="downLoadCurve">
                        {{
                          $t('quality.page.problemReport.downloadSourceData')
                        }}
                      </div>
                    </el-dropdown-item>

                    <el-dropdown-item>
                      <div
                        @click="generate('问题变化趋势分析', '.report-third')"
                      >
                        {{ $t('quality.page.problemReport.downloadPdf') }}
                      </div>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </el-form-item>
            </el-form>
            <curve-analysis class="report-third"></curve-analysis>
          </div>
        </el-tab-pane>
      </datablau-tabs>
    </div>
  </div>
</template>
<script>
import main from './main.js'
export default main
</script>
<style scoped>
.report-container {
  background: var(--default-bgc);
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  border-top: 1px solid var(--border-color-lighter);
}
.top-title {
  height: 50px;
  padding: 10px 0 10px 20px;
}
.report-title {
  font-size: 16px;
  font-weight: bold;
  vertical-align: middle;
}
.tab-item {
  width: 1200px;
  height: 600px;
}
.size {
  font-size: 18px;
}
.type-analysis {
  min-width: 1200px;
  height: 100%;
}
</style>
