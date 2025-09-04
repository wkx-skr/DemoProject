<template>
  <div class="data-viste-page">
    <div class="table-url-card" v-if="tableDataShow.length > 0">
      <div class="url-card" v-for="item in tableDataShow" :key="item.id">
        <p class="url-data-item">
          <span class="title">
            {{ item.name }}
          </span>
          <span class="description">{{ item.description }}</span>
        </p>
        <p class="url-data-item">
          <span class="label">到期时间：</span>
          <span class="data">
            {{ $timeFormatter(item.expire) }}
          </span>
        </p>
        <div class="url-data-item">
          <span class="label">API：</span>
          <div class="data">
            {{ item.url }}
            <el-button type="text" @click="copyUrl(item.url)" class="copy-btn">
              复制
            </el-button>
            <el-button
              type="text"
              @click="skipToDataShowPage(item)"
              class="copy-btn"
            >
              查询数据
            </el-button>
          </div>
        </div>
        <div class="url-data-item">
          <span class="label">视图字段：</span>
          <div class="data">
            <span
              class="column-item"
              v-for="(item2, index) in item.columns"
              :key="item2.name"
            >
              <span class="column-name">{{ item2.name }}</span>
              <span class="column-type">({{ item2.dataType }})</span>
              <span v-if="index !== item.columns.length - 1">;</span>
            </span>
          </div>
        </div>
        <p class="url-data-item">
          <span class="label">返回值：</span>
          <span class="data">JSON</span>
        </p>
      </div>
      <!-- <div class="para-contain">
        <p class="para-title">参数：</p>
        <div class="para-data-table">
          <el-table
            class="view-data-table"
            ref="paraDataArr"
            header-cell-class-name="table-header-cell"
            cell-class-name="view-table-cell"
            :data="paraDataArr"
          >
            <el-table-column
              prop="name"
              label="名称"
              show-overflow-tooltip
              width="200"
            >
            </el-table-column>
            <el-table-column
              prop="description"
              label="描述"
            ></el-table-column>
            <el-table-column
              prop="example"
              label="示例数据"
            ></el-table-column>
          </el-table>
        </div>
      </div> -->
    </div>
    <div class="no-data-info" v-else>暂无数据</div>
  </div>
</template>

<script>
import HTTP from '@/http/main.js'
export default {
  data() {
    return {
      tableDataShow: [],
      paraDataArr: [
        {
          name: '$sql',
          description:
            'SQL语句，需要经过BASE64转码，使用SQL语句时，所有其他参数会被忽略',
          example: 'SELECT * FROM table_name',
        },
        {
          name: '$select',
          description: '需要获取的列名',
          example: 'col_name1, col_name2',
        },
        {
          name: '$pageSize',
          description: '数据会分页返回，每页的数据条数，默认值：100',
          example: '100',
          // default: 100
        },
        {
          name: '$page',
          description: '数据会分页返回，返回的页数',
          example: '1',
        },
        {
          name: '$where',
          description: 'SQL语句的 where 条件',
          example: 'col_name=1',
        },
        {
          name: '$groupBy',
          description: '数据的分组依据，填入选择的列名',
          example: 'col_name1, col_name2',
        },
        {
          name: '$orderBy',
          description: '数据的排序依据，填入选择的列名',
          example: 'col_name1, col_name2',
        },
      ],
      // $sql=Base64(sql select)
      // $select=col1,col2
      // $page=currrentPageNumber
      // $pageSize=pageSize default 100
      // $where=where condition
      // $groupBy=col1,col2
      // $orderBy=col1,col2
      name: '',
      addMap: {},
      removedMap: {},
      loading: false,
    }
  },
  props: {
    objectId: {
      type: [String, Number],
      required: true,
    },
  },
  components: {},
  computed: {},
  mounted() {
    // this.dataInit();
  },
  methods: {
    dataInit() {
      this.loading = true
      const obj = {
        objectId: this.objectId,
      }
      HTTP.getAboutView({
        succesedCallback: data => {
          console.log(data, 'data')
          const arr = []
          if (data && Array.isArray(data)) {
            data.forEach(item => {
              const sharedUsers = item.sharedUsers
              const index = sharedUsers.findIndex(item => {
                return item === this.$user.username
              })
              if (index === -1 && !this.removedMap[item.uuid]) {
                return
              }

              if (this.addMap[item.uuid]) {
                return
              }

              const urlStr =
                window.location.host +
                '' +
                this.$url +
                '/service/vdp/data/' +
                item.name
              const obj = {
                name: item.name,
                creator: item.creator,
                // dependsOn: item.dependsOn.join(','),
                description: item.description,
                id: item.uuid,
                expire: item.expire,
                url: urlStr,
                columns: item.columns,
              }
              arr.push(obj)
            })
          }
          this.tableDataShow = arr
          this.loading = false
        },
        failureCallback: e => {
          this.loading = false
          this.$showFailure(e)
        },
        para: obj,
      })
    },

    skipToUrlEdit(url) {},
    copyUrl(url) {
      const input = document.createElement('input')
      input.setAttribute('readonly', 'readonly')
      input.setAttribute('value', url)
      document.body.appendChild(input)
      input.focus()
      input.select()
      input.setSelectionRange(0, url.length)
      if (document.execCommand('copy')) {
        document.execCommand('copy', false, null)
        this.$showSuccess('复制成功')
      }
      document.body.removeChild(input)
    },
    skipToDataShowPage(item) {
      // TODO 改成打开新页面
      localStorage.setItem(item.id, JSON.stringify(item))
      // this.$router.push({
      //   name: 'dataShow',
      //   path: '/main/dataShow',
      //   query: {
      //     viewId: item.id
      //   }
      // });
      // let urlStr = 'http://' + window.location.host + '/#' + '/dataShow?viewId=' + item.id;
      // let urlStr = window.location.origin + window.location.pathname + '#/dataShow?viewId=' + item.id;
      const urlStr = `${window.location.origin}${
        window.location.pathname
      }#/dataShow?viewId=${item.id}&tableId=${encodeURIComponent(
        this.objectId
      )}`
      // http://localhost:8081/#/dataShow?viewId=cb010da57529424184b692095e0216e7
      window.open(urlStr)
      // this.$router.push({
      //   name: 'dataShow',
      //   query: {
      //     tableId: this.objectId,
      //     viewId: item.id
      //   }
      // })
    },
  },
  watch: {},
}
</script>

<style lang="scss">
@import '../../assets/styles/constForDDC.sass';
.data-viste-page {
  .table-line {
    position: relative;
    max-height: 600px;
  }
  .table-url-card {
    width: 100%;
    margin-bottom: 20px;
    .url-card {
      border-bottom: $greyBorder2;
      width: 90%;
      margin: 20px 0 0 0;
      margin-left: 2%;
      .url-data-item {
        margin: 4px 0 4px 4px;
        .title {
          font-weight: bold;
          font-size: 15px;
        }
        .description {
          padding-left: 10px;
          color: #a7a7a6;
          font-size: 12px;
        }
        .copy-btn {
          margin: 0;
          padding: 0;
          margin-left: 20px;
        }
        .label {
          display: inline-block;
          width: 50px;
          width: 60px;
          font-size: 12px;
          padding-top: 12px;
          text-align: right;
        }
        .data {
          display: inline-block;
          margin-left: 8px;
          // display: block;
          // margin-top: 10px;
          // width: 65%;
          // text-indent: 2em;
        }
        .para-data-table {
          margin: 10px 0 10px 0;
        }
        .column-item {
          display: inline-block;
          margin: 0 4px 0 0;
          .column-name {
            // font-weight: bold;
          }
        }
      }
    }
    .para-contain {
      padding: 20px;
      .para-title {
        margin: 0 0 10px 0;
      }
    }
  }
}
</style>
<style lang="scss">
@import '../../assets/styles/constForDDC.sass';
.data-viste-page {
  // 自定义 table style
  .el-table__header-wrapper {
    border: 1px solid #dddddd;
  }
  .table-header-cell {
    background: #f6f6f6;
    height: 34px;
    color: #000;
    padding: 0 10px;
  }
  .table-check-box {
    text-align: center;
  }
  .view-table-cell {
    padding: 0 10px;
    line-height: 34px;
    .cell {
      line-height: 34px;
    }
  }
}
</style>
