import { reactive } from "vue";
import axios from "axios";
import router from "./router";

const state = reactive({
  token: localStorage.getItem('token') || '',
  user: {},
  test: "ok",
  error: "",
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

const doLogin = async(payload: Object): Promise<T> => {
  // if (!state.token) {
    try {
     const response = await axios.post("/api/user/login", payload);
     state.user = response.data;
     state.token  = response.data.token || '';
     localStorage.setItem('token', state.token);
     // router.push("/dashboard")
     return;
   } catch (error) {
     console.log("Cannot log in", error)
     return error;
   }
 // }
 // console.log("No query: token exists.");
};

const getData = async(table: string): Promise<T> => {
  if (state.token) {
    try {
    const config = { headers: { Authorization: "Bearer " + state.token } };
     const response = await axios.get("/api/get/" + table, config);
     return response;
   } catch (error) {
     console.log("Cannot get", error)
     return error;
   }
 }
 console.log("No token. Fail.");

};
// axios.post('/api/user/login', user, {
//     "withCredentials": true,
//     "headers": {
//         "Accept": 'application/json',
//         "Content-Type": 'application/json',
//     }})
  // .then(function (response) {
  //   //
  //   console.log("login result", response);
  // })
  // .catch(function (error) {
  //   console.log(error);
  // });

export default {
  // state: readonly(state),
  getUser,
  doLogin,
  getData,
  // doLogout,
  // getData
  state: state,
};
