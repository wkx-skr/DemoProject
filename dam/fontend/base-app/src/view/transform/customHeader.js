import Vue from 'vue'
import columnar from './columnar.vue'
export default Vue.extend({
  template: `
        <div>
          <div class="row-select" @click="root.handleColumnClick(column,$event)"></div>
            <div v-if="params.enableMenu" ref="menuButton" class="customHeaderMenuButton" @click="onMenuClicked($event)"><i class="fa" :class="params.menuIcon"></i></div> 
            <div class="row-title">
              <span class="type">
                  <span v-if="column.logicalType==='Timestamp' || column.logicalType==='Time' || column.logicalType==='Date'"><i class="fa fa-calendar"></i></span>
                  <span v-else-if="column.logicalType==='Binary'"><i class="fa fa-btc"></i></span>
                  <span v-else-if="column.physicalType==='boolean'"><i class="fa fa-adjust"></i></span>
                  <span v-else-if="column.physicalType === 'string'">ABC</span>
                  <span v-else-if="column.physicalType === 'long'">#</span>
                  <span v-else-if="column.physicalType === 'double'">#.#</span>
                </span>
              <div class="customHeaderLabel label" @click="root.handleColumnClick(column,$event)">{{params.displayName}}</div> 
            </div>
            <div v-if="params.enableSorting" @click="onSortRequested('asc', $event)" :class="ascSort" class="customSortDownLabel"><i class="fa fa-long-arrow-alt-down"></i></div> 
            <div v-if="params.enableSorting" @click="onSortRequested('desc', $event)" :class="descSort" class="customSortUpLabel"><i class="fa fa-long-arrow-alt-up"></i></div> 
            <div v-if="params.enableSorting" @click="onSortRequested('', $event)" :class="noSort" class="customSortRemoveLabel"><i class="fa fa-times"></i></div>
            <div class="row-line"></div>
            <div class="row-gun">
              <columnar :data="{col:column,data:columnMap[column.label]}"></columnar>
            </div>
            
        </div>
    `,
  components: { columnar },
  data: function () {
    return {
      ascSort: null,
      descSort: null,
      noSort: null,
      columnMap: this.$parent.$parent.columnMap,
      column: {},
      root: this.$parent.$parent,
    }
  },
  beforeMount() {
    this.column = this.params.column.colDef
  },
  beforeDestroy() {
    this.params.column &&
      this.params.column.removeEventListener('sortChanged', this.onSortChanged)
  },
  mounted() {
    this.params.column.addEventListener('sortChanged', this.onSortChanged)
    this.onSortChanged()
  },
  methods: {
    onMenuClicked() {
      this.params.showColumnMenu(this.$refs.menuButton)
    },

    onSortChanged() {
      this.ascSort = this.descSort = this.noSort = 'inactive'
      if (this.params.column.isSortAscending()) {
        this.ascSort = 'active'
      } else if (this.params.column.isSortDescending()) {
        this.descSort = 'active'
      } else {
        this.noSort = 'active'
      }
    },

    onSortRequested(order, event) {
      this.params.setSort(order, event.shiftKey)
    },
  },
})
