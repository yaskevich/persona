<template>
  <div v-if="isLoaded">
    <el-descriptions class="margin-top" :title="loc('prodata')" :column="1" border style="max-width: 400px;">
      <el-descriptions-item>
        <template #label>
          {{ loc('persons') }}
        </template> {{ data.persons?.length }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <el-icon><el-icon-edit /></el-icon>
          {{ loc('works') }}
        </template> {{ data.works?.length }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <el-icon><el-icon-notebook /></el-icon>
          {{ loc('books') }}
        </template> {{ data.books?.length }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label>
          <el-icon><el-icon-watch /></el-icon>
          {{ loc('facts') }}
        </template> {{ data.facts?.length }}
      </el-descriptions-item>

      <el-descriptions-item v-if="data?.tokens">
        <template #label>
          <el-icon><el-icon-files /></el-icon>
          {{ loc('corpus') }}
        </template>
        <el-tooltip
        class="box-item"
        effect="dark"
        :content="(data.tokens).toLocaleString()"
        placement="top-start"
      >
      {{ formatter.format(data.tokens) }}
      </el-tooltip>
        
        
      </el-descriptions-item>


    </el-descriptions>
    <el-divider></el-divider>
    <el-row type="flex" justify="start">
      <el-space wrap>

        <el-button size="small" type="info" icon="el-icon-download" @click="download" />

        <el-tooltip class="item" effect="dark" :content="loc('webver')" placement="bottom">
          <el-tag>{{ store.version }}</el-tag>
        </el-tooltip>

        <el-tooltip class="item" effect="dark" :content="loc('apiver')" placement="bottom">
          <el-tag>{{ store.state?.user?.server }}</el-tag>
        </el-tooltip>

        <el-tooltip class="item" effect="dark" :content="loc('commithash')" placement="bottom" v-if="github">
          <span><el-link type="primary" :href="'https://github.com/yaskevich/persona/commit/' + github"
              target="_blank">{{
                github }}</el-link></span>
        </el-tooltip>
      </el-space>
    </el-row>
  </div>
  <div v-else>
    {{ loc('loading') }}
  </div>
</template>

<script setup lang="ts" x>
import { reactive, ref, onBeforeMount } from 'vue';
import store from '../store';
import * as converter from 'json-2-csv';

const data = reactive({} as keyable);
const loc = store.loc;
const github = store.state?.user?.commit;
const isLoaded = ref(false);

const formatter = Intl.NumberFormat('en', { notation: 'compact' });

const getName = (x: IPerson) => `${x?.firstname || ''} ${x?.lastname || ''}`;

const download = async () => {
  const dataSheet = data.facts.map((item: any) => {
    // console.log(data);

    const acts = item.acts.map((y: any) => data.acts.find((z: any) => z.id === y)?.title).join(', ');
    const agentInfo = data.persons.find((z: any) => z.id === item.agent);
    const agent = getName(agentInfo);
    const books = item.books?.map((y: any) => data.books.find((z: any) => z.id === y)?.title).join(', ') || '';

    const persons1 = item.persons1?.map((y: any) => getName(data.persons.find((z: any) => z.id === y))).join(', ')

    const persons2 = item.persons2?.map((y: any) => getName(data.persons.find((z: any) => z.id === y))).join(', ')

    return ({
      id: item.id, acts, agent, books, comment: item.comment, datedesc: item.datedesc, persons1, persons2, place: item.place, stamp: item.stamp, title: item.title
    });
  });

  // console.log(dataSheet);
  const csv = converter.json2csv(dataSheet, { emptyFieldValue: '', excludeKeys: ['snippet'] });
  const anchor = document.createElement("a");
  anchor.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  anchor.target = "_blank";
  anchor.download = `Pasternak${(new Date().toJSON().slice(0, 19).replaceAll('-', '_').replace('T', '-'))}.csv`;
  anchor.click();
};

onBeforeMount(async () => {
  const names = ['acts', 'persons', 'works', 'books', 'facts', 'tokens'] as Array<keyof IData>;
  (await Promise.all(names.map(async x => store.getData(x)))).forEach((x, i) => (data[names[i]] = x.data));
  isLoaded.value = true;
});

</script>
