<template>

  <MainTitle :title="loc('person') + ' ' + $route.params.id " :callback="confirm" :text="loc('save')"></MainTitle>

  <el-form label-width="120px" v-model="person">
    <el-form-item prop="firstname" :label="loc('firstname')">
      <el-input :placeholder="loc('firstname')" v-model="person.firstname" class="text-input" prop="firstName"></el-input>
    </el-form-item>
    <el-form-item prop="patroname" :label="loc('patroname')">
      <el-input :placeholder="loc('patroname')" v-model="person.patroname" class="text-input"></el-input>
    </el-form-item>
    <el-form-item prop="lastname" :label="loc('lastname')">
      <el-input :placeholder="loc('lastname')" v-model="person.lastname" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="wikidata" :label="loc('wikidata')">
      <el-input :placeholder="loc('wikidata')" v-model="person.wikidata" class="text-input"></el-input>
    </el-form-item>
    <!-- <el-form-item :label="loc('sex')"> -->
    <el-form-item>
      <el-radio-group v-model="person.sex">
        <el-radio label="1">{{loc('man')}}</el-radio>
        <el-radio label="2">{{loc('woman')}}</el-radio>
      </el-radio-group>
    </el-form-item>

  </el-form>

</template>
<script>

  import { ref } from 'vue';
  import { onBeforeMount } from 'vue';
  import store from '../store';
  import { useRoute } from 'vue-router';
  import MainTitle from './MainTitle.vue';
  import router from '../router';

  export default {
    name: 'Person',
    props: {
      // datum: Object,
    },
    setup() {
      let person = ref({});
      const vuerouter = useRoute();
      const id = vuerouter.params.id;

      onBeforeMount(async () => {
        const result = await store.getData('persons', id);
        if ('data' in result) {
          person.value = result.data[0];
          person.value.sex = person.value.sex.toString();
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

      return { confirm, person,  loc: store.loc };
    },
    components: {
      MainTitle,
    },
  };

</script>
