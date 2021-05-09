<template>
<div class="box">
  <div>
      Персоналии: {{data.persons}}
  </div>
  <div>
    Произведения: {{data.works}}
  </div>
  <div>
    Издания: {{data.books}}
  </div>

</div>
</template>

<script lang="ts">
import { reactive, defineComponent, onBeforeMount } from 'vue'
import store from "../store";

export default defineComponent({
  name: 'Home',

  setup: () => {
    const data = reactive({});

    onBeforeMount(async() => {
      data["persons"] = (await store.getData("persons")).data.length;
      data["works"] = (await store.getData("works")).data.length;;
      data["books"] = (await store.getData("books")).data.length;;
    });


    return { data }
  }
})
</script>

<style scoped>


.box {
max-width:400px;
margin:auto;
/* border: 1px solid red; */
}
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>
