<template>
  Пользователь
</template>
<script>
import { reactive } from 'vue';
import { onBeforeMount } from 'vue';
import store from "../store";
export default {
  name: "Profile",

  setup() {


    let users = reactive([]);

    onBeforeMount(async() => {

      console.log(store.state.user);

      const result = await store.getData("users");
      if("data" in result) {
        console.log(result.data);
          users = result.data;
      }
    });

    const onSubmit = async() => {
      // form.validate();
        // console.log('save:', user.value);
        // const result = await store.postData("users", user.value);
        // console.log(result);
    };

    return {onSubmit, users, };
  },
  components: {

  }
};
</script>
