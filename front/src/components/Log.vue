<template>
Действие:
Пользователь:
Тип данных:
Дата и время:

</template>
<script>
import { ref } from 'vue';
import { onBeforeMount } from 'vue';
import store from "../store";
import { useRoute } from 'vue-router';
import router from "../router";

export default {
  name: "Log",
  props: {
    // datum: Object,
  },
  setup() {

    const user = ref({});
    const record = ref({});
    const vuerouter = useRoute();
    const id = vuerouter.params.id;

    onBeforeMount(async() => {
      const resultRecord = await store.getData("logs", id);
      if("data" in result) {
        const record = resultRecord.data[0];
        const result = await store.getData("users", record.user_id);
        if("data" in result) {
          user.value = result.data[0];
        }
      }


    });

    return { user, record };
  },
};
</script>
