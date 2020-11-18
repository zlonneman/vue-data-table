<template>
  <div :style="getInactiveStyle" @click="setActive" class='data-cell'>
    {{!isActive ? `$${displayValue(value)}` : null}}
    <input 
      v-show="isActive"
      ref="input"
      class="data-cell--input"
      :style="inputStyleObject"
      :value="value"
      @input="validateNumberValueAndFormat"
      @blur="setInactive"
      @change="updateValue"/>

  </div>
</template>

<script>
export default {
  name: 'CellUSDInput',
  props: {
    value: {
      type: [Number, String],
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
      let roundedValue = Math.round(value*100)/100;
      let fixedValue = roundedValue.toFixed(2);
      return fixedValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
    validateNumberValueAndFormat($event){
      var parts = $event.target.value.toString().split(".");
      for(let i=0; i < parts.length; i++){
        parts[i] = parts[i].replace(/[^\d.]/g, '');
      }
      $event.target.value = parts.join(".");
    },
    updateValue($event){
      this.$emit('input', Number($event.target.value) )
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