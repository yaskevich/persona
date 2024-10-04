<template>
  <MainTitle :title="loc('book') + ' ' + vuerouter.params.id" :callback="confirm" :text="loc(form.id ? 'save' : 'add')">
  </MainTitle>

  <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
    <el-form-item prop="title" :label="loc('title')">
      <el-input :placeholder="loc('title')" v-model="form.title" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="published" :label="loc('year')">
      <el-input :placeholder="loc('year')" v-model.number="form.published" class="text-input"></el-input>
    </el-form-item>

    <el-form-item :label="loc('works')">
      <el-select-v2 v-model="form.works" multiple filterable remote reserve-keyword :placeholder="loc('work')"
        :options="worksAll" :props="{ label: 'title', value: 'id' }">
        <!-- <el-option v-for="item in worksAll" :key="item.id" :label="item.title" :value="item.id"> -->
        <!-- </el-option> -->
      </el-select-v2>
    </el-form-item>

    <el-form-item :label="loc('editors')">
      <el-select v-model="form.editors" multiple filterable remote reserve-keyword :placeholder="loc('person')"
        :remote-method="getEditors" :loading="loading">
        <el-option v-for="person in editorsAll" :key="person.id" :label="store.getLabel(person)" :value="person.id">
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item :label="store.loc('facts')" v-if="relFacts?.length">
      <el-space wrap>
        <el-button size="small" type="warning" v-for="(value, key) in relFacts" :key="key"
          @click="router.push('/fact/' + value.id)">{{ value.datedesc }}</el-button>
      </el-space>
    </el-form-item>

    <el-form-item v-else>
      <el-popconfirm v-if="form?.id" :title="loc('confirmdel')" :confirmButtonText="loc('yes')"
        :cancelButtonText="loc('no')" @confirm="deleteBook">
        <template #reference>
          <el-button type="danger">{{ loc('remove') }}</el-button>
        </template>
      </el-popconfirm>
    </el-form-item>
    <!--
       <el-button type="primary" @click="resetForm">{{loc('reset')}}</el-button>
          <el-button type="primary" @click="confirm">{{loc(form.id ? 'save': 'add')}}</el-button>
      -->
  </el-form>

</template>

<script setup lang="ts">

import { ref, onBeforeMount } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElForm } from 'element-plus';
import store from '../store';
import router from '../router';
import { useRoute } from 'vue-router';
import MainTitle from './MainTitle.vue';

const formRef = ref<FormInstance>();
const form = ref({ title: '', published: '', editors: [], works: [], id: null });
const worksAll = ref([] as Array<IWork>);
let persons = [] as Array<IPerson>;
const loading = ref(false);
const editorsAll = ref([] as Array<IPerson>);
const vuerouter = useRoute();
const id = String(vuerouter.params.id);
const relFacts = ref([] as Array<IFact>);


onBeforeMount(async () => {

  if (id) {
    const result = await store.getData('books', id);
    if ('data' in result) {
      form.value = result.data[0];
      // console.log("this book", form);
    }

    const factsData = await store.getData('facts', { 'books': id });
    relFacts.value = factsData.data;
  }

  const personsData = await store.getData('persons');
  persons = personsData.data;
  editorsAll.value = persons;

  const worksData = await store.getData('works');
  worksAll.value = worksData.data;
});

const getWorks = async (query: string) => {
  // console.log(query);
  const re = new RegExp(query, 'i');
  loading.value = true;

  const worksData = await store.getData('works');
  worksAll.value = worksData.data.filter((x: IWork) => re.test(x.title));
  loading.value = false;
};

const getEditors = (query: string) => {
  // console.log(query);
  const re = new RegExp(query, 'i');
  loading.value = true;
  editorsAll.value = persons.filter(x => re.test(x.firstname) || re.test(x.lastname));
  loading.value = false;
};

// const getAuthors = (query) => {
//   console.log(query);
//   const re  = new RegExp(query, "i");
//   loading.value = true;
//   authors.value = persons.filter(x => re.test(x.value));
//   loading.value = false;
// };

const resetForm = () => {
  formRef.value?.resetFields();
};

const deleteBook = async () => {
  if (form?.value?.id) {
    const result = await store.deleteById('books', form.value.id);
    if ('data' in result && 'id' in result.data) {
      router.push('/books');
    }
  }
};

const confirm = () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      // console.log('form', form);
      const result = await store.postData('books', form.value);
      // console.log(result);
      if ('data' in result && 'id' in result.data) {
        router.push('/books');
      } else {
        console.log('error!');
      }
    }
  });
};

const rules = <FormRules<IRuleFormBook>>{
  title: [
    { required: true, message: store.loc('fieldnonempty'), trigger: 'blur' },
    { min: 2, message: store.loc('twoandmore'), trigger: 'blur' },
  ],
  published: [
    { required: true, message: store.loc('fieldnonempty'), trigger: 'blur' },
    { min: 2, type: 'integer', trigger: 'blur' },
  ],
};

const loc = store.loc;
</script>
