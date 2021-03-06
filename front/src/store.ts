import { reactive } from "vue";
import axios from "axios";
import router from "./router";

const state = reactive({
  token: "",
  user: {},
});

const getUser = async() => {
  if (!state.user.hasOwnProperty("email")) {
    axios.get("/api/user")
        .then((response) => {
            state.user = response.data;
        })
        .catch((errors) => {
            console.log(errors)
        })
  }
};
