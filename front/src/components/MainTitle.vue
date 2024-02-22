<template>
  <el-row type="flex" justify="center">
    <el-space size="default" :spacer="spacer">
      <h3>{{ title }}</h3>
      <el-button v-if="callback" size="default" type="info" plain @click="callback()">{{ text || store.loc('add') }}</el-button>
    </el-space>
  </el-row>
</template>

<script setup lang="ts">

import { ElDivider } from 'element-plus';
import { h } from 'vue';
import store from '../store';

defineProps<{
  title: string,
  callback: Function,
  text?: string,
}>();


const spacer = h(ElDivider, { direction: 'vertical' });

</script>
