#Vue Data Table

#Props
Props                       | Type              | Default             | Example or Details
------------                | -------------     | -------------       | ------------ 
headers                     | Array             | []                  | [{text: 'Header 1', value: h1}, {text: 'Header 2', value: h2}]
dataSource                  | Array             | []                  | [{h1: Hello, h2: 100}, {h1: World, h2: 200}]
actions                     | Array             | []                  | [{icon: 'fa-trash', title: 'delete', style: {cursor: 'pointer'}, emitFunction: this.deleteRow}]
bordered                    | Boolean           | true                | adds border to data table
borderColor                 | String            | 'black'             | sets border color
borderWidth                 | String            | '1px'               | sets border width
borderStyle                 | String            | 'solid'             | sets border style
columnLines                 | Boolean           | true                | adds lines separating each column
columnSearchFilter          | Boolean           | false               | allows the user to filter by using a search in the column header
enablePagination            | Boolean           | false               | adds page details and option to the bottom of the table row to bottom of data table
globalSearch                | Boolean           | false               | allows the user to filter entire grid by using a global search
height                      | String            | '500px'             | sets height of data table
includeSummaryRow           | Boolean           | false               | adds summary row to bottom of data table (functions are added to the headers array for each column)
initialPageSize             | Number            | 25                  | initial number of rows to show per page
inlineEditing               | Boolean           | false               | allows inline editing of dataSource element
pageSizeOptions             | Array             | [25, 50, 100]       | array of page size options to show at bottom of page
rowLines                    | Boolean           | true                | adds lines separating each row
sort                        | Boolean           | true                | allows columns to be sorted using a sort icon near the header text
summaryType                 | String            | 'All'               | determines if summary calcs should be done on all data or just the data on the current page. Options: ('All', 'All Filtered', 'Page') ...secretly though anything other than 'Page' will default to all summary
width                       | String            | '100%'              | sets width of data table
Cell Styles                 |                   |                     |  
cellBackgroundColor         | String            | 'traparent'         | sets ckground-color of cells
cellColor                   | String            | 'black'             | sets text color of cells
cellFontSize                | String            | '12px'              | sets font size of cells
cellHeight                  | String            | '24px'              |   sets height of cells
cellOverflow                | String            | 'hidden'            | sets overflow type of cells
cellPadding                 | String            | '5px'               | sets padding of cells
Header Styles               |                   |                     |  
headerFontSize              | String            | '16px'              | sets font size of headers
headerBackgroundColor       | String            | 'transparent'       | sets background-color of headers
headerColor                 | String            | 'black'             | sets text color of headers
headerHeight                | String            | '36px'              | sets height of headers
headerOverflow              | String            | 'hidden'            | sets overflow type of headers
headerPadding               | String            | '5px'               | sets padding of headers
Summary Styles              |                   |                     |  
summaryBackgroundColor      | String            | 'transparent'       | sets background-color of summary row
Search Styles               |                   |                     |  
searchWidth                 | String            | '100%'              | sets width of global search input

#Headers Array
```javascript
let headers = [{
  text: 'Header 1',
  value: 'h1',
  width: '500px',
  type: 'text',
  align: 'right',
  disableSort: false,
  summaryCalc: () => {return 'summary'}
}]
```
Object Values               | Type              | Default             | Details
------------                | -------------     | -------------       | ------------ 
align                       | String            | left                | sets the text-align of the column
disableSort                 | Boolean           | false               | disables sortability of column
text                        | String            | N/A                 | sets the display value of the column
type                        | String            | text                | options: 'text', 'number', 'usd', 'percent', 'actions'
value                       | String            | N/A                 | sets the value to be paired with dataSource properties
width                       | String            | N/A                 | sets the width of the column
summaryCalc                 | Function          | return null         | function to be called when determining the summary of the column (see example below)

#Header summaryCalc
The first parameter in the summaryCalc is always an array containing all values for the given summaryType ('All', 'All Filtered', 'Page') in the dataSource for the specified column

```javascript
let headers = [{
  text: 'Header 1',
  value: 'h1',
  summaryCalc: (array) => {
    return array.reduce((total,value) => {
      return total + value;
    })
  }
}]
```

you can also use methods defined in the script section of your vue template.

```javascript
let headers = [{
  text: 'Header 1',
  value: 'h1',
  summaryCalc: this.h1Calc
}]
```

```javascript
methods: {
  h1Calc(array){
    return array.reduce((total,value) => {
      return total + value;
    })
  }
}

```