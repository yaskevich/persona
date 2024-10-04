<template>
  <el-row type="flex" justify="center">
    <h3>
      {{ loc('userlog') }}
    </h3>
  </el-row>

  <el-row v-for="(value, key) in datum.logs" :gutter="70" :key="key">

    <el-col :span="8">
      <el-space>
        <el-icon>
          <component :is="icons[store.classify(value)]" />
        </el-icon>

        <el-tag disable-transitions size="large" type="info">
          {{ loc(value.table_name) }}
        </el-tag>
      </el-space>
    </el-col>

    <el-col :span="8">
      <el-tag disable-transitions type="warning" size="large">
        {{ store.getLabel(datum.users[value.user_id]) }}
      </el-tag>
    </el-col>

    <el-col :span="8">
      <el-button type="primary" plain @click="router.push('/log/' + value.id)">{{ store.dateToString(value.created)
      }}</el-button>
    </el-col>

  </el-row>

  <el-row type="flex" justify="center">
    <el-pagination layout="prev, pager, next" :total="total" :page-size="size" :default-page-size="size"
      :default-current-page="1" @update:current-page="updatePagination" />
  </el-row>
</template>

<script setup lang="ts">

import { reactive, onBeforeMount } from 'vue';
import store from '../store';
import router from '../router';

const datum = reactive({ users: [], logs: [] as Array<ILog> });
const total = store.state?.user?.stats?.logs;
const size = 30;
const loc = store.loc;
const icons = {
  'change': 'el-icon-editpen',
  'creation': 'el-icon-circleplus',
  'removal': 'el-icon-remove'
};
onBeforeMount(async () => {
  await store.getUser(); // update stats
  await store.getDataMulti(datum, { users: 'id' }, {}, { logs: [0, size] });
});

const updatePagination = async (e: number) => {
  // console.log('page', e);
  const { data } = await store.getData('logs', undefined, [(e - 1) * size, size]);
  datum.logs = data;
};

</script>
