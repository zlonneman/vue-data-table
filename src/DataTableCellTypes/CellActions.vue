<template>
  <div>
    <link rel="stylesheet" 
        href="https://use.fontawesome.com/releases/v5.2.0/css/all.css" 
        integrity="sha384-hWVjflwFxL6sNzntih27bfxkr27PmbbK/iSvJ+a4+0owXq79v+lsFkW54bOGbiDQ" 
        crossorigin="anonymous">
    <div  class='data-cell' :style="actionStyleObject">
      <div v-for="(action, index) in actions" :key="'action-' + index" @click="handleIconClick(action.emitFunction)" class="action-icon" :style="action.style">
        <i :class="action.icon" :title="action.title" aria-hidden="true"></i>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CellActions',
  props: {
    actions: {
      type: Array,
      default: () => []
    },
    actionStyleObject: {
      type: Object,
      default: () => {}
    },
    rowIndex:{
      type: Number,
      default: null
    }
  },
  data(){
    return {
    }
  },
  methods: {
    handleIconClick(emitFunction){
      this.$emit('iconClicked', emitFunction, this.rowIndex)
    }
  },
  
  computed: {
  }
}
</script>

<style lang="scss" scoped>
  .data-cell{
    display: flex;
    flex-grow: 1;
    .action-icon{
      margin-left: 5px;
      cursor: pointer;
    }
  }
</style>