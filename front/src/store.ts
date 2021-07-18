import { reactive } from "vue";
import axios from "axios";
// import router from "./router";
import project from '../package.json'
const state = reactive({
  token: localStorage.getItem('token') || '',
  user: {},
  lang: 1,
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

const texts = {
  "home" : ["Home", "Обзор"],
  "facts": ["Facts", "События"],
  "persons":["Persons", "Персоналии"],
  "works": ["Works", "Произведения"],
  "books": ["Books", "Издания"],
  "genres": ["Genres", "Жанры"],
  "acts": ["Activities", "Деятельность"],
  "refs": ["References", "Библиография"],
  "users": ["Users", 'Пользователи'],
  "logs": ["Events", 'Действия'],
  "settings": ["Project", 'Проект'],
  "content": ["Content", 'Контент'],
  "admin": ["Management", 'Настройки'],
  "dbevent": ["Database Event", 'Запись в базу данных'],
  "user": ["User", 'Пользователь'],
  "event": ["Event", 'Событие'],
  "datatype": ["Data type", 'Тип данных'],
  "dateandtime": ["Date and Time", 'Дата и время'],
  "data": ["Data", "Данные"],
  "field": ["Field", "Поле"],
  "wasbefore": ["Before", "Было"],
  "becameafter": ["After", "Стало"],
  "change": ["Change", "Изменение"],
  "creation": ["Creation", "Создание"],
  "removal": ["Removal", "Удаление"],
  "userlog": ["User Actions Log", "Журнал действий пользователей"],
  "userauth": ["User Authorization", "Авторизация пользователя"],
  "or": ["or", "или"],
  "userreg": ["New Account Registration", "Регистрация новой учетной записи"],
  "loading": ["loading", "загрузка"],
  "profile": ["Profile", "Профиль"],
  "logout": ["Log out", "Выйти"],
  // "data": ["Data", "Данные"],
};

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
 } else {
   try {
     const response = await axios.post('/api/user/reg', data);
     console.log(response.data);
     return response;
  } catch (error) {
    console.log("Cannot get", error);
    return error;
  }
 }
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
     // console.log(`GET ${table}`);
     const response = await axios.get("/api/" + table, config);
     // console.log(response.data);
     return response;
   } catch (error) {
     console.log("Cannot get", error);
     return error;
   }
 }
 console.log("No token. Fail.");
};

type objOptions = {
    [key: string]: string
}
const getDataMulti = async (datum: objOptions, rules: objOptions, sorts: objOptions) =>{
  const tables = Object.keys(datum);
  return (await Promise.all(tables.map(t => getData(t)))).map((x,i) => {
    if (rules[tables[i]]) {
      const prop = rules[tables[i]];
      Object.assign(datum[tables[i]], x?.data.reduce((x:any, y:any) => {
          return { ...x, [y[prop]]: y };
        }, {})
      );
    }else {
      if (sorts[tables[i]]) {
        const prop = sorts[tables[i]];
        Object.assign(datum[tables[i]], x?.data.sort((a:any, b:any) => b[prop] - a[prop]));
    } else {
      Object.assign(datum[tables[i]], x?.data);
    }
    }
  });
  // .map((x,i) => ({ [tables[i]] : x?.data}));
};

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
  const key = x.data1 && Object.keys(x.data1).length ?
     x.data0 && Object.keys(x.data0).length ? 'change' : 'removal'
     : 'removal';
    return texts[key][state.lang];
};

const dateToString = (x:string) => {
  const dt  = new Date(x);
  return dt.toLocaleString('ru-RU');
};

const dateDropTimeZone = (x:Date) => {
  const dt  = new Date(x);
  dt.setMinutes( dt.getMinutes() - dt.getTimezoneOffset() );
  return dt.toISOString();
};

export default {
  dateDropTimeZone,
  nest,
  classify,
  dateToString,
  logout,
  initUser,
  postData,
  getUser,
  doLogin,
  getData,
  deleteById,
  // doLogout,
  // getData
  // state: readonly(state),
  state: state,
  version: project.version,
  texts,
  getDataMulti,
};
