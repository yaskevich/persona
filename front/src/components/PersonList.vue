<template>
  <div v-if="isLoaded">
    <MainTitle :title="loc('persons')" :callback="confirm"></MainTitle>

    <el-form label-width="120px" ref="formRef" :model="form" :inline="true" :rules="rules">

      <el-form-item prop="rendername">
        <el-input class="text-input" :placeholder="loc('rendername')" v-model="form.rendername"></el-input>
      </el-form-item>

      <el-form-item prop="wikidata">
        <el-input :placeholder="loc('wikidata')" prop="wikidata" v-model="form.wikidata" class="text-input"></el-input>
      </el-form-item>

      <el-form-item prop="note">
        <el-input :placeholder="loc('note')" prop="note" v-model="form.note" class="text-input"></el-input>
      </el-form-item>

      <el-form-item prop="firstname">
        <el-input :placeholder="loc('firstname')" v-model="form.firstname" class="text-input"></el-input>
      </el-form-item>

      <el-form-item prop="patroname">
        <el-input :placeholder="loc('patroname')" v-model="form.patroname" class="text-input"></el-input>
      </el-form-item>

      <el-form-item prop="lastname">
        <el-input :placeholder="loc('lastname')" v-model="form.lastname"></el-input>
      </el-form-item>

      <el-form-item>
        <el-radio-group v-model="form.sex">
          <el-radio :value="1">{{ loc('man') }}</el-radio>
          <el-radio :value="2">{{ loc('woman') }}</el-radio>
        </el-radio-group>
      </el-form-item>

    </el-form>

    <el-row type="flex" justify="center">

      <el-input :placeholder="loc('filternames')" v-model="filterString" style="max-width: 280px;" clearable>
      </el-input>

    </el-row>

    <el-row v-for="(value, key) in filtered()" :gutter="20" :key="key">

      <el-space>

        <el-tooltip class="box-item" effect="dark"
          :content="` ${value.firstname} ${value.patroname} ${value.lastname} ${value.wikidata ? ' Q' + value.wikidata : ''}`">

          <el-button :type="value.wikidata ? 'primary' : 'info'" plain
            :icon="value.sex === 1 ? 'el-icon-male' : 'el-icon-female'" @click="router.push('/person/' + value.id)">

            <el-text v-if="value?.rendername" type="warning">{{ value.rendername }}</el-text>

            <span v-else>
              {{ value.firstname }} {{ value.lastname }}
            </span>

          </el-button>

        </el-tooltip>

        <el-tag v-if="value?.note" effect="plain" size="large">{{ value.note }}</el-tag>

      </el-space>

    </el-row>
  </div>
</template>

<script setup lang="ts">

import { ElForm } from 'element-plus';
import { ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import store from '../store';
import MainTitle from './MainTitle.vue';
import router from '../router';

const isLoaded = ref(false);
const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
const form = reactive({ firstname: '', lastname: '', patroname: '', sex: 1, wikidata: '', note: '' } as IPerson);
const persons = reactive([] as Array<IPerson>);
const filterString = ref('');

onBeforeMount(async () => {
  const { data } = await store.getData('persons');
  if (data) {
    persons.push(...data.sort((a: IPerson, b: IPerson) => b.id - a.id));
  }
  isLoaded.value = true;
});

// const deletePerson = async (id: number, key: number) => {
//   const { data } = await store.deleteById('persons', id);
//   if (data && 'id' in data) {
//     // console.log('deleted', id);
//     persons.splice(key, 1);
//   }
// };

const resetForm = () => {
  formRef.value?.resetFields();
};

const confirm = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (form?.wikidata) {
        form.wikidata = form.wikidata.replace(/\D/g, "");
      }
      const { data } = await store.postData('persons', form);
      // console.log(result);
      if (data && 'id' in data) {
        persons.unshift({ ...form, id: data.id } as IPerson);
        // console.log('success', persons);
        formRef.value?.resetFields();
      }
    } else {
      // console.log('form not valid');
      return false;
    }
  });
};

const rules = {
  firstname: [
    { required: true, message: store.loc('fieldnonempty'), trigger: 'blur' },
    { min: 2, message: store.loc('twoandmore'), trigger: 'blur' },
  ],
  lastname: [
    { required: true, message: store.loc('fieldnonempty'), trigger: 'blur' },
    { min: 2, message: store.loc('twoandmore'), trigger: 'blur' },
  ],
  patroname: [
    { required: false, message: store.loc('fieldnonempty'), trigger: 'blur' },
    { min: 2, message: store.loc('twoandmore'), trigger: 'blur' },
  ],
};

const filtered = () => {
  const re = new RegExp(filterString.value, 'i');
  return filterString.value
    ? persons.filter(
      x => x?.rendername && x.rendername.search(re) !== -1 || x?.firstname && x.firstname.search(re) !== -1 || x?.lastname && x.lastname.search(re) !== -1 || x?.patroname && x.patroname.search(re) !== -1 || x?.note && x.note.search(re) !== -1
    )
    : persons;
};

const loc = store.loc;

</script>
