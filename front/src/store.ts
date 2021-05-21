import { reactive } from "vue";
import axios from "axios";
// import router from "./router";

const state = reactive({
  token: localStorage.getItem('token') || '',
  user: {},
  test: "ok",
  error: "",
  options: [{
        value: 1,
        label: 'Администратор',
      }, {
        value: 3,
        label: 'Модератор',
      }, {
        value: 5,
        label: 'Редактор',
      }
    ]
});

const logout = async() => {
  localStorage.setItem("token", "");
  state.user  = {};
}

const getUser = async() => {
    if(state.token) {
      try {
        const config = { headers: { Authorization: "Bearer " + state.token }, };
        const response = await axios.get("/api/user/info", config);
        state.user = response.data;
      } catch (error) {
        console.log("Cannot get user", error)
        return error;
      }
  }
};

const doLogin = async(payload: Object): Promise<any> => {
  // if (!state.token) {
    try {
     const response = await axios.post("/api/user/login", payload);
     if ("data" in response && "id" in response.data){
       state.user = response.data;
       state.token  = response.data.token || '';
       localStorage.setItem('token', state.token);
     } else {
       console.log(response);
       return response.data.error;
     }
     return;
   } catch (error) {
     console.log("Cannot log in", error)
     return error;
   }
 // }
 // console.log("No query: token exists.");
};

const initUser = async(data: Object): Promise<any> => {
  if (state.token) {
    try {
      const config = { headers: { Authorization: "Bearer " + state.token } };
      const response = await axios.post('/api/user/add', data, config);
      console.log(response.data);
      return response;
   } catch (error) {
     console.log("Cannot get", error);
     return error;
   }
 }
 console.log("No token. Fail.");
};

const postData = async(table: string, data: Object): Promise<any> => {
  if (state.token) {
    try {
      const config = { headers: { Authorization: "Bearer " + state.token } };
      console.log(`POST ${table}`);
      const response = await axios.post('/api/x/'+ table, data, config);
      console.log("store:response", response.data);
      return response;
   } catch (error) {
     console.log("Cannot get", error);
     return error;
   }
 }
 console.log("No token. Fail.");
};

const deleteById = async(table: string, id: string): Promise<any> => {
  if (state.token) {
    try {
    const config = { headers: { Authorization: "Bearer " + state.token }, "params": {} };
     // if(id) { config["params"] = { id: id }; }
     console.log("delete query", table, id);
     const response = await axios.delete("/api/" + table + "/" + id, config);
     console.log(response.data);
     return response;
   } catch (error) {
     console.log("Cannot delete", error);
     return error;
   }
 }
 console.log("No token. Fail.");
};

const getData = async(table: string, id?: string): Promise<any> => {
  if (state.token) {
    try {
    const config = { headers: { Authorization: "Bearer " + state.token }, "params": {} };
     if(id) { config["params"] = { id: id }; }
     console.log(`GET ${table}`);
     const response = await axios.get("/api/" + table, config);
     console.log(response.data);
     return response;
   } catch (error) {
     console.log("Cannot get", error);
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

const nest = (xx:any, id = null, y = 'parent') =>
    xx.filter((x:any)  => x[y] === id)
    .map((x:any) => ({ ...x, ...leaf(xx, x.id) }));
const leaf = (a:any, b:any): Object  =>  {
    const res  = nest(a, b);
    return res.length ? {children: res} : {};
};

interface keyable {
    [key: string]: any
}

const classify = (x:keyable) => {
  if (x.data1 && Object.keys(x.data1).length){
    return x.data0 && Object.keys(x.data0).length ? "Изменение" : "Создание";
  } else {
    return "Удаление";
  }
};

const dateToString = (x:string) => {
  const dt  = new Date(x);
  return dt.toLocaleString('ru-RU');
}

export default {
  // state: readonly(state),
  logout,
  initUser,
  postData,
  getUser,
  doLogin,
  getData,
  deleteById,
  nest,
  classify,
  dateToString,
  // doLogout,
  // getData
  state: state,
};
