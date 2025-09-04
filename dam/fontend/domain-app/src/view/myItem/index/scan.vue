<template>
  <div style="margin-bottom: 20px">
    <!--<div class="title-line">
      <span class="title oneline-eclipse" :title="baseCode ? detail.cnAbbr : detail.chAbbr">{{baseCode ? detail.cnAbbr : detail.chAbbr}}</span>
      <div class="sup-name" v-if="!baseCode">
        <i class="fa fa-link"></i>
        <span v-if="detail.baseCodeName">{{detail.baseCodeName}}</span>
        <span v-else-if="msgFromParent">{{msgFromParent.type === 'BASE_CODE' ? msgFromParent.detail.cnName : msgFromParent.detail.baseCodeName }}</span>
      </div>
    </div>-->
    <div class="description-line">
      <div class="details-box">
        <div class="detail">
          <span class="label">指标编码</span>
          <span class="value">{{ detail.codeId }}</span>
        </div>
        <div class="detail">
          <span class="label">中文名称</span>
          <span class="value">
            {{ baseCode ? detail.cnFull : detail.chFull }}
          </span>
        </div>
        <div class="detail">
          <span class="label">中文简称</span>
          <span class="value">
            {{ baseCode ? detail.cnAbbr : detail.chAbbr }}
          </span>
        </div>
        <div class="detail">
          <span class="label">英文名称</span>
          <span class="value">{{ detail.enFull }}</span>
        </div>
        <div class="detail">
          <span class="label">英文简称</span>
          <span class="value">{{ detail.enAbbr }}</span>
        </div>
      </div>
    </div>
    <div class="prop-line alg-line" v-if="baseCode || true">
      <div class="title">1.算法属性</div>
      <div class="line"></div>
      <div class="details-box">
        <div class="detail">
          <span class="label">计算公式</span>
          <span class="value" v-html="n2br(detail.function)"></span>
        </div>
        <br />
        <div
          class="detail"
          v-for="p in detail.properties"
          v-if="
            p.property.catalog.catalog === '算法属性' &&
            p.property.name !== '算法描述'
          "
        >
          <span class="label">{{ p.property.name }}</span>
          <span class="value" v-html="n2br(p.value)"></span>
        </div>
        <br />
        <div
          class="detail broader"
          v-for="p in detail.properties"
          v-if="
            p.property.catalog.catalog === '算法属性' &&
            p.property.name === '算法描述'
          "
        >
          <span class="label">{{ p.property.name }}</span>
          <span class="value" v-html="n2br(p.value)"></span>
        </div>
      </div>
    </div>
    <div class="prop-line alg-line" v-if="baseCode">
      <div class="title">2.管理属性</div>
      <div class="line"></div>
      <div class="details-box">
        <div class="detail">
          <span class="label">指标类型</span>
          <span class="value">{{ detail.area }}</span>
        </div>
        <div class="detail">
          <span class="label">定义部门</span>
          <span class="value">{{ detail.department }}</span>
        </div>
        <div class="detail">
          <span class="label">生效日期</span>
          <span class="value">{{ $dateFormatter(detail.startDate) }}</span>
        </div>
        <div class="detail">
          <span class="label">失效日期</span>
          <span class="value">{{ $dateFormatter(detail.endDate) }}</span>
        </div>
        <div
          class="detail"
          v-for="p in detail.properties"
          v-if="p.property.catalog.catalog === '管理属性'"
        >
          <span class="label">{{ p.property.name }}</span>
          <span class="value">{{ p.value }}</span>
        </div>
      </div>
    </div>
    <div class="prop-line alg-line">
      <div class="title">
        <span v-if="baseCode">3</span>
        <span v-else>2</span>
        .关联属性
      </div>
      <div class="line"></div>
      <div class="details-box">
        <div class="detail">
          <span class="label">关联指标</span>
          <span class="value">
            <el-button
              v-for="d in detail.refCodes"
              :key="d.codeId"
              type="text"
              @click="jumpToCode(d.codeId)"
            >
              {{ d.chName }}
            </el-button>
          </span>
        </div>
      </div>
    </div>
    <div class="prop-line" v-if="!baseCode">
      <div class="title">3.维度信息</div>
      <div class="line"></div>
      <div class="details-box">
        <!--<div class="detail">
          <span class="label">时间周期</span>
          <span class="value">
            <span v-for="d in detail.dims" v-if="d.catalog.dimensionType === 'TIME'">
              {{d.catalog.catalog}} / {{ d.value}}<br>
            </span>
          </span>
        </div
        ><br
        >-->
        <div class="detail">
          <span class="label">修饰维度</span>
          <span class="value">
            <span
              v-for="d in detail.dims"
              v-if="d.catalog.dimensionType === 'NORMAL'"
            >
              {{ d.catalog.catalog }} / {{ d.value }}
              <br />
            </span>
          </span>
        </div>
        <div class="detail">
          <span class="label">观测对象</span>
          <span class="value">
            <span v-for="d in detail.monitorObjects">
              {{ d.monitorObject }}
              <br />
            </span>
          </span>
        </div>
      </div>
    </div>
    <div class="prop-line" v-if="!baseCode">
      <div class="title">4.关联函数</div>
      <div class="line"></div>
      <div class="table">
        <el-table class="stripe-table" :data="detail.functions" border>
          <el-table-column prop="funcName" label="名称"></el-table-column>
          <el-table-column
            prop="engine"
            label="引擎"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column
            prop="returnType"
            label="返回值类型"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column label="参数列表">
            <template slot-scope="scope">
              <span v-for="(p, i) in scope.row.parameters">
                {{ p.name
                }}{{ i == scope.row.parameters.length - 1 ? '' : ',' }}
              </span>
            </template>
          </el-table-column>
          <!--<el-table-column :width="130" label="操作">-->
          <!--<template slot-scope="scope">-->
          <!--<el-button type="text" @click="editFunction(scope.row)">修改</el-button>-->
          <!--<el-button type="text" @click="deleteFunction(scope.row.funcId)">删除</el-button>-->
          <!--</template>-->
          <!--</el-table-column>-->
        </el-table>
      </div>
    </div>
    <div class="prop-line">
      <div class="title">
        <span v-if="baseCode">4</span>
        <span v-else>5</span>
        .关联文档
      </div>
      <div class="line"></div>
      <div class="table">
        <el-table class="stripe-table" :data="documents" border>
          <el-table-column
            prop="fileOrginalName"
            label="文件名称"
          ></el-table-column>
          <el-table-column label="文件大小">
            <template slot-scope="scope">
              {{ Math.ceil(scope.row.fileSize / 1024) }}KB
            </template>
          </el-table-column>
          <el-table-column prop="uploader" label="上传人"></el-table-column>
          <el-table-column
            prop="uploadTimestamp"
            :formatter="$dateFormatter"
            label="上传日期"
          ></el-table-column>
          <el-table-column label="操作" :width="80">
            <template slot-scope="scope">
              <el-button type="text" @click="downloadDoc(scope.row.fileId)">
                下载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="prop-line">
      <div class="title">
        <span v-if="baseCode">5</span>
        <span v-else>6</span>
        .引用
      </div>
      <div class="line"></div>
      <div class="table">
        <el-table class="stripe-table" :data="quotes" border>
          <el-table-column label="应用编码" prop="code"></el-table-column>
          <el-table-column label="应用名称" prop="name"></el-table-column>
          <el-table-column
            label="需求编码"
            prop="dataRequirementCode"
          ></el-table-column>
          <el-table-column
            label="需求名称"
            prop="dataRequirementName"
          ></el-table-column>
          <!--<el-table-column label="操作">-->
          <!--<template slot-scope="scope">-->
          <!--<el-button type="text" size="mini" @click="queryApplication(scope.row)">查看应用</el-button>-->
          <!--<el-button type="text" size="mini" @click="queryRequirement(scope.row)">查看需求</el-button>-->
          <!--</template>-->
          <!--</el-table-column>-->
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import code from './scan.js'
export default code
</script>

<style scoped lang="scss">
@import './scan.scss';
</style>
