<template>
  <MainTitle :title="store.loc('facts')" :callback="confirm"></MainTitle>
  <el-divider class="tools">
    <el-button type="primary" :icon="showTools ? 'el-icon-minus' : 'el-icon-plus'" link @click="showTools = !showTools" />
  </el-divider>
  <template v-if="showTools">
    <el-row type="flex" justify="center">
      <el-switch style="display: block;" v-model="sortMode" active-color="black" inactive-color="gray"
        :active-text="store.loc('bydate')" :inactive-text="store.loc('byts')" @change="changeSort">
      </el-switch>
    </el-row>
    <el-row type="flex" justify="center">
      <el-slider v-model="range" range :min="min" :max="max" />
    </el-row>
  </template>

  <el-row
    v-for="(value, key) in facts.filter((x: IFact) => (x!.stamp as any)!.slice(0, 4) >= range[0] && (x!.stamp as any)!.slice(0, 4) <= range[1])"
    :gutter="20" :key="key">

    <el-col :span="8">
      <el-text :title="String(value.stamp)">
        {{ value.datedesc }}
      </el-text>
    </el-col>

    <el-col :span="16">
      <router-link :to="'/fact/' + value.id">
        <el-text truncated>
          {{ value.title }}
        </el-text>
      </router-link>

    </el-col>

    <!-- <el-col :span="4">
      <div class="grid-content bg-purple">
      </div>
    </el-col> -->

  </el-row>
</template>

<script setup lang="ts">

import { ref, onBeforeMount } from 'vue';
// import { ElForm } from 'element-plus';
import router from '../router';
import store from '../store';
import MainTitle from './MainTitle.vue';

const sortMode = ref(false);
const facts = ref([] as Array<IFact>);
const min = 1880;
const max = 1980;
const showTools = ref(false);

const range = ref([min, max])
const sortBy = (attr: string, order = 1) => (a: keyable, b: keyable) => a[attr] === b[attr] ? 0 : (Number(a[attr] < b[attr]) || -1) * order;

// const updateRange = (value: Arrayable<number>) => {
//   console.log(value);
// }

const changeSort = async () => {
  if (store?.state?.user) {
    if (store?.state?.user?.prefs) {
      if (store.state.user.prefs.sorts) {
        store.state.user.prefs.sorts['facts'] = sortMode.value;
      } else {
        store.state.user.prefs = { sorts: { facts: sortMode.value } };
      }
    } else {
      store.state.user['prefs'] = { sorts: { facts: sortMode.value } };
    }
    const userData = { id: store?.state?.user?.id, prefs: store?.state?.user?.prefs };
    await store.postData('users', userData);
    const attr = sortMode.value ? 'stamp' : 'id';
    facts.value = facts.value.sort(sortBy(attr));
  }
};

onBeforeMount(async () => {
  sortMode.value = Boolean(store.state.user?.prefs?.sorts?.['facts']);
  const attr = sortMode.value ? 'stamp' : 'id';

  const result = await store.getData('facts');
  if ('data' in result && !('error' in result.data)) {
    if (Object.keys(result.data).length) {
      const sorted = sortMode.value ? result.data.sort(sortBy(attr)) : result.data;
      // console.log(attr, sorted);
      facts.value = sorted;
    } else {
      console.log('table is empty');
    }
  }

});

const confirm = () => {
  router.push('/fact');
};

</script>
