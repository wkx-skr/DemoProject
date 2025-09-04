<template>
  <div>
    <datablau-table
      :data-selectable="option.selectable"
      :auto-hide-selection="option.autoHideSelectable"
      :show-column-selection="option.showColumnSelection"
      :column-selection="option.columnSelection"
      :border="option.columnResizable"
      :data="tableData"
      :stripe="true"
    >
      <!-- <el-table-column width="20"></el-table-column> -->
      <el-table-column
        :label="$t('quality.page.knowledgebase.historyTable.modifier')"
        prop="modifier"
        width="100"
      >
        <template slot-scope="scope">
          <span>
            {{
              nameMapping[scope.row.modifier]
                ? nameMapping[scope.row.modifier]
                : scope.row.modifier
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('quality.page.knowledgebase.historyTable.modifyTime')"
        prop="modifyTime"
        :formatter="$timeFormatter"
        width="160"
      ></el-table-column>
      <el-table-column
        :label="$t('quality.page.knowledgebase.historyTable.details')"
      >
        <template slot-scope="scope">
          <span v-html="stringifyDetail(scope.row.editEvent)"></span>
        </template>
      </el-table-column>
    </datablau-table>
  </div>
</template>
<script>
export default {
  props: ['kdId'],
  data() {
    return {
      tableData: [],
      nameMapping: {},
      deleteArr: ['tableData', 'nameMapping'],
      option: {
        selectable: false,
        autoHideSelectable: true,
        showColumnSelection: true,
        columnSelection: [],
        columnResizable: true,
      },
    }
  },
  mounted() {
    this.getData()
  },
  beforeDestroy() {
    setTimeout(() => {
      this.deleteArr.forEach(item => {
        if (typeof this[item] === 'object' && this[item]) {
          Object.keys(this[item]).forEach(o => {
            this[item][o] = null
          })
        }
        this[item] = null
      })
      if (window.CollectGarbage) {
        window.CollectGarbage()
      }
    }, 3000)
  },
  methods: {
    getData() {
      this.$http
        .post(this.$quality_url + '/knowledge/kd/' + this.kdId + '/history', {
          pageSize: 100,
          currentPage: 0,
        })
        .then(res => {
          this.tableData = res.data.content
          let arr = this.tableData.map(e => e.modifier)
          arr = [...new Set(arr)]
          // this.getUserByIds(arr)
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    getUserByIds(idList) {
      if (!idList) {
        return
      }
      return new Promise(resolve => {
        this.$http
          .post(`${this.$url}/service/staffs/ids?isTuAcct=true`, idList)
          .then(res => {
            const obj = {}
            res.data.forEach(e => {
              obj[e.tuAcct] = e.tuCname
            })
            this.nameMapping = obj
          })
          .catch(e => {
            this.$showFailure(e)
          })
      })
    },
    stringifyDetail(obj) {
      const newCreated = obj.newCreated
      let cnt = 1
      const objToText = (title, obj) => {
        let text = cnt++ + ': ' + title
        const added = obj.added
        const deleted = obj.deleted
        if (added.length !== 0) {
          text += this.$t('quality.page.knowledgebase.stringifyDetail.added')
          added.forEach((item, index) => {
            text += '"' + item + '"'
            if (index !== added.length - 1) {
              text += ','
            }
          })
          if (deleted.length !== 0) {
            text += ','
          }
        }
        if (deleted.length !== 0) {
          text += this.$t('quality.page.knowledgebase.stringifyDetail.deleted')
          deleted.forEach((item, index) => {
            text += '"' + item + '"'
            if (index !== deleted.length - 1) {
              text += ','
            }
          })
        }
        text += '。<br>'
        return text
      }
      if (newCreated) {
        return this.$t('quality.page.knowledgebase.stringifyDetail.newCreated')
      } else {
        try {
          let text = ''
          for (const k in obj) {
            if (k === 'newCreated') {
            } else if (obj[k]) {
              const v = obj[k]
              switch (k) {
                case 'documents':
                  text += objToText(
                    this.$t(
                      'quality.page.knowledgebase.stringifyDetail.documents'
                    ),
                    v
                  )
                  break
                case 'techRules':
                  text += objToText(
                    this.$t(
                      'quality.page.knowledgebase.stringifyDetail.techRules'
                    ),
                    v
                  )
                  break
                case 'title':
                  text +=
                    cnt++ +
                    this.$t(
                      'quality.page.knowledgebase.stringifyDetail.title',
                      {
                        oldValue: v.oldValue,
                        newValue: v.newValue,
                      }
                    )
                  break
                case 'cause':
                  text +=
                    cnt++ +
                    this.$t(
                      'quality.page.knowledgebase.stringifyDetail.cause',
                      {
                        oldValue: v.oldValue,
                        newValue: v.newValue,
                      }
                    )
                  break
                case 'description':
                  text +=
                    cnt++ +
                    this.$t(
                      'quality.page.knowledgebase.stringifyDetail.description',
                      {
                        oldValue: v.oldValue,
                        newValue: v.newValue,
                      }
                    )
                  break
                case 'solution':
                  text +=
                    cnt++ +
                    this.$t(
                      'quality.page.knowledgebase.stringifyDetail.solution',
                      {
                        oldValue: v.oldValue,
                        newValue: v.newValue,
                      }
                    )
                  break
              }
              //                text += k + ':' + obj[k] + '; ';
            }
          }
          return text
        } catch (e) {
          return JSON.stringify(obj)
        }
      }
    },
  },
}
</script>
