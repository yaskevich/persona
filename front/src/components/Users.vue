<template>
<div>
  User list
</div>
</template>

<script>
export default {
  name: "UserList",
  props: {
    datum: Object,
  },
  setup() {

  },
  components: {

  }
};
</script>

<style scoped>
.example {
  /* border: 1px solid orange; */
  padding: .5rem;
}
/* .construction {
  padding-left: 1rem;
} */
.example-text {
  /* font-stretch: condensed; */
  letter-spacing: -1px;
  font-style: italic;
}
.example-author {
  /* color: purple; */
}
.example-pub {
  color: #F5CB5C;
  text-shadow: black 0 0 .5px;
}
.example-pubdate {
  /* color: blue; */
}
</style>
