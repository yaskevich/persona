<template>
  <MainTitle :title="store.loc('person') + ' ' + $route.params.id" :callback="confirm" :text="store.loc('save')">
  </MainTitle>

  <el-form label-width="120px" v-model="person">
    <el-form-item prop="firstname" :label="store.loc('firstname')">
      <el-input :placeholder="store.loc('firstname')" v-model="person.firstname" class="text-input"
        prop="firstName"></el-input>
    </el-form-item>
    <el-form-item prop="patroname" :label="store.loc('patroname')">
      <el-input :placeholder="store.loc('patroname')" v-model="person.patroname" class="text-input"></el-input>
    </el-form-item>
    <el-form-item prop="lastname" :label="store.loc('lastname')">
      <el-input :placeholder="store.loc('lastname')" v-model="person.lastname" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="wikidata" :label="store.loc('wikidata')">
      <el-input :placeholder="store.loc('wikidata')" v-model="person.wikidata" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="note" :label="store.loc('note')">
      <el-input :placeholder="store.loc('note')" v-model="person.note" class="text-input"></el-input>
    </el-form-item>
    <!-- <el-form-item :label="loc('sex')"> -->
    <el-form-item>
      <el-radio-group v-model="person.sex">
        <el-radio :value="1">{{ store.loc('man') }}</el-radio>
        <el-radio :value="2">{{ store.loc('woman') }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-popconfirm :title="store.loc('confirmdel')" :confirmButtonText="store.loc('yes')"
        :cancelButtonText="store.loc('no')" @confirm="deletePerson(person.id)">
        <template #reference>
          <el-button type="danger">{{ store.loc('remove') }}</el-button>
        </template>
      </el-popconfirm>
      <el-button type="primary" @click="confirm">{{ store.loc('save') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onBeforeMount } from 'vue';
import store from '../store';
import { useRoute } from 'vue-router';
import MainTitle from './MainTitle.vue';
import router from '../router';

let person = ref({} as IPerson);
const vuerouter = useRoute();
const id = String(vuerouter.params.id);

onBeforeMount(async () => {
  if (id) {
    const result = await store.getData('persons', id);
    if ('data' in result) {
      person.value = result.data[0];
    }
  }
});

const confirm = async () => {
  // form.validate();
  // console.log('save:', person.value);
  const result = await store.postData('persons', person.value);
  if (!('data' in result && 'id' in result.data)) {
    console.log("error", result);
  }
  router.push('/persons');
};

const deletePerson = async (id: number) => {
  const { data } = await store.deleteById('persons', id);
  if (data && 'id' in data) {
    console.log('deleted', id);
    router.push('/persons');
    // persons.splice(key, 1);
  }
};


</script>
