<template>

  <el-row type="flex" justify="center">
    <el-space size="medium" :spacer="spacer">
      <h3>{{title}}</h3>
      <el-button v-if="callback" size="medium" type="info" plain @click="callback">{{text||loc('add')}}</el-button>
    </el-space>
  </el-row>

</template>

<script lang="ts">

  import { ElDivider } from 'element-plus';
  import { defineComponent, h } from 'vue';
  import store from '../store';

  export default defineComponent({
    props: {
      title: String,
      callback: Function,
      text: String,
    },

    setup() {
      return {
        spacer: h(ElDivider, { direction: 'vertical' }),
        loc: store.loc,
      };
    },
  });

</script>
