<template>
  <div>
    <DataTable 
      :headers="headers" 
      :dataSource="dataSource" 
      :inlineEditing="true" 
      :actions="actions"
      :enable-pagination="true"
      :column-search-filter="true"
      summaryType="page"
      summaryBackgroundColor='lightgrey'
      headerBackgroundColor='lightgrey'
      cellColor='black'
      cellBackgroundColor='transparent'
      :include-summary-row="true"
      :global-search="true"/>
  </div>
</template>

<script>
import DataTable from './DataTable'
export default {
  components:{
    DataTable
  },
  data(){
    return {
      headers: [
        {text: 'Customer', value: 'customer', width: '500px', type: 'text', summaryFunction: () => {return 'Summary' }}, 
        {text: 'Age', align:'right', value: 'age', width: '75px', type: "number", summaryFunction: this.ageSummaryFunction},
        {text: 'Total Purchases', align:'right',disableSort: true, value: 'purchaseCount', type: 'number', summaryFunction: this.purchaseCountSummaryFunction},
        {text: 'Total Profit', align: 'right', type:'usd', value: 'totalProfit', summaryFunction: this.totalProfitSummaryFunction},
        {text: '', width: '75px', align: 'center', type:'actions'}],
      dataSource: [],
      actions: [{
        icon: 'fa fa-trash',
        title: 'delete',
        style: {cursor: 'pointer'},
        emitFunction: this.deleteRow
      }],
    }
  },
  methods: {
    deleteRow(row){
      let index = this.dataSource.map(item => item.id).indexOf(row.id)
      this.dataSource.splice(index, 1)
      console.log('row', row)
    },
    ageSummaryFunction(dataArray){
      let returnValue= dataArray.reduce((total,value) => {
        return total + Number(value);
      })
      return `Avg Age: ${Math.round((Number(returnValue) / dataArray.length))}`
    },
    totalProfitSummaryFunction(dataArray){
      let returnValue=0;
      dataArray.forEach(value => {
        returnValue += Number(value);
      })
      return `Total: $${(Number(returnValue)).toFixed(2)} - Avg $/customer:${(Number(returnValue)/dataArray.length).toFixed(2)}`
    },
    purchaseCountSummaryFunction(dataArray){
      let returnValue=0;
      dataArray.forEach(value => {
        returnValue += Number(value);
      })
      return `${(Number(returnValue)).toFixed(2)}`
    }
  },
  created(){
    let data = []
    for(let i=0; i < 1000; i++){
      if(i > 2){
        data.push({
          id: i,
          customer: 'Bob Smith - ' + i,
          age: Math.round(Math.random() * 100),
          purchaseCount: Math.round(Math.random() * 10),
          totalProfit: Math.random() * (Math.random() * 1000)
        })
      } else {
        data.push({
          id: i,
          customer: 'John Smith - ' + i,
          age: Math.round(Math.random() * 100),
          purchaseCount: Math.round(Math.random() * 10),
          totalProfit: Math.random() * (Math.random() * 1000)
        })
      }
      
      
    }
    this.dataSource = data;
  }
}
</script>

<style>

</style>