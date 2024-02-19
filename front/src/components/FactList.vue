<template>
  <MainTitle :title="loc('facts')" :callback="confirm"></MainTitle>
  <el-row type="flex" justify="center">
    <el-switch style="display: block;" v-model="sortMode" active-color="black" inactive-color="gray"
      :active-text="loc('bydate')" :inactive-text="loc('byts')" @change="changeSort">
    </el-switch>
  </el-row>

  <el-row v-for="(value, key) in facts" :gutter="20" :key="key">

    <el-col :span="4">
      <div class="grid-content bg-purple-light">
        <span :title="String(value.stamp)">{{ value.datedesc }}</span>
      </div>
    </el-col>

    <el-col :span="16">
      <div class="grid-content bg-purple">
        {{ value.title }}
      </div>
    </el-col>

    <el-col :span="4">
      <div class="grid-content bg-purple">
        <router-link :to="'/fact/' + value.id">
          <el-button type="" link size="small" icon="el-icon-edit" plain class="full-width"></el-button>
        </router-link>
      </div>
    </el-col>

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

const sortBy = (attr: string) => {
  return attr === 'id'
    ? (a: keyable, b: keyable) => {
      return b[attr] - a[attr];
    }
    : (a: keyable, b: keyable) => {
      return new Date(b[attr]) > new Date(a[attr]);
    };
};

const loadFacts = async () => {
  const attr = sortMode.value ? 'stamp' : 'id';
  const result = await store.getData('facts');
  // console.log(result);
  if ('data' in result && !('error' in result.data)) {
    if (Object.keys(result.data).length) {
      facts.value = result.data.sort(sortBy(attr));
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

const loc = store.loc;

</script>
