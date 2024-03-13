<template>
  <div v-if="isLoaded">
    <el-row>
      Email: {{ user.email }}
    </el-row>
    <el-form label-width="120px" v-model="user" :inline="true">

      <el-form-item prop="firstname">
        <el-input :placeholder="store.loc('fname')" v-model="user.firstname" class="text-input"></el-input>
      </el-form-item>

      <el-form-item prop="lastname">
        <el-input :placeholder="store.loc('lname')" v-model="user.lastname" class="text-input"></el-input>
      </el-form-item>

      <el-form-item>
        <el-select v-model="user.privs" placeholder="Select" value-key="id" style="width: 240px">
          <el-option v-for="(code, id) in rights" :key="id" :label="store.loc(code)" :value="Number(id)">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-radio-group v-model="user.sex">
          <el-radio :value="1">{{ store.loc('man') }}</el-radio>
          <el-radio :value="2">{{ store.loc('woman') }}</el-radio>
        </el-radio-group>
      </el-form-item>

      <div v-if="store!.state!.user!.privs === 1 || user.id === store!.state!.user!.id">
        <el-row>
          <el-space>
            <el-button type="danger" @click="resetPassword">{{ store.loc('resetpass') }}</el-button>
            <el-text>{{ newPassword }}</el-text>
          </el-space>
        </el-row>
        <el-button type="primary" @click="onSubmit">{{ store.loc('save') }}</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import store from '../store';
import router from '../router';

const vuerouter = useRoute();
const rights = store.privs;
let user = ref({} as IUser);
const id = vuerouter.params.id;
const isLoaded = ref(false);
const newPassword = ref('');

onBeforeMount(async () => {
  const result = await store.getData('users', String(id));
  if ('data' in result) {
    user.value = result.data[0] as IUser;
    isLoaded.value = true;
  }
});

const resetPassword = async () => {
  const { data } = await store.postData('user/reset/', { id: user.value.id });
  // console.log(data);
  newPassword.value = data?.message;
};

const onSubmit = async () => {
  // form.validate();
  console.log('save:', user.value);
  const { data } = await store.postData('users', user.value);
  if (data?.id) {
    if (user.value.id === store!.state!.user!.id) {
      store.state!.user!.firstname = user.value.firstname;
      store.state!.user!.lastname = user.value.lastname;
    }
    router.push('/users');
  } else {
    console.log('error!');
  }
};

</script>
