<template>
  <MainTitle :title="store.loc('work') + ' ' + $route.params.id" :callback="confirm"
    :text="work.id ? store.loc('save') : store.loc('add')">
  </MainTitle>

  <el-form :model="work" ref="formRef" label-width="4rem" :rules="rules" v-if="isLoaded">

    <el-form-item prop="title" :label="store.loc('title')">
      <el-input :placeholder="store.loc('title')" v-model="work.title" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="genre" :label="store.loc('genre')">
      <el-select v-model="work.genre" filterable :placeholder="store.loc('genre')">
        <el-option v-for="item in genres" :key="item.id" :label="item.title" :value="item.id" />
      </el-select>
    </el-form-item>

    <el-form-item :label="store.loc('authors')">
      <el-space wrap>
        <el-select v-model="work.authors" filterable multiple :placeholder="store.loc('authors')"
          class="wide-select"><el-option v-for="item in persons" :key="item.id" :label="store.getLabel(item)"
            :value="item.id" />
        </el-select>

        <el-button type="primary" @click="setDefaultAuthor" v-if="persons.length && mainperson">{{ store.loc('author')
          }}
          &ndash; {{ store.getLabel(persons.filter(x => x.id === mainperson)[0]) }}</el-button>
      </el-space>
    </el-form-item>

    <!-- <el-button type="primary" @click="resetForm">{{store.loc('reset')}}</el-button> -->
    <!-- <el-form-item>
      <el-button type="primary" @click="confirm">{{ store.loc('save') }}</el-button>
    </el-form-item> -->

    <template v-if="relBooks?.length || relFacts?.length">
      <el-form-item :label="store.loc('books')" v-if="relBooks?.length">
        <el-space wrap>
          <el-button size="small" type="warning" v-for="(value, key) in relBooks" :key="key"
            @click="$router.push('/book/' + value.id)">{{ value.title }}</el-button>
        </el-space>
      </el-form-item>
      <el-form-item :label="store.loc('facts')" v-if="relFacts?.length">
        <el-space wrap>
          <el-button size="small" type="warning" v-for="(value, key) in relFacts" :key="key"
            @click="$router.push('/fact/' + value.id)">{{ value.datedesc }}</el-button>
        </el-space>
      </el-form-item>
    </template>

    <el-form-item v-else>
      <el-popconfirm v-if="work?.id" :title="store.loc('confirmdel')" :confirmButtonText="store.loc('yes')"
        :cancelButtonText="store.loc('no')" @confirm="deleteWork">

        <template #reference>
          <el-button type="danger">{{ store.loc('remove') }}</el-button>
        </template>
      </el-popconfirm>
    </el-form-item>

  </el-form>

</template>

<script setup lang="ts">

import { ElForm } from 'element-plus';
import { ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import store from '../store';
import { useRoute } from 'vue-router';
import router from '../router';
import MainTitle from './MainTitle.vue';

const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
const work = ref({} as IWork);
const works = reactive([] as Array<IWork>);
const genres = reactive([] as Array<IGenre>);
const persons = ref([] as Array<IPerson>);
const vuerouter = useRoute();
const id = String(vuerouter.params.id);

const relBooks = ref([] as Array<IBook>);
const relFacts = ref([] as Array<IFact>);

const isLoaded = ref(false);

onBeforeMount(async () => {
  // console.log('router id', id);
  if (id) {
    const { data } = await store.getData('works', id);
    if (data) {
      work.value = data[0];
      // console.log('this work', work.value);
    }
    const booksData = await store.getData('books', { 'works': id });
    relBooks.value = booksData.data;

    const factsData = await store.getData('facts', { 'works': id });
    relFacts.value = factsData.data;

  }

  const resultWorks = await store.getData('works');
  if ('data' in resultWorks) {
    works.push(...resultWorks.data);
  }

  const personsData = await store.getData('persons');
  persons.value = personsData.data.map((x: IPerson) => ({ ...x, value: x.firstname + ' ' + x.lastname }));
  // console.log(persons);

  const genresData = await store.getData('genres');
  if ('data' in genresData) {
    genres.push(...genresData.data);
  }
  isLoaded.value = true;
});

// const resetForm = () => {
//   formRef.value?.resetFields();
// };

const mainperson = store?.state?.user?.settings.mainperson;

const setDefaultAuthor = () => mainperson ? work.value.authors = [mainperson] : [];

const confirm = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      const result = await store.postData('works', work.value);
      /* console.log(result); */
      if ('data' in result && 'id' in result.data) {
        router.push('/works');
      } else {
        console.log('error!');
      }
    } else {
      return false;
    }
  });
};

const deleteWork = async () => {
  // console.log(work.value.id);
  const result = await store.deleteById('works', work.value.id);
  if ('data' in result && 'id' in result.data) {
    router.push('/works');
  }
};

const rules = {
  title: [
    {
      required: true,
      message: store.loc('fieldnonempty'),
      trigger: 'blur',
    },
    { min: 2, message: store.loc('fieldnonempty'), trigger: 'blur' },
  ],
};

</script>
