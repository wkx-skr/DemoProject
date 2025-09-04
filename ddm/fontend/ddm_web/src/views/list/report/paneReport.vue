<template>
  <div class="pane-report-component" :class="{'show-skip-btn':showSkip2Model}">
    <datablau-dialog
      title="报告审批"
      :visible.sync="dialogVisible"
      append-to-body
      :close-on-click-modal="false"
      size="xl"
    >
      <div class="dialog-inner report-apply-dialog">
        <div class="dialog-title">
          <span>{{
              `${$store.state.$v.report.aboutReport} ${reportBody.name} ${$store.state.$v.report.aboutQualityRepotr}`
            }}</span>
        </div>
        <datablau-form label-position="right" label-width="70px">
          <el-form-item label="审批结果" :rules="{required:true}">
            <datablau-radio v-model="subStep">
              <el-radio
                v-for=" item in outGoingFlows"
                :key="item.id"
                :disabled="buttonLock"
                :label="item.id"
              >
                {{ item.name }}
              </el-radio>
            </datablau-radio>
          </el-form-item>
          <el-form-item label="审批原因" :rules="{required:true}">
            <datablau-input
              type="textarea"
              size="mini"
              maxlength="500"
              placeholder="请输入"
              show-word-limit
              :autosize="{minRows:3, maxRows:10}"
              v-model="currentStatus.comment"></datablau-input>
          </el-form-item>
        </datablau-form>
      </div>
      <div slot="footer">
        <datablau-button size="small" @click="handleJudgeClose" type="cancel">
        </datablau-button>
        <datablau-button
          size="small"
          @click="handleProcess"
          :disabled="!commentNotEmpty || buttonLock || !subStep"
          type="important"
        >
          {{
            $t('component.messageBox.confirm')
          }}
        </datablau-button>
      </div>
    </datablau-dialog>
    <el-card class="report-box-outer" v-loading="loading">
      <div class="report-box" v-if="!loading">
        <div class="right-report-button">
          <datablau-button
            type="secondary"
            size="small"
            @click="checkModel"
            v-if="showSkip2Model"
            class="report-top-bottom-item"
          >
            查看模型
          </datablau-button>
          <datablau-button
              type="secondary"
              size="small"
              @click="scanDetail"
              class="report-top-bottom-item"
          >
            {{ $store.state.$v.report.reportDetail }}
          </datablau-button>
          <datablau-button
              type="secondary"
              size="small"
              @click="generate"
              class="report-top-bottom-item"
          >
            {{ $store.state.$v.report.exportPDF }}
          </datablau-button>
        </div>
        <datablau-tooltip
          effect="dark"
          :content="reportBody.name"
          placement="top"
          :open-delay="200"
          style="height:41px;width: 100%;"
        >
          <div class="title" :class="{'show-skip-btn':showSkip2Model}">
            {{ reportBody.name }}
          </div>
        </datablau-tooltip>
        <table style="margin-top:14px;">
          <tr>
            <td class="label grey">{{$store.state.$v.report.modelName}}</td>
            <td class="value">
              <datablau-tooltip
                effect="dark"
                :content="detail.modelName"
                placement="top"
                :open-delay="200"
              >
                <span style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;max-width: 200px;display: inline-block;">{{detail.modelName}}</span>
              </datablau-tooltip>
            </td>
            <td class="label  grey">{{$store.state.$v.report.version}}</td>
            <td class="value">{{ reportBody.modelVersionIds.map(item => reportBody.version[item]).join(',') }}</td>
            <td class="label  grey">{{$store.state.$v.report.ITdirector}}</td>
            <td class="value">{{reportBody.creator}}</td>
          </tr>
          <tr>
            <td class="label grey">{{$store.state.$v.report.department}}</td>
            <td class="value">{{businessDepartment}}</td>
            <td class="label grey">{{$store.state.$v.report.system}}</td>
            <td class="value">{{damSystem}}</td>
            <td class="label grey">{{$store.state.$v.report.commitReportTime}}</td>
            <td class="value">{{moment(reportBody.createTime).format('YYYY-MM-DD HH:mm:ss')}}</td>
          </tr>
          <tr>
            <td class="label grey">{{ $store.state.$v.report.remarks }}</td>
            <td colspan="5" class="value" style="padding-top:14px;padding-bottom:14px;">
              {{ $store.state.$v.report.reportStatus }}
            </td>
          </tr>
          <tr>
            <td class="label grey" rowspan="2">{{$store.state.$v.report.checkResult}}</td>
            <td colspan="5" class="text-value">
              <img v-if="check.total.status" :src="imgSrc1" alt="">
              <img v-else :src="imgSrc2" alt="">
              <span class="imp" style="margin-left:.5em;vertical-align: top">{{check.total.title}}</span><br>
              <span class="sub" style="margin-left:2.6em;">{{check.total.text}}</span>
            </td>
          </tr>
          <tr>
            <td colspan="5" class="text-value" v-if="checked">
              <div
                v-for="i in checkTotalRow"
                :key="i"
                class="check-detail-row"
                @click="scanDetail(i)"
              >
                <span class="tag red" :class="{green:check.status[i-1],en:lang === 'English'}">{{check.label[i-1]}}</span>
                <span class="text">{{check.text[i-1]}}</span>
                <span class="red-text">{{check.redText[i-1]}}</span>
              </div>
            </td>
            <td colspan="5" class="text-value" v-else>
              <div
                class="check-detail-row no-skip"
              >
                <span class="tag red" :class="{en:lang === 'English'}">{{$store.state.$v.report.failed2}}:</span>
                <span class="red-text hide-underline">{{failedMsg}}</span>
              </div>
            </td>
          </tr>
          <tr v-if="$workflow_enable">
            <td class="label grey">{{$store.state.$v.report.checkResult1}}</td>
            <td style="border:none;padding:0;" colspan="5">
              <table style="margin:-1px;">
                <tr>
                  <td class="label2  grey">{{ $store.state.$v.report.judgeStatus }}</td>
                  <td
                    class="value2" style="padding-top:18px;padding-bottom:18px;width:800px;line-height: 32px;"
                    colspan="5"
                  >
                    <span v-if="currentStatus.status==='Generated'">{{ $store.state.$v.report.unApply }}</span>
                    <span v-else-if="currentStatus.status==='Process_Generating'">
                      <span v-if="currentStatus.isSelf">
                        {{ $store.state.$v.report.waitingForYourApproval }}
                      </span>
                      <span v-else>
                        {{ $store.state.$v.report.waitFor }} {{ currentStatus.user }} {{ $store.state.$v.report.judge }}
                      </span>
                    </span>
                    <span v-else-if="currentStatus.status==='Rejected'">{{ $store.state.$v.report.rejected }}</span>
                    <span v-else-if="currentStatus.status==='Approved'">{{ $store.state.$v.report.approved }}</span>
                    <datablau-button
                      class="iconfont icon-menu-bwdsq"
                      size="small"
                      style="float:right;"
                      @click="judge"
                      v-if="currentStatus.status==='Process_Generating' && currentStatus.isSelf"
                    >&nbsp;&nbsp;{{ $store.state.$v.report.judge1 }}
                    </datablau-button>
                    <datablau-button
                      class="iconfont icon-menu-bwdsq"
                      :disabled="buttonLock"
                      size="small"
                      style="float:right;"
                      @click="launchWorkflowOfReport"
                      v-if="currentStatus.status==='Generated' && writable"
                    >&nbsp;&nbsp;{{$store.state.$v.report.apply}}</datablau-button>
                  </td>
                </tr>
                <tbody
                  v-for="(v, i) in assignee"
                  :key="i"
                >
                <!--<tr>-->
                <!--    <td class="label2 grey">{{$store.state.$v.report.title}}</td>-->
                <!--    <td class="value2 grey"  colspan="5">{{v.title}}</td>-->
                <!--  </tr>-->
                  <tr>
                    <td class="label2 grey">{{$store.state.$v.report.department2}}</td>
                    <td class="value2">{{v.department}}</td>
                    <td class="label2 grey">{{$store.state.$v.report.judger}}</td>
                    <td class="value2">{{v.assignee}}</td>
                    <td class="label2 grey">{{$store.state.$v.report.judgeDate}}</td>
                    <td class="value2">{{v.date}}</td>
                  </tr>
                  <tr>
                    <td class="label2">{{$store.state.$v.report.judgeOpinion}}</td>
                    <td class="value2" style="padding-top:18px;padding-bottom:18px;" colspan="5">{{v.comment}}</td>
                  </tr>
                </tbody>
                <tr v-if="assignee && assignee.length === 0">
                  <td colspan="6" style="padding-top:18px;padding-bottom:18px;width:800px;" class="value2">
                    {{$store.state.$v.report.noList}}
                    <el-button type="text" v-if="$store.state.user.isAdmin" @click="setProcess">{{$store.state.$v.report.goSetting}}</el-button>
                    <span v-else>{{$store.state.$v.report.contactAdm}}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td class="label grey">{{ $store.state.$v.report.reason }}</td>
            <td colspan="5" class="value2" style="padding-bottom:15px;"></td>
          </tr>
        </table>
        <img v-if="currentStatus.status==='Rejected'" :src="imgSrc3" alt=""
             style="position:absolute;left:11px;top:-32px;">
        <img v-if="currentStatus.status==='Approved'" :src="imgSrc" alt=""
             style="position:absolute;left:11px;top:-32px;">
      </div>
    </el-card>
  </div>
</template>
<script>
import paneReport from './paneReport.js'

export default paneReport
</script>
<style lang="scss" scoped>
.grey {
  background: #F7F9FB;
}

.pane-report-component {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: auto;
  background-color: #f7f7f7;
  padding-top: 20px;
}

.report-box-outer {
  //border: 1px solid red;
  margin: 0px 0 20px;
}

@import './paneReport';
</style>

<style lang="scss">
.report-apply-dialog {
  //border: 1px solid red;

  .dialog-title {
    //border: 1px solid red;
    font-size: 16px;
    color: #555555;
    line-height: 16px;
    padding: 5px 0 5px 2px;
  }
}

</style>
