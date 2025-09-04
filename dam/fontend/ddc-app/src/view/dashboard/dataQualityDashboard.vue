<template>
  <div id="q-d-container">
    <div class="dashboard-inner">
      <div id="top-row">
        <!-- <div class="cover-mask hide-mask" @click="hideOverflow"></div> -->
        <el-row :gutter="10" type="flex" justify="space-between">
          <el-col>
            <div class="card total-con">
              <div class="graph">
                <div data-id="0"></div>
              </div>
              <div class="right">
                <div class="title">质量总分</div>
                <div class="figure">{{ qualityData.dataQuaScore }}</div>
              </div>
            </div>
          </el-col>
          <el-col>
            <div class="card">
              <div class="graph">
                <div data-id="1"></div>
              </div>
              <div class="right">
                <div class="title">质量规则</div>
                <div class="figure">{{ qualityData.totalRules }}</div>
              </div>
              <div class="detail">
                <ul>
                  <li>
                    <span class="legend0"></span>
                    业务规则
                  </li>
                  <li>
                    <span class="legend1"></span>
                    技术规则
                  </li>
                </ul>
              </div>
            </div>
          </el-col>
          <el-col>
            <div class="card content-way">
              <div class="graph">
                <div data-id="2"></div>
              </div>
              <div class="right">
                <div class="title">按目录统计</div>
                <div class="figure">{{ qualityData.totalBuRuleCnt }}</div>
              </div>
              <div class="detail">
                <ul>
                  <li
                    v-for="(item, index) in qualityData.buRuleCatalogs"
                    :key="item"
                  >
                    <span :class="'legend' + index"></span>
                    {{ item }}
                  </li>
                </ul>
                <i
                  class="arrow-btn el-icon-arrow-left"
                  @click.stop="showList('content-way')"
                ></i>
                <div
                  class="cover-mask"
                  @click.stop="hideOverflow('content-way')"
                ></div>
              </div>
            </div>
          </el-col>
          <el-col>
            <div class="card type-way">
              <div class="graph">
                <div data-id="3"></div>
              </div>
              <div class="right">
                <div class="title">按类型统计</div>
                <div class="figure">{{ qualityData.totalBuRuleCnt }}</div>
              </div>
              <div class="detail">
                <ul>
                  <li
                    v-for="(item, index) in qualityData.buRuleCategories"
                    :key="item"
                  >
                    <span :class="'legend' + index"></span>
                    {{ item }}
                  </li>
                </ul>
                <i
                  class="arrow-btn el-icon-arrow-left"
                  @click.stop="showList('type-way')"
                ></i>
                <div
                  class="cover-mask"
                  @click.stop="hideOverflow('type-way')"
                ></div>
              </div>
            </div>
          </el-col>
          <el-col>
            <div class="card">
              <div class="graph">
                <div data-id="4"></div>
              </div>
              <div class="right">
                <div class="title">监测任务修复情况</div>
                <div class="figure">{{ qualityData.taskStateCount }}</div>
              </div>
              <div class="detail">
                <ul>
                  <li
                    v-for="(item, index) in qualityData.taskStatesArr"
                    :key="item"
                  >
                    <span :class="'legend' + index"></span>
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      <div id="second-row">
        <el-row class="echarts-row">
          <div class="big-card-row">
            <div class="big-card left">
              <div class="title">各系统问题发现情况TOP10</div>
              <div class="mon-week sys-pro">
                <div class="day" @click="sysProShow('day')">日</div>
                <div class="week" @click="sysProShow('week')">周</div>
                <div class="month active" @click="sysProShow('month')">月</div>
              </div>
              <div
                id="system-graph"
                style="
                  position: absolute;
                  top: 50px;
                  left: 0;
                  right: 20px;
                  bottom: 20px;
                "
              ></div>
            </div>
            <div class="big-card right">
              <div class="title">各系统未完成质量修复任务状况统计</div>
              <div
                id="department-graph"
                style="
                  position: absolute;
                  top: 50px;
                  left: 0;
                  right: 20px;
                  bottom: 20px;
                "
              ></div>
            </div>
          </div>
        </el-row>

        <el-row class="index-row">
          <div class="big-card-row">
            <div class="big-card left">
              <div class="title">重点规则的问题的解决情况TOP5</div>
              <div class="mon-week imp-pro-time">
                <div class="day" @click="impProShow('day')">日</div>
                <div class="week" @click="impProShow('week')">周</div>
                <div class="month active" @click="impProShow('month')">月</div>
              </div>
              <div class="table imp-pro">
                <el-table
                  :height="bottomTableHeight"
                  :data="importantIssuesTopTen"
                  class="plain-table imp-prob-list"
                  border
                  :stripe="true"
                >
                  <el-table-column width="20"></el-table-column>
                  <el-table-column type="index" label="排名"></el-table-column>
                  <el-table-column
                    prop="name"
                    label="规则名称"
                  ></el-table-column>
                  <el-table-column
                    prop="data"
                    label="发现问题数"
                  ></el-table-column>
                  <el-table-column prop="time" label="时间"></el-table-column>
                  <el-table-column
                    label="趋势图"
                    width="200"
                    class-name="trend-pic"
                  >
                    <template slot-scope="scope">
                      <div
                        class="rule-trend"
                        :class="'trend' + scope.$index"
                      ></div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <div class="big-card right">
              <div class="title">先进个人排行榜TOP10</div>
              <div class="table">
                <el-table
                  :height="bottomTableHeight"
                  :data="goodEmployees"
                  class="plain-table per-top-10"
                  :stripe="true"
                >
                  <el-table-column width="20"></el-table-column>
                  <el-table-column type="index" label="排名"></el-table-column>
                  <el-table-column prop="name" label="名称"></el-table-column>
                  <!-- <el-table-column prop="department" label="部门"></el-table-column> -->
                  <el-table-column
                    prop="total"
                    label="解决总数"
                  ></el-table-column>
                  <el-table-column
                    prop="recent"
                    label="最近一个月"
                  ></el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script>
import js from './dataQualityDashboard.js'
export default js
</script>

<style lang="scss" scoped>
@import './dataQualityDashboard.scss';
</style>
<style lang="scss">
#q-d-container.qua-dashboard {
  .imp-pro {
    .plain-table td,
    .plain-table th,
    .plain-table tr {
      height: 48px;
      .trend-pic {
        padding: 2px 0;
        .cell {
          height: 100%;
          .rule-trend {
            // border: 1px solid #aaa;
            display: inline-block;
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }
}
</style>
