<template>
  <MainTitle :title="store.loc('facts')" :callback="confirm"></MainTitle>
  <el-row type="flex" justify="center">
    <el-switch style="display: block;" v-model="sortMode" active-color="black" inactive-color="gray"
      :active-text="store.loc('bydate')" :inactive-text="store.loc('byts')" @change="changeSort">
    </el-switch>
  </el-row>

  <el-row v-for="(value, key) in facts" :gutter="20" :key="key">

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

const sortBy = (attr: string, order = 1) => (a: keyable, b: keyable) => a[attr] === b[attr] ? 0 : (Number(a[attr] < b[attr]) || -1) * order;

const loadFacts = async () => {
  const attr = sortMode.value ? 'stamp' : 'id';

  const result = await store.getData('facts');
  if ('data' in result && !('error' in result.data)) {
    if (Object.keys(result.data).length) {
      const sorted = result.data.sort(sortBy(attr));
      // console.log(attr, sorted);
      facts.value = sorted;
    } else {
      console.log('table is empty');
    }
  }
};

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
    const result = await store.postData('users', userData);
    // console.log('save prefs', result);
    await loadFacts();
  }
};

onBeforeMount(async () => {
  sortMode.value = Boolean(store.state.user?.prefs?.sorts?.['facts']);
  await loadFacts();
});

const confirm = () => {
  router.push('/fact');
};

</script>
