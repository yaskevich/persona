<template>
  <div v-if="isLoaded">
    <el-descriptions class="margin-top" :title="loc('prodata')" :column="1" border style="max-width: 400px;">
      <el-descriptions-item>
        <template #label>
          <el-icon><el-icon-user /></el-icon>
          {{ loc('persons') }}
        </template> {{ data.persons }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <el-icon><el-icon-edit /></el-icon>
          {{ loc('works') }}
        </template> {{ data.works }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <el-icon><el-icon-notebook /></el-icon>
          {{ loc('books') }}
        </template> {{ data.books }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <el-icon><el-icon-watch /></el-icon>
          {{ loc('facts') }}
        </template> {{ data.facts }}
      </el-descriptions-item>
    </el-descriptions>
    <el-divider></el-divider>
    <el-row type="flex" justify="start">
      <el-space wrap>

        <el-tooltip class="item" effect="dark" :content="loc('webver')" placement="bottom">
          <el-tag>{{ store.version }}</el-tag>
        </el-tooltip>

        <el-tooltip class="item" effect="dark" :content="loc('apiver')" placement="bottom">
          <el-tag>{{ store.state?.user?.server }}</el-tag>
        </el-tooltip>

        <el-tooltip class="item" effect="dark" :content="loc('commithash')" placement="bottom" v-if="github">
          <span><el-link type="primary" :href="'https://github.com/yaskevich/persona/commit/' + github" target="_blank">{{
            github }}</el-link></span>
        </el-tooltip>
      </el-space>
    </el-row>
  </div>
  <div v-else>
    {{ loc('loading') }}
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onBeforeMount } from 'vue';
import store from '../store';

const data = reactive({} as IData);
const loc = store.loc;
const github = store.state?.user?.commit;
const isLoaded = ref(false);

onBeforeMount(async () => {
  const names = ['persons', 'works', 'books', 'facts'] as Array<keyof IData>;
  (await Promise.all(names.map(async x => store.getData(x)))).forEach((x, i) => (data[names[i]] = x.data.length));
  isLoaded.value = true;
});

</script>
