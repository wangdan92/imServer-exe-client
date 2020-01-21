<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'wjw-im',
  beforeDestory(){
     let that=this;
     console.log("实例被销毁");
     that.$store.commit('closeConnect');
     that.$store.commit('clear');
  }
};
</script>
<style lang="scss">
  #app{
    position: relative;
  }
</style>

