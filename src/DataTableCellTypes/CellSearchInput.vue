<template>
  <div :style="getInactiveStyle" @click="setActive" class='data-cell'>
    {{!isActive ? `${displayValue(value)}` : null}}
    <input 
      v-show="isActive"
      ref="input"
      class="data-cell--input"
      :style="inputStyleObject"
      :value="value"
      @blur="setInactive"
      @input="updateValue"/>

  </div>
</template>

<script>
export default {
  name: 'CellSearchInput',
  props: {
    value: {
      type: String,
      default: ''
    },
    inputStyleObject: {
      type: Object,
      default: () => {}
    },
    cellStyleObject: {
      type: Object,
      default: () => {}
    },
    headerType: {
      type: String,
      default: null
    },
    columnIndex: {
      type: Number,
      default: null
    }
  },
  data(){
    return {
      isActive: false,
      // timerId: null,
    }
  },
  methods: {
  // debounce(func, wait) {
  //   clearTimeout(this.timerId);
  //   this.timerId = setTimeout(func, wait)
  // },
  // updateValue($event){
  //   console.log('updateColumnSearchValue', $event.target.value, this.columnIndex)
  //   // this.columnDisplaySearchValues[this.columnIndex] = value;
  //   this.$emit('initialUpdateColumnSearchValue', $event.target.value, this.columnIndex)
  //   // this.loading = true;
  //   this.debounce(() => {
  //       this.$emit('debounceUpdateColumnSearchValue', this.columnIndex)
  //       // this.searchColumnFilterUpdateKey++;
  //       // this.columnSearchFilters[index] = this.columnDisplaySearchValues[index];
  //       // this.loading = false;
  //   }, 400)
  // },
    displayValue(value){
      return value;
    },
    setInactive(){
      
      this.isActive = false;
    },
    setActive(){
      if(this.headerType === 'actions') return;
      this.isActive = true;
      this.$nextTick(() => {
        this.$refs.input.focus()
      })
    },
    updateValue($event){
      this.$emit('input', $event.target.value, this.columnIndex)
    }
  },
  computed: {
    getInactiveStyle(){
      return !this.isActive ? this.cellStyleObject : null;
    }
  }
}
</script>

<style lang="scss" scoped>
  .data-cell{
    display: flex;
    flex-grow: 1;
    &--input{
      margin: 0px;
      background-color: transparent;
      padding: 0px;
      width: 100%;
      border: none;
    }
  }
</style>