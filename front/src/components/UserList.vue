<template>
  <MainTitle :title="store.loc('users') + ' (' + users?.length + ')'" :callback="confirm"></MainTitle>

  <el-form :model="form" ref="formRef" label-width="100px" :rules="rules" :inline="true">
    <el-form-item prop="firstname">
      <el-input :placeholder="store.loc('firstname')" v-model="form.firstname" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="lastname">
      <el-input :placeholder="store.loc('lastname')" v-model="form.lastname" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="email">
      <el-input :placeholder="store.loc('email')" v-model="form.email" class="text-input"></el-input>
    </el-form-item>

    <el-form-item>
      <el-radio-group v-model="form.sex">
        <el-radio :value="1">{{ store.loc('man') }}</el-radio>
        <el-radio :value="2">{{ store.loc('woman') }}</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item>
      <el-button icon="el-icon-delete" circle @click="resetForm"></el-button>
      <!-- <el-button type="primary" @click="confirm">{{store.loc('users')}}</el-button> -->
    </el-form-item>
  </el-form>


  <div style="margin-top:2rem;"></div>
  <el-row v-for="(value, key) in users" :gutter="20" :key="key">
    <el-col :span="12">
      <!-- <div class="grid-content"> -->
      <!-- <el-icon v-if="value.sex === 1"><el-icon-male /></el-icon>
        <el-icon v-else><el-icon-female /></el-icon> -->
      <el-tooltip class="box-item" effect="dark" :content="store.getHumanReadablePrivs(value.privs)" placement="right">
        <el-button :disabled="store!.state!.user!.privs > 1 && value.id !== store!.state!.user!.id"
          :plain="store.state.user?.id !== value.id" @click="$router.push('/user/' + value.id)"
          :type="getUserType(value)">{{ store.getLabel(value) }}</el-button>
      </el-tooltip>
      <!-- </div> -->
    </el-col>

    <el-col :span="12">
      <!-- <div v-if="store.state.user?.id === value.id" class="grid-content">
        <el-icon><el-icon-check /></el-icon>
      </div> -->
      <div v-if="store!.state!.user!.privs === 1 && store.state.user?.id !== value.id">
        <div v-if="value.activated" class="grid-content">
          <el-button type="danger" @click="switchUserStatus(value)">{{ store.loc('disable') }}</el-button>
        </div>
        <div v-else class="grid-content">
          <el-button @click="switchUserStatus(value)">{{ store.loc('activate') }}</el-button>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">

import { ElForm, ElMessageBox } from 'element-plus';
import { ref, reactive, onBeforeMount } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import store from '../store';
import MainTitle from './MainTitle.vue';

const formRef = ref<FormInstance>();
const form = reactive({ firstname: '', lastname: '', email: '', sex: 2, privs: 5 } as IUser);
const users = ref([] as Array<IUser>);
const rules = <FormRules<IRuleFormProfile>>{
  firstname: [
    { required: true, message: store.loc('fieldnonempty'), trigger: 'blur' },
    { min: 2, message: store.loc('twoandmore'), trigger: 'blur' },
  ],
  lastname: [
    { required: true, message: store.loc('fieldnonempty'), trigger: 'blur' },
    { min: 2, message: store.loc('twoandmore'), trigger: 'blur' },
  ],
  email: [
    { required: true, message: store.loc('fieldnonempty'), trigger: 'blur' },
    { type: 'email', message: store.loc('fieldemail'), trigger: ['blur', 'change'] },
  ],
};


const getUserType = (user: IUser) => {
  if (!user.activated) {
    return 'info';
  }
  if (user.privs === 1) {
    return 'primary';
  }
  if (user.privs === 3) {
    return 'success';
  }
  if (user.privs === 5) {
    return 'default';
  }
  if (user.privs === 7) {
    return 'warning';
  }
}
onBeforeMount(async () => {
  const result = await store.getData('users');
  // if (response.data && Object.keys(response.data).length) {
  if ('data' in result) {
    const userData = result.data as Array<IUser>;
    users.value = userData;
  }
});

const switchUserStatus = async (user: IUser) => {
  // console.log(user);
  user.activated = !user.activated;
  const result = await store.postData('users', user);
  // console.log(result);
};

const resetForm = () => {
  formRef.value?.resetFields();
};

const confirm = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      // do
      // console.log('ok send', form);
      // return false;
      const result = await store.initUser(form);
      // console.log(result);
      if ('data' in result && 'message' in result.data) {
        ElMessageBox({
          message: result.data.message,
          title: `${store.loc('userpswd')} ${form.firstname} ${form.lastname} `,
          type: 'success',
          showClose: true,
          center: true,
        });
      }
      users.value.unshift({ ...(form as IUser) });
      formRef.value?.resetFields();
    } else {
      console.log('form not valid');
      return false;
    }
  });
};

</script>
