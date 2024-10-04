<template>
  <MainTitle :title="store.loc('genres')" :callback="() => router.push('/genre/')" />
  <!-- <el-row > -->
  <!-- <el-space wrap> -->
  <el-button style="margin: 5px" v-for="(value, key) in genres.sort((a, b) => b.title.length - a.title.length)"
    type="primary" plain @click="router.push('/genre/' + value.id)">{{ value.title }}</el-button>
  <!-- </el-space> -->
  <!-- </el-row> -->
</template>

<script setup lang="ts">

import { reactive, ref, onBeforeMount, nextTick } from 'vue';
// import type { FormInstance, FormRules } from 'element-plus';
import store from '../store';
import MainTitle from './MainTitle.vue';
import router from '../router';

const genres = reactive([] as Array<IGenre>);
// const form = reactive({ title: '' } as IGenre);
// const dialogVisible = ref(false);
// const formRef = ref<FormInstance>();
// const formInputRef = ref<HTMLElement>();

onBeforeMount(async () => {
  const result = await store.getData('genres');
  if ('data' in result) {
    genres.push(...result.data.sort((a: IGenre, b: IGenre) => b.id - a.id));
  }
});

// const showDialog = (text: string, id: number) => {
//   dialogVisible.value = true;
//   form.title = typeof text === 'string' ? text : '';
//   form.id = id;
//   nextTick(async () => {
//     if (formInputRef.value) {
//       formInputRef.value.focus();
//     }
//   });
// };

// const deleteGenre = async (id: number, key: number) => {
//   const result = await store.deleteById('genres', id);
//   if ('data' in result && 'id' in result.data) {
//     genres.splice(key, 1);
//   }
// };

// const confirmDialog = () => {
//   formRef.value?.validate(async valid => {
//     if (valid) {
//       // console.log('form', form, genres);
//       form.title = form.title.trim();
//       if (genres.filter(x => x.title === form.title).length) {
//         // console.log('avoid duplicates');
//         form.title = '';
//         dialogVisible.value = false;
//       } else {
//         const result = await store.postData('genres', form);
//         // console.log(result);
//         if (!('data' in result && 'id' in result.data)) {
//           console.log('error!');
//         } else {
//           // console.log('ok');
//           if (form.id) {
//             genres.filter(x => x.id === form.id)[0]['title'] = form.title;
//             // delete form.id;
//             Object.assign(form, { title: '' });
//           } else {
//             genres.unshift({ ...form, id: result.data.id });
//           }
//           form.title = '';
//           dialogVisible.value = false;
//         }
//       }
//     } else {
//       return false;
//     }
//   });
// };

// const rules = {
//   title: [
//     { required: true, message: store.loc('fieldnonempty'), trigger: 'blur' },
//     { min: 2, message: store.loc('twoandmore'), trigger: 'blur' },
//   ],
// };

</script>
