<template>
  <MainTitle :title="loc('settings')" :callback="confirm" :text="loc('save')"></MainTitle>
  <el-form label-width="220px" :model="settings" ref="formRef" :rules="rules" v-if="isLoaded">

    <el-form-item :label="loc('mainperson')">
      <el-select v-model="settings.mainperson" filterable :placeholder="loc('persons')">
        <el-option v-for="item in persons" :key="item.id" :label="store.getLabel(item)" :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item prop="title" :label="loc('projtitle')">
      <el-input placeholder="..." v-model="settings.title" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="uilang" :label="loc('uilang')">
      <el-select v-model="settings.uilang" :placeholder="loc('uilang')">
        <el-option v-for="(item, key) in langs" :key="key" :label="item" :value="key">
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item prop="lang" :label="loc('textlang')">
      <el-input placeholder="..." v-model="settings.lang" class="text-input"></el-input>

      <!-- <el-select v-model="settings.lang" :placeholder="loc('lang')">
        <el-option v-for="(item, key) in langs" :key="key" :label="item" :value="key">
        </el-option>
      </el-select> -->
    </el-form-item>

  </el-form>
</template>

<script setup lang="ts">

import { onBeforeMount, ref, reactive } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import store from '../store';
import MainTitle from './MainTitle.vue';

const formRef = ref<FormInstance>();
let persons = ref([] as Array<IPerson>);
const settings = reactive({} as ISettings);
const isLoaded = ref(false);

onBeforeMount(async () => {
  const personsData = await store.getData('persons');
  persons.value = personsData.data as Array<IPerson>;
  // console.log(persons);
  Object.assign(settings, store?.state?.user?.settings);
  isLoaded.value = true;
});

const confirm = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      // console.log('save:', settings.value);
      if (store?.state?.user)
        Object.assign(store.state.user.settings, settings);
      const result = await store.postData('settings', settings);
      if (!('data' in result && 'id' in result.data)) {
        console.log('error', result);
      }
    } else {
      console.log('form not valid');
    }
  });
};

const rules = {
  title: [{ required: true, message: store.loc('fieldnonempty'), trigger: 'blur' }],
};

const loc = store.loc;
const langs = store.langs;

</script>
