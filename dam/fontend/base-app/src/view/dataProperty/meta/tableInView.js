export default {
  props: ['objectId', 'viewDetail'],
  mounted() {
    if (this.objectId) {
      this.getTables()
      this.$bus.$on('reloadTableInView', this.getTables)
      this.$bus.$on('lineageLoad', this.lineageLoaded)
    }
  },
  beforeDestroy() {
    $('#view-table-graph .table').off('click')
    this.$bus.$off('reloadTableInView')
    this.$bus.$off('lineageLoad')
  },
  data() {
    return {
      style: {
        headerCellStyle: {
          backgroundColor: '#fcfcfc',
          height: '30px',
          color: '#606060',
          fontSize: '12px',
          padding: '8px 0',
        },
        cellStyle: {
          backgroundColor: '#fcfcfc',
          padding: '8px 0',
          fontSize: '12px',
        },
      },
      alreadyPut: false,
      tables: null,
      ctx: null,
      loading: true,
      lineageIsLoaded: false,
    }
  },
  watch: {
    loading(newVal) {
      this.$bus.$emit('tableInViewLoad', newVal)
    },
  },
  methods: {
    lineageLoaded(isLoad) {
      this.lineageIsLoaded = isLoad
    },
    getTables() {
      this.loading = true
      this.$http
        .get(this.$meta_url + `/entities/views/${this.objectId}/tables`)
        .then(res => {
          if (!res.data && !this.alreadyPut) {
            this.put()
          } else {
            this.tables = res.data.relatedTables
            // if(res.data.lineage){
            this.$emit('lineageFromApiTables', res.data)
            // }
            this.draw()
            this.initEventListener()
            setTimeout(() => {
              this.loading = false
            })
          }
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    draw() {
      const EACH_HEIGHT = 25
      const EACH_WIDTH = 200
      const TOTAL_HEIGHT =
        this.tables.length * EACH_HEIGHT + (this.tables.length - 1) * 20 + 2
      const CENTER_OFFSET = TOTAL_HEIGHT / 2 - EACH_HEIGHT / 2
      const container = $('#table-view-graph')
      container.find('div').remove()
      let title = 'name: ' + this.viewDetail.physicalName
      let text = this.viewDetail.physicalName
      if (this.viewDetail.schemaName) {
        title += '\nschema: ' + this.viewDetail.schemaName
        text =
          `<span style="color:#696969;">${this.viewDetail.schemaName}.</span>` +
          text
      }
      const centerHtml = `<div class="center-box1 table" style="width:${EACH_WIDTH}px;top:${CENTER_OFFSET}px">
            <div class="title oneline-eclipse" title="${title}"><i class="fa fa-map-marker"></i> ${text}</div></div>`
      container.append(centerHtml)
      let offset = 0
      this.tables.sort((a, b) => {
        if (a.name > b.name) {
          return 1
        } else {
          return -1
        }
      })
      this.tables.forEach(item => {
        let title = 'name: ' + item.name
        let text = item.name
        if (item.schema) {
          title += '\nschema: ' + item.schema
          text = `<span style="color:#696969;">${item.schema}.</span>` + text
        }
        let rightHtml = '<div class="right-box1 '
        rightHtml += this.$typeLabel[item.typeId]
        rightHtml += `" data-id="${item.tableId}" style="width:${EACH_WIDTH}px;top:${offset}px">
            <div class="title oneline-eclipse" title="${title}">${text}</div></div>`
        offset += EACH_HEIGHT + 20
        container.append(rightHtml)
      })
      container[0].style.height = TOTAL_HEIGHT + 5 + 'px'
      container.find('canvas').attr('height', TOTAL_HEIGHT + 5 + 'px')
      this.drawEdge(CENTER_OFFSET, EACH_WIDTH)
    },
    drawEdge(centerOffset, eachWidth) {
      const [LEFT, CENTER, RIGHT] = [
        $('.table.left-box'),
        $('.table.center-box1'),
        $('.table.right-box1'),
      ]
      const canvasObj = $('#table-view-graph').find('canvas')[0]
      this.ctx = canvasObj.getContext('2d')
      this.ctx.strokeStyle = '#696969'
      this.ctx.fillStyle = '#696969'
      this.ctx.beginPath()
      let [left, top, leftEnd, topEnd] = [eachWidth, centerOffset + 12, 300, 13]
      this.tables.forEach(t => {
        this.drawOneEdge(left, top, leftEnd, topEnd)
        topEnd += 25 + 20
      })
      this.ctx.stroke()
      //        this.ctx.
    },
    drawOneEdge(left, top, leftEnd, topEnd) {
      const ctx = this.ctx
      ctx.moveTo(left, top)
      ctx.arcTo(
        (left + leftEnd) / 2,
        top,
        (left + leftEnd) / 2,
        (top + topEnd) / 2,
        Math.min(60, Math.abs(topEnd - top) / 2)
      )
      ctx.arcTo(
        (left + leftEnd) / 2,
        topEnd,
        leftEnd,
        topEnd,
        Math.min(60, Math.abs(topEnd - top) / 2)
      )
      ctx.lineTo(leftEnd, topEnd)
      ctx.lineTo(leftEnd - 6, topEnd - 3)
      ctx.moveTo(leftEnd - 6, topEnd + 3)
      ctx.lineTo(leftEnd, topEnd)
    },
    put() {
      if (this.lineageIsLoaded) return
      this.loading = true
      this.alreadyPut = true
      this.$http
        .put(this.$meta_url + `/entities/views/${this.objectId}/tables`)
        .then(res => {
          if (!res.data) {
            this.loading = false
            return
          }
          //          this.getTables();
          this.$emit('lineageFromApiTables', res.data)
          this.tables = res.data.relatedTables
          this.draw()
          this.initEventListener()
          setTimeout(() => {
            this.loading = false
          })
          this.$message.success(this.$t('meta.DS.message.reAnalysised'))
        })
        .catch(e => {
          this.$showFailure(e)
        })
    },
    jumpToTable(object) {
      this.$bus.$emit('jumpToObject', {
        type: 'TABLE',
        object: object,
      })
    },
    initEventListener() {
      const self = this
      $('#table-view-graph .right-box1').on('click', function () {
        const dataId = $(this).attr('data-id')
        if (dataId !== 'null') {
          self.$bus.$emit('jumpToObject', {
            type: 'TABLE',
            object: { objectId: Number.parseInt(dataId) },
          })
        } else {
          self.$message.error(this.$t('meta.DS.message.notExistInMeta'))
        }
      })
    },
  },
}
