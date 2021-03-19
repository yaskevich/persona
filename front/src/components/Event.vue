<template>
    <el-form label-width="120px" v-model="user" :inline="true">
      <el-form-item prop="date">
        <el-input placeholder="Дата" v-model="user.firstname" class="text-input" prop="firstName"></el-input>
      </el-form-item>
      <el-form-item prop="tags">
        Тег
      </el-form-item>

    <el-form-item prop="lastname">
      <el-input placeholder="Фамилия" v-model="user.lastname" class="text-input"></el-input>
    </el-form-item>

    <!-- <el-form-item>
      <el-select v-model="user.privs" placeholder="Select" value-key>
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </el-form-item> -->

     <el-button type="primary" @click="onSubmit">Сохранить</el-button>
    </el-form>
</template>
<script>
import { ref } from 'vue';
import { onBeforeMount } from 'vue';
import store from "../store";
import { useRoute } from 'vue-router';

export default {
  name: "User",
  props: {
    // datum: Object,
  },
  setup() {

    let event = ref({});
    const vuerouter = useRoute();
    const id = vuerouter.params.id;

    onBeforeMount(async() => {
      const result = await store.getData("events", id);
      if("data" in result) {
        console.log("ok");
      }
    });

    const onSubmit = async() => {
      // form.validate();
        console.log('save:', event.value);
        const result = await store.postData("events", event.value);
        console.log(result);
    };

    return {onSubmit, event, options: store.state.options};
  },
  components: {

  }
};
</script>
