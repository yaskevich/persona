<template>
  <el-row type="flex" justify="center">
    <h3>
      {{ loc('userlog') }}
    </h3>
  </el-row>

  <el-row v-for="(value, key) in datum.logs" :gutter="20" :key="key">
    <el-col :span="6">
      <div class="grid-content bg-purple-light">
        {{ store.getLabel(datum.users[value.user_id]) }}
      </div>
    </el-col>
    <el-col :span="6">
      <div class="grid-content bg-purple">
        {{ store.dateToString(value.created) }}
      </div>
    </el-col>
    <el-col :span="4">
      <div class="grid-content bg-purple">
        {{ loc(value.table_name) }}
      </div>
    </el-col>
    <el-col :span="4">
      <div class="grid-content bg-purple">
        {{ store.classify(value) }}
      </div>
    </el-col>
    <el-col :span="4">
      <div class="grid-content">
        <router-link :to="'/log/' + value.id">
          <el-button type="primary" icon="el-icon-search" circle></el-button>
        </router-link>
      </div>
    </el-col>
  </el-row>

  <el-row type="flex" justify="center">
    <el-pagination layout="prev, pager, next" :total="total" :page-size="size" :default-page-size="size"
      :default-current-page="1" @update:current-page="updatePagination">
    </el-pagination>
  </el-row>
</template>

<script setup lang="ts">

import { reactive, onBeforeMount } from 'vue';
import store from '../store';

const datum = reactive({ users: [], logs: [] as Array<ILog> });
const total = store.state?.user?.stats?.logs;
const size = 30;
const loc = store.loc;

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
