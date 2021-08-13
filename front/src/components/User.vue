<template>

  <el-form label-width="120px" v-model="user" :inline="true">

    <el-form-item prop="firstname">
      <el-input :placeholder="loc('fname')" v-model="user.firstname" class="text-input" prop="firstName"></el-input>
    </el-form-item>

    <el-form-item prop="lastname">
      <el-input :placeholder="loc('lname')" v-model="user.lastname" class="text-input"></el-input>
    </el-form-item>

    <el-form-item>
      <el-select v-model="user.privs" placeholder="Select" value-key>
        <el-option v-for="(code, key) in rights"
                   :key="key"
                   :label="loc(code)"
                   :value="Number(key)">
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-radio-group v-model="user.sex">
        <el-radio label="1">{{loc('man')}}</el-radio>
        <el-radio label="2">{{loc('woman')}}</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-button type="primary" @click="onSubmit">{{loc('save')}}</el-button>

  </el-form>

</template>
<script>

  import { ref } from 'vue';
  import { onBeforeMount } from 'vue';
  import store from '../store';
  import router from '../router';
  import { useRoute } from 'vue-router';

  export default {
    name: 'User',
    setup() {
      let user = ref({});
      const vuerouter = useRoute();
      const id = vuerouter.params.id;

      onBeforeMount(async () => {
        const result = await store.getData('users', id);
        if ('data' in result) {
          user.value = result.data[0];
          user.value.sex = user.value.sex.toString();
        }
      });

      const onSubmit = async () => {
        // form.validate();
        // console.log('save:', user.value);
        const { data } = await store.postData('users', user.value);
        if (data?.id) {
          router.push('/users');
        } else {
          console.log('error!');
        }
      };

      return { onSubmit, user, rights: store.privs, loc: store.loc };
    },
  };

</script>
