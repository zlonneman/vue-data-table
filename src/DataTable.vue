<template>
  <div class="data-table-wrapper" >
    <link rel="stylesheet" 
        href="https://use.fontawesome.com/releases/v5.2.0/css/all.css" 
        integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ" 
        crossorigin="anonymous">
    <div v-if="globalSearch" class="search-input-container">
      <input class="search-input form-control" placeholder="Search" :value="displaySearchValue" @input="updateSearchValue">
    </div>
    <div class="table-container" :style="getTableContainerStyles()">
      <div class="loading-modal" v-show="loading"  :style="getLoadingModalStyles()">
        <div class="spinner-container">
          <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      </div>
      <div class="header-container" ref="header-container">
        <div v-for="(header, index) in headers" :key="'header-row-' + header.value" ref="header-row" :style="[getColumnStyles(header, index), {width: `${columnWidth[index]}%`}]" class="table-column">
          <div :style="getHeaderCellStyles(header)" @click="sortData(header)" class="header-cell">
            {{header.text}} 
            <!-- <p v-if="sort" :class="headerSorted === header.value ? 'sort-icon-selected' : 'sort-icon'"><i :class="headerSorted === header.value ? 'fa fa-arrow-down' : 'fa fa-arrow-up'"></i></p> -->
            <p v-if="sort && !header.disableSort && headerSorted === header.value && !sortAscend" class="sort-icon-selected"><i class="fa fa-caret-down"></i></p>
            <p v-if="sort && !header.disableSort && headerSorted === header.value && sortAscend" class="sort-icon-selected"><i class="fa fa-caret-up"></i></p>
            <p v-if="sort && !header.disableSort && headerSorted !== header.value" class="sort-icon"><i class="fa fa-caret-up"></i></p>
          </div>
          <cell-search-input 
            v-if="columnSearchFilter" 
            :value="columnDisplaySearchValues[index]" 
            :columnIndex="index" 
            :headerType="header.type" 
            @input="updateColumnSearchValue"
            :cellStyleObject="getDataCellStyles(header)" 
            :inputStyleObject="getDataCellInputStyles(header)" />
        </div>
      </div>
      <div class="data-container" @scroll="handleScroll" :key="dataTableUpdateKey" >
        <div v-for="(header,index) in headers" :key="'grid-row-' + header.value" :style="[getColumnStyles(header, index), {width: `${columnWidth[index]}%`}]" class="table-column">
          <!-- <div :style="getHeaderCellStyles(header)" class="header-cell">
            {{header.text}}
          </div> -->
          <template v-if="!inlineEditing">
            <div v-for="(row, rowIndex) in computedDataSource" :key="`row-${rowIndex}`" :style="getDataCellStyles(header)" class="data-cell">
                {{row[header.value]}}
            </div>
          </template>
          <template v-if="inlineEditing">
            <template v-if="!header.type || header.type.toLowerCase() === 'text'">
              <cell-text-input v-for="(row, rowIndex) in computedDataSource" :key="`row-${rowIndex}`" v-model="computedDataSource[rowIndex][header.value]" :cellStyleObject="getDataCellStyles(header)" :inputStyleObject="getDataCellInputStyles(header)" />
            </template>
            <template v-else-if="header.type.toLowerCase() === 'number'">
              <cell-number-input v-for="(row, rowIndex) in computedDataSource" :key="`row-${rowIndex}`" v-model="computedDataSource[rowIndex][header.value]" :cellStyleObject="getDataCellStyles(header)" :inputStyleObject="getDataCellInputStyles(header)" />
            </template>
            <template v-else-if="header.type.toLowerCase() === 'usd'">
              <cell-u-s-d-input v-for="(row, rowIndex) in computedDataSource" :key="`row-${rowIndex}`" v-model="computedDataSource[rowIndex][header.value]" :cellStyleObject="getDataCellStyles(header)" :inputStyleObject="getDataCellInputStyles(header)" />
            </template>
            <template v-else-if="header.type.toLowerCase() === 'usd'">
              <cell-percent-input v-for="(row, rowIndex) in computedDataSource" :key="`row-${rowIndex}`" v-model="computedDataSource[rowIndex][header.value]" :cellStyleObject="getDataCellStyles(header)" :inputStyleObject="getDataCellInputStyles(header)" />
            </template>
            <template v-else-if="header.type.toLowerCase() === 'actions'">
              <cell-actions v-for="(row, rowIndex) in computedDataSource" :key="`row-${rowIndex}`" :actions="actions" @iconClicked="iconClicked" :rowIndex="rowIndex" :actionStyleObject="getDataCellStyles(header)" />
            </template>
          </template>
        </div>
      </div>
      <div class="summary-container" ref="summary-container" :key="summaryTableUpdateKey" >
        <div v-for="(header, index) in headers" :key="'summary-row-' + header.value" :style="[getColumnStyles(header, index), {width: `${columnWidth[index]}%`}]" class="table-column">
          <div v-if="includeSummaryRow" :style="[getDataCellStyles(header), getSummaryCellStyles()]" class="data-cell">
            {{ getSummaryData(header)}}
          </div>
        </div>
      </div>
      <div v-if="enablePagination" class="pagination">
        <div class="page-size-selector">
          <div v-for="pageSizeOption in pageSizeOptions" :key="'page-size-' + pageSizeOption" @click="updatePageSize(pageSizeOption)" :class="pageSizeOption === pageSize ? 'selected-page-size': null" class='btn'>{{pageSizeOption}}</div>
        </div>
        
        <div class="page-selector">
          <div class="page-info-display">Page {{currentPage}} (of {{pageCount}})</div>
          <div class="page-info-display">(Count: {{searchFilteredDataSource.length}})</div>
          <div class="page-nav">
            <div class="btn" @click="firstPage">First</div>
            <div class="btn" @click="prevPage">-</div>
            <input class="current-page-input" @change="updatePageNumber" :value="currentPage"/>
            <div class="btn" @click="nextPage">+</div>
            <div class="btn" @click="lastPage">last</div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CellTextInput                           from './DataTableCellTypes/CellTextInput.vue';
import CellSearchInput                           from './DataTableCellTypes/CellSearchInput.vue';
import CellNumberInput                           from './DataTableCellTypes/CellNumberInput.vue';
import CellUSDInput                           from './DataTableCellTypes/CellUSDInput.vue';
import CellPercentInput                           from './DataTableCellTypes/CellPercentInput.vue';
import CellActions                           from './DataTableCellTypes/CellActions.vue';


export default {
name: 'DataTable',
components: {
  CellTextInput,
  CellSearchInput,
  CellNumberInput,
  CellUSDInput,
  CellPercentInput,
  CellActions
},
props: {
  headers: {
    type: Array,
    default: () => [],
  },
  dataSource: {
    type: Array,
    default: () => []
  },
  actions: {
    type: Array,
    default: () => []
  },
  inlineEditing: {
    type: Boolean,
    default: false,
  },
  includeSummaryRow: {
    type: Boolean,
    default: false,
  },
  summaryType:{
    type: String,
    default: 'All' //options: total or page
  },
  enablePagination: {
    type: Boolean,
    default: false,
  },
  initialPageSize: {
    type: Number,
    default: 25,
  },
  pageSizeOptions:{
    type: Array,
    default: () => [25, 50, 100]
  },
  sort:{
    type: Boolean,
    default: true
  },
  columnSearchFilter: {
    type: Boolean,
    default: false
  },
  bordered: {
    type: Boolean,
    default: true,
  },
  borderColor: {
    type: String,
    default: 'black'
  },
  borderWidth: {
    type: String,
    default: '1px'
  },
  borderStyle: {
    type: String,
    default: 'solid'
  },
  columnLines: {
    type: Boolean,
    default: true,
  },
  rowLines: {
    type: Boolean,
    default: true,
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '500px'
  },

  //Cell Styles
  cellFontSize: {
    type: String,
    default: '12px'
  },
  cellColor: {
    type: String,
    default: 'black'
  },
  cellBackgroundColor: {
    type: String,
    default: 'transparent'
  },
  cellPadding: {
    type: String,
    default: '5px'
  },
  cellHeight: {
    type: String,
    default: '24px'
  },
  cellOverflow:{
    type: String,
    default: 'hidden'
  },

  //Header Styles
  headerFontSize: {
    type: String,
    default: '16px'
  },
  headerColor: {
    type: String,
    default: 'black'
  },
  headerBackgroundColor: {
    type: String,
    default: 'transparent'
  },
  headerPadding: {
    type: String,
    default: '5px'
  },
  headerHeight: {
    type: String,
    default: '36px'
  },
  headerOverflow:{
    type: String,
    default: 'hidden'
  },

  //Summary Styles {
  summaryBackgroundColor: {
    type: String,
    default: 'lightGrey'
  },
  
  //Seach Styles
  globalSearch: {
    type: Boolean,
    default: false,
  },
  searchWidth: {
    type: String,
    default: '100%'
  }
  
},
provide: function(){
  return { parentHeaders: this.headers}
},
data(){
  return {
    dataTableUpdateKey:0,
    summaryTableUpdateKey: 1000,
    currentPage:1,
    pageSize: 0,
    columnWidth: [],
    searchFilter: '',
    columnSearchFilters: [],
    searchColumnFilterUpdateKey: 0,
    columnDisplaySearchValues: [],
    displaySearchValue: '',
    timerId: null,
    timerIdColumnSearch: null,
    loading: false,
    headerSorted: null,
    sortAscend: true,
  }
},
methods: {
  sortData(header){
    if(header.disableSort) return;
    if(header.value === this.headerSorted){
      this.sortAscend = !this.sortAscend;
    } else {
      this.sortAscend = false;
      this.headerSorted = header.value;
    }
  },
  iconClicked(emitFunction, rowIndex){
    emitFunction( this.computedDataSource[rowIndex])
  },
  debounceColumnSearch(func, wait) {
    clearTimeout(this.timerIdColumnSearch);
    this.timerIdColumnSearch = setTimeout(func, wait)
  },
  // debounceUpdateColumnSearchValue(index){
  //   // this.loading = true;
  //   this.searchColumnFilterUpdateKey++;
  //   this.columnSearchFilters[index] = this.columnDisplaySearchValues[index];
  //   // this.loading = false;
  // },
  // initialUpdateColumnSearchValue(value, index){
  //   this.columnDisplaySearchValues[index] = value;
  // },
  updateColumnSearchValue(value, index){
    console.log('updateColumnSearchValue', value, index)
    this.columnDisplaySearchValues[index] = value;
    this.loading = true;
    this.debounceColumnSearch(() => {
        this.searchColumnFilterUpdateKey++;
        this.columnSearchFilters[index] = this.columnDisplaySearchValues[index];
        this.loading = false;
    }, 400)
  },
  debounce(func, wait) {
    clearTimeout(this.timerId);
    this.timerId = setTimeout(func, wait)
  },
  updateSearchValue($event){
    this.displaySearchValue = $event.target.value;
    this.loading = true;
    this.debounce(() => {
        this.searchFilter = this.displaySearchValue;
        this.loading = false;
    }, 400)
  },
  updatePageSize(pageSize){
    this.pageSize = pageSize;
  },
  updatePageNumber($event){
    this.currentPage = $event.target.value;
  },
  firstPage(){
    this.currentPage = 1;
  }, 
  prevPage(){
    if(this.currentPage > 1) this.currentPage--;
  },
  nextPage(){
    if(this.currentPage < this.pageCount) this.currentPage++;
  },
  lastPage(){
    this.currentPage = this.pageCount;
  },
  updateDataTable(){
    this.dataTableUpdateKey++;
    this.summaryTableUpdateKey++;
  },
  getJustification(alignment){
    switch(alignment){
      case 'right':
        return 'flex-end';
        // break;
      case 'left':
        return 'flex-start';
        // break;
      case 'center':
        return 'center';
        // break;
      default:
        return 'flex-start';
        // break;
    }
  },
  getDataCellStyles(header){
    let styles = {};
    let styleElements = ['align']
    styleElements.forEach((element) => {
      if(element === 'align'){
        styles['justify-content'] = this.getJustification(header[element])
      }

    })
    styles['overflow'] = this.cellOverflow;
    styles['font-size'] = this.cellFontSize;
    styles['color'] = this.cellColor;
    styles['background-color'] = this.cellBackgroundColor;
    styles['min-height'] = this.cellHeight;
    styles['max-height'] = this.cellHeight;
    styles['padding'] = this.cellPadding;
    styles['align-items'] = 'center';
    styles['border-bottom-style'] = this.rowLines ? this.borderStyle : 'none';
    styles['border-bottom-width'] = this.rowLines ? this.borderWidth : 'none';
    styles['border-bottom-color'] = this.rowLines ? this.borderColor : 'none';
    styles['border-right-style'] = this.columnLines ? this.borderStyle : 'none';
    styles['border-right-width'] = this.columnLines ? this.borderWidth : 'none';
    styles['border-right-color'] = this.columnLines ? this.borderColor : 'none';
    // console.log('data-cell styles', styles);
    return styles;
  },
  getDataCellInputStyles(header){
    let styles = {};
    let styleElements = ['align']
    styleElements.forEach((element) => {
      if(element === 'align'){
        styles['text-align'] = header[element] ? header[element] : 'left'
      }
    })
    styles['overflow'] = this.cellOverflow;
    styles['font-size'] = this.cellFontSize;
    styles['color'] = this.cellColor;
    styles['background-color'] = this.cellBackgroundColor;
    styles['min-height'] = this.cellHeight;
    styles['max-height'] = this.cellHeight;
    styles['padding'] = this.cellPadding;
    styles['align-items'] = 'center';
    styles['border-bottom-style'] = this.rowLines ? this.borderStyle : 'none';
    styles['border-bottom-width'] = this.rowLines ? this.borderWidth : 'none';
    styles['border-bottom-color'] = this.rowLines ? this.borderColor : 'none';
    styles['border-right-style'] = this.columnLines ? this.borderStyle : 'none';
    styles['border-right-width'] = this.columnLines ? this.borderWidth : 'none';
    styles['border-right-color'] = this.columnLines ? this.borderColor : 'none';
    // console.log('data-cell styles', styles);
    return styles;
  },
  getHeaderCellStyles(header){
    let styles = {};
    let styleElements = ['align']
    styleElements.forEach((element) => {
      if(element === 'align'){
        styles['justify-content'] = this.getJustification(header[element])
      }
    })
    styles['overflow'] = this.headerOverflow;
    styles['font-size'] = this.headerFontSize;
    styles['color'] = this.headerColor;
    styles['background-color'] = this.headerBackgroundColor;
    styles['min-height'] = this.headerHeight;
    styles['max-height'] = this.headerHeight;
    styles['padding'] = this.headerPadding;
    styles['align-items'] = 'center';
    styles['border-bottom-style'] = this.rowLines ? this.borderStyle : 'none';
    styles['border-bottom-width'] = this.rowLines ? this.borderWidth : 'none';
    styles['border-bottom-color'] = this.rowLines ? this.borderColor : 'none';
    styles['border-right-style'] = this.columnLines ? this.borderStyle : 'none';
    styles['border-right-width'] = this.columnLines ? this.borderWidth : 'none';
    styles['border-right-color'] = this.columnLines ? this.borderColor : 'none';
    // console.log('header-cell styles', styles);
    return styles;
  },
  getColumnStyles(header){
    let styles = {};
    styles['min-width'] = '100px'
    if(header['width']){
      styles['min-width'] = header['width'];
      styles['max-width'] = header['width'];
    }
    return styles;
  },
  getContainerStyles(){
    let styles = {};
    styles['width'] = this.width;
    styles['height'] = this.height;
    styles['border-style'] = this.bordered ? this.borderStyle : 'none';
    styles['border-width'] = this.bordered ? this.borderWidth : 'none';
    styles['border-color'] = this.bordered ? this.borderColor : 'none';
    // console.log('table-contianer styles', styles);
    return styles;
  },
  getSearchContainerStyles(){
    let styles = {};
    styles['width'] = this.searchWidth;
    return styles;
  },
  getSummaryCellStyles(){
    let styles = {};
    styles['background-color'] = this.summaryBackgroundColor;
    styles['border-top-style'] = this.rowLines ? this.borderStyle : 'none';
    styles['border-top-width'] = this.rowLines ? this.borderWidth : 'none';
    styles['border-top-color'] = this.rowLines ? this.borderColor : 'none';
    // console.log('table-contianer styles', styles);
    return styles;
  },
  getTableContainerStyles(){
    let styles = {};
    styles['width'] = this.width;
    styles['height'] = this.height;
    styles['border-style'] = this.bordered ? this.borderStyle : 'none';
    styles['border-width'] = this.bordered ? this.borderWidth : 'none';
    styles['border-color'] = this.bordered ? this.borderColor : 'none';
    // console.log('table-contianer styles', styles);
    return styles;
  },
  getLoadingModalStyles(){
    let styles = {};
    styles['height'] = this.height;
    return styles;
  },
  getSummaryData(header){
    let data = this.summaryType.toLowerCase() === 'page' ? this.computedDataSource : this.dataSource;
    let arrayOfColumnValues = data.map((row) => {
      return row[header.value]  
    })
    let columnSummary = header.summaryFunction ? header.summaryFunction(arrayOfColumnValues) : '';
    return columnSummary;
  },
  handleScroll (event) {
    // console.log('style',this.$refs['header-container'].style)
    this.$refs['header-container'].style.marginLeft = `-${event.target.scrollLeft}px`;
    this.$refs['summary-container'].style.marginLeft = `-${event.target.scrollLeft}px`;
    this.$refs['header-container'].style.marginRight = `${event.target.scrollLeft}px`;
    this.$refs['summary-container'].style.marginRight = `${event.target.scrollLeft}px`;
  }
},
computed: {
  columnSearchFilteredDataSource(){
    console.log('in filter')
    if(!this.searchColumnFilterUpdateKey) return this.dataSource;
    let filteredDataSource = this.dataSource;
    this.columnSearchFilters.forEach((searchFilter,index) => {
      console.log('search filter', searchFilter)
      if(!searchFilter) return filteredDataSource
      filteredDataSource = filteredDataSource.filter(row => {
        let rowIncludesInstanceOfSearchFilter = false;
        if(!this.headers[index]) return false;
        // this.headers.forEach(header => {
          if(this.headers[index].type.toLowerCase() === 'actions') return false;
          let dataToCheck = row[this.headers[index].value];
          if(typeof(dataToCheck) !== 'string'){
            dataToCheck = dataToCheck.toString();
          }
          dataToCheck = dataToCheck.toLowerCase();
          if(dataToCheck && dataToCheck.includes(searchFilter.toLowerCase())){
            rowIncludesInstanceOfSearchFilter = true;
            return true;
          }
        // })
        return rowIncludesInstanceOfSearchFilter;
      })
    })
    
    return filteredDataSource;
  },
  searchFilteredDataSource(){
    console.log('in filter search', this.columnSearchFilteredDataSource)
    if(!this.searchFilter) return this.columnSearchFilteredDataSource;
    let filteredDataSource = this.columnSearchFilteredDataSource.filter(row => {
      let rowIncludesInstanceOfSearchFilter = false;
      if(!this.headers) return false;
      this.headers.forEach(header => {
        if(header.type.toLowerCase() === 'actions') return false;
        let dataToCheck = row[header.value];
        if(typeof(dataToCheck) !== 'string'){
          dataToCheck = dataToCheck.toString();
        }
        dataToCheck = dataToCheck.toLowerCase();
        if(dataToCheck && dataToCheck.includes(this.searchFilter.toLowerCase())){
          rowIncludesInstanceOfSearchFilter = true;
          return true;
        }
      })
      return rowIncludesInstanceOfSearchFilter;
    })
    return filteredDataSource;
  },
  sortedDataSource(){
    if(!this.sort || !this.headerSorted) return this.searchFilteredDataSource;
    let data = [...this.searchFilteredDataSource];
    let x = this.headerSorted;
    let ascend = this.sortAscend;
    let sortedData = data.sort(function(a, b) {
      let textA = typeof(a[x])=== 'string' ? a[x].toUpperCase() : a[x];
      let textB = typeof(b[x])=== 'string' ? b[x].toUpperCase() : b[x];
      if(ascend){
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      } else {
        return (textA > textB) ? -1 : (textA <textB) ? 1 : 0;
      }
    });
    return sortedData;
  },
  computedDataSource(){
    let startingNumber = (this.currentPage-1)*this.pageSize;
    let endingNumber = startingNumber + this.pageSize;
    let sortedDataSource = this.sortedDataSource;
    
    return sortedDataSource.slice(startingNumber, endingNumber)
  },
  pageCount(){
    return Math.ceil(this.dataSource.length / this.pageSize)
  }
},
mounted(){
  let totalWidth = 0
  this.$refs['header-row'].forEach(header => {
    this.columnWidth.push(header.firstChild.clientWidth);
    totalWidth += header.firstChild.clientWidth;
  })
  this.columnWidth = this.columnWidth.map(column => {
    return (column / totalWidth) * 100
  })
  this.updateDataTable();
},
created(){
  this.pageSize=this.enablePagination ? this.initialPageSize : this.dataSource.length;
  for(let i=0; i<this.headers.length; i++){
    this.columnDisplaySearchValues.push('');
    this.columnSearchFilters.push('');
  }
}

}
</script>
<style lang="scss" scoped>

.data-table-wrapper{
  background-color: lightgrey;
  padding: 5px;
  .search-input-container{
    margin: 5px 0px;
    display: flex;
    .search-input{
      flex-grow: 1;
    }
  }
  .table-container{
    display: flex;
    flex-direction: column;
    border-color: blue;
    background-color: lighten(rgb(178, 178, 178), 20);
    white-space: nowrap;
    overflow: hidden;
    .loading-modal {
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: lightgrey;
      opacity: .75;
      width: 100%;
      // width: calc(100% - 32px);
      z-index: 12000;
    }
    .spinner-container {
      text-align: center;
    }
    .spinner-border {
      color: blue;
    }
    .header-container{
      display: flex;
      flex-direction: row;
      display: absolute;
      .table-column{
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        // white-space: nowrap;
        .header-cell {
          display: flex;
          flex-grow: 1;
          .sort-icon{
            margin: 0px;
            margin-left: 5px;
            color: transparent;
            cursor: pointer;
            :hover{
              color: grey;
            }
            &-selected{
              color: black;
              cursor: pointer;
              margin: 0px;
              margin-left: 5px;
            }
            
          }
        }
      }
    }
    .data-container{
      overflow-y: scroll;
      overflow-x: visible;
      display: flex;
      flex-grow: 1;
      white-space: nowrap;
      
      .table-column{
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        // white-space: nowrap;
        // .header-cell {
        //   display: flex;
        //   flex-grow: 1;
        // }
        .data-cell {
          display: flex;
          flex-grow: 0;
          &--input{
            margin: 0px;
            padding: 0px;
            width: 100%;
            border: none;
          }
        }
      }
    }
    .summary-container{
      display: flex;
      width: 100%;  
      // flex-grow: 1;
      // background-color: lighten(rgb(178, 178, 178), 20);
      .table-column{
        display: flex;
        // background-color: lighten(rgb(178, 178, 178), 20);
        flex-direction: column;
        flex-grow: 1;
        white-space: nowrap;
        .data-cell {
          background-color: lighten(rgb(178, 178, 178), 20);
          display: flex;
          flex-grow: 1;
        }
      }
    }
    .pagination{
      display: flex;
      justify-content: space-between;
      margin: 2px;
      .btn{
        margin: 5px;
        cursor: pointer;
      }
      .btn:hover{
        background-color: rgb(178, 178, 178);
        color: white;
        // border: solid 1px rgb(178, 178, 178);
      }
      .page-size-selector{
        display:flex;
        .selected-page-size{
          background-color: rgb(178, 178, 178);
          color: white;
        }
      }
      
      .page-selector{
        display: flex;
        align-items: center;
        justify-content: center;
        .page-info-display{
          margin-right: 20px;
        }
        .page-nav{
          display: flex;
          // .btn{
          //   margin: 0px 2px;
          // }
          .current-page-input{
            max-width: 40px;
            margin: 10px 0px;
            text-align: right;
            border-color: rgb(178, 178, 178);
            background-color: lighten(rgb(178, 178, 178), 35)
          }
        }
      }
    }
  }
  }
</style>