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
      @change="updateValue"/>

  </div>
</template>

<script>
export default {
  name: 'CellTextInput',
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
    }
  },
  data(){
    return {
      isActive: false
    }
  },
  methods: {
    displayValue(value){
      return value;
    },
    setInactive(){
      this.isActive = false;
    },
    setActive(){
      this.isActive = true;
      this.$nextTick(() => {
        this.$refs.input.focus()
      })
    },
    updateValue($event){
      this.$emit('input', $event.target.value)
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