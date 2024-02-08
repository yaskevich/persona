<template>
  <MainTitle :title="loc('genres')" :callback="showDialog"></MainTitle>

  <el-row v-for="(value, key) in genres" :gutter="20" :key="key">
    <el-col :span="12">
      <div class="grid-content bg-purple">
        {{ value.title }}
      </div>
    </el-col>
    <el-col :span="6">
      <div class="grid-content bg-purple">
        <el-button type="" link size="small" icon="el-icon-edit" plain class="full-width"
          @click="showDialog(value.title, value.id)"></el-button>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="grid-content bg-purple">
        <el-popconfirm :title="loc('confirmdel')" :confirmButtonText="loc('yes')" :cancelButtonText="loc('no')"
          @confirm="deleteGenre(value.id, key)">
          <template #reference>
            <el-button type="" link size="small" icon="el-icon-delete" plain class="full-width"></el-button>
          </template>
        </el-popconfirm>
      </div>
    </el-col>
  </el-row>

  <el-dialog :title="loc('genre')" v-model="dialogVisible" width="30%">
    <el-form :model="form" ref="formRef" label-width="100px" :rules="rules" :inline="true" @submit.prevent.native>
      <el-form-item prop="title">
        <el-input :placeholder="loc('title')" v-model="form.title" class="text-input" ref="formInputRef"
          @keyup.enter="confirmDialog"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ loc('cancel') }}</el-button>
        <el-button type="primary" @click="confirmDialog">{{ loc('save') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">

import { reactive, ref, onBeforeMount, nextTick } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import store from '../store';
import MainTitle from './MainTitle.vue';

const genres = reactive([] as Array<IGenre>);
const form = reactive({ title: '' } as IGenre);
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const formInputRef = ref<HTMLElement>();

onBeforeMount(async () => {
  const result = await store.getData('genres');
  if ('data' in result) {
    genres.push(...result.data.sort((a: IGenre, b: IGenre) => b.id - a.id));
  }
});

const showDialog = (text: string, id: number) => {
  dialogVisible.value = true;
  form.title = typeof text === 'string' ? text : '';
  form.id = id;
  nextTick(() => {
    if (formInputRef.value)
      formInputRef.value.focus();
  });
};

const deleteGenre = async (id: number, key: number) => {
  const result = await store.deleteById('genres', id);
  // console.log(result);
  if ('data' in result && 'id' in result.data) {
    // console.log('deleted', id);
    genres.splice(key, 1);
  }
};

const confirmDialog = () => {
  formRef.value?.validate(async valid => {
    if (valid) {
      // console.log('form', form, genres);
      form.title = form.title.trim();
      if (genres.filter(x => x.title === form.title).length) {
        // console.log('avoid duplicates');
        form.title = '';
        dialogVisible.value = false;
      } else {
        const result = await store.postData('genres', form);
        // console.log(result);
        if (!('data' in result && 'id' in result.data)) {
          console.log('error!');
        } else {
          // console.log('ok');
          if (form.id) {
            genres.filter(x => x.id === form.id)[0]['title'] = form.title;
            // delete form.id;
            Object.assign(form, { title: '' });
          } else {
            genres.unshift({ ...form });
          }
          form.title = '';
          dialogVisible.value = false;
        }
      }
    } else {
      return false;
    }
  });
};

const rules = {
  title: [
    { required: true, message: store.loc('fieldnonempty'), trigger: 'blur' },
    { min: 2, message: store.loc('twoandmore'), trigger: 'blur' },
  ],
};


const loc = store.loc;

</script>
