import { reactive } from "vue";
import axios from "axios";
import project from '../package.json'

type objTexts = {
    [key: string]: [string, string]
};

type objOptions = {
    [key: string]: string
};

interface keyable {
    [key: string]: any
};

const privs = {
  1: "administrator",
  3: "moderator",
  5: "editor",
};

const localLanguages:Array<string>  = ["English", "Русский"];

const localDict:objTexts = {
  "home" : ["Home", "Обзор"],
  "facts": ["Facts", "События"],
  "fact": ["Fact", "Событие"],
  "persons":["Persons", "Персоналии"],
  "person":["Person", "Персона"],
  "works": ["Works", "Произведения"],
  "work": ["Work", "Произведение"],
  "books": ["Books", "Издания"],
  "book": ["Book", "Издание"],
  "genres": ["Genres", "Жанры"],
  "acts": ["Activities", "Деятельность"],
  "refs": ["References", "Библиография"],
  "users": ["Users", 'Пользователи'],
  "user": ["User", 'Пользователь'],
  "logs": ["Events", 'Действия'],
  "settings": ["Project", 'Проект'],
  "content": ["Content", 'Контент'],
  "admin": ["Management", 'Настройки'],
  "dbevent": ["Database Event", 'Запись в базу данных'],
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
  "loading": ["loading...", "загрузка..."],
  "profile": ["Profile", "Профиль"],
  "logout": ["Log out", "Выйти"],
  "filtertitles": ["Filter by titles", "Фильтр по названиям"],
  "filternames": ["Filter by names", "Фильтр по ФИО"],
  "save": ["Save", "Сохранить"],
  "add": ["Add", "Добавить"],
  "title": ["Title", "Название"],
  "type": ["Type", "Тип"],
  "genre": ["Genre", "Жанр"],
  "authors": ["Authors", "Авторы"],
  "author": ["Author", "Автор"],
  "reset": ["Reset", "Очистить"],
  "remove": ["Delete", "Удалить"],
  "yes": ["Yes", "Да"],
  "no": ["No", "Нет"],
  "confirmdel": ["Do you confirm removal?", "Точно удалить?"],
  "fieldnonempty": ["The field should not be empty", "Поле должно быть заполнено"],
  "fieldemail": ["Please input correct email address", "Поле должно содержать корректный адрес e-mail"],
  "fieldsex": ["Select a sex", "Выберите пол"],
  "twoandmore": ["Not less than 2 characters", "Не менее 2-х символов"],
  "pswdmore": ["Not less than 18 characters", "Не менее 18 символов"],
  "prodata": ["Project data", "Данные в базе"],
  "webver": ["Web app version", "Версия веб-приложения"],
  "cancel": ["Cancel", "Отмена"],
  "facttypes": ["Fact types", "Типы событий"],
  "addsibling": ["Add sibling item", "Добавить соседний пункт"],
  "addchild": ["Add child item", "Добавить вложенный пункт"],
  "rename": ["Rename", "Переименовать"],
  "delit": ["Delete this item", "Удалить этот пункт"],
  "warndelleaf": ["Removing item with children items is not allowed", "Нельзя удалить пункт с вложенными элементами"],
  "warnactsmove": ["Moving itexms requires the rights of a moderator and above", "Перемещение элементов доступно пользователям с правами модератора и выше"],
  "year": ["Year", "Год"],
  "editors": ["Editors", "Редакторы"],
  "techtimetip": ["Approximate date and time,<br/>that are needed to sort<br/>facts sequentially", "Примерные дата и время события,<br/>которые необходимы,<br/>чтобы сортировать события<br/>друг за другом"],
  "techtime": ["No", "Нет"],
  "agent": ["Agent", "Деятель"],
  "noagent": ["No agent", "Нет деятеля"],
  "date": ["Date", "Дата"],
  "place": ["Place", "Место"],
  "desc": ["Description", "Описание"],
  "desctip": ["Jack London wrote to Joan London", "Борис Пастернак пишет письмо Марине Цветаевой"],
  "rels": ["Relations", "Связи"],
  "relfacttype": ["Relation Type", "Тип связи"],
  "prtcpnts": ["Participants", "Участники"],
  "ments": ["Mentioned ones", "Упомянуты"],
  "sources": ["Sources", "Источники"],
  "note": ["Note", "Примечание"],
  "bydate": ["By date", "По дате"],
  "byts": ["By timestamp", "По созданию"],
  "select": ["Select", "Выбрать"],
  "seld": ["Selected", "Выбрано"],
  "medfile": ["Media file", "Медиафайл"],
  "confirm": ["Comfirm", "Подтвердить"],
  "uploadtip": ["File size is no more than 500kb", "Размер файла не больше 500кб"],
  "dragfile": ["Drag a file here", "Перетащите файл сюда"],
  "clickload": ["click to select", "нажмите, чтобы загрузить"],
  "selact": ["Select the activities", "Выберите виды деятельности"],
  "setts": ["Set approximate date and time", "Выставьте примерные дату и время"],
  "filldesc": ["Fill the description", "Заполните описание"],
  "pswd": ["Password", "Пароль"],
  "login": ["Log in", "Войти"],
  "firstname": ["Firstname", "Имя"],
  "lastname": ["Lastname", "Фамилия"],
  "patroname": ["Patronymic", "Отчество"],
  "sex": ["Gender", "Пол"],
  "man": ["Male", "Мужчина"],
  "wikidata": ["Wikidata ID", "Wikidata ID"],
  "woman": ["Female", "Женщина"],
  "disable": ["Disable", "Отключить"],
  "activate": ["Activate", "Активировать"],
  "email": ["E-mail", "Эл. почта"],
  "userpswd": ["Password for user", "Пароль для пользователя"],
  "mainperson": ["Main person", "Основная персона"],
  "projtitle": ["Project title", "Название проекта"],
  "subreq": ["Submit a request", "Отправить заявку"],
  "subreqd": ["Request is submitted", "Заявка отправлена"],
  "regmsg": ["After a moderator approves your request, you will get access to the data management interface with this password", "После одобрения заявки модератором Вы получите доступ к интерфейсу редактирования по паролю"],
  "quotmarks": ["Quotation marks", "Кавычки"],
  "pages": ["Pages", "Страницы"],
  "heading": ["Heading", "Заглавие"],
  "fin": ["End", "Финаль"],
  "info": ["Information", "Сведения"],
  "record": ["Record", "Запись"],
  "cit": ["Citation", "Цитата"],
  "edit": ["Edit", "Редактировать"],
  "bib": ["Bibliographical records", "Библиографические записи"],
  "pdot": ["Pp.", "С."],
  "ttldsc": ["Descriptive title", "Название-описание"],
  "administrator": ["Administrator", "Администратор"],
  "moderator": ["Moderator", "Модератор"],
  "editor": ["Editor", "Редактор"],
  "language": ["Language", "Язык"],
};

const state = reactive({
  token: localStorage.getItem('token') || '',
  user: {},
  error: "",
});

const loc = (id:string) => {
  return id ?
      localDict?.[id] ?
      localDict[id][(<any>state)?.user?.settings?.lang as any || 0 ] : id
    : "...";
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
       // console.log(response);
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
      // console.log(response.data);
      return response;
   } catch (error) {
     console.log("Cannot get", error);
     return error;
   }
 } else {
   try {
     const response = await axios.post('/api/user/reg', data);
     // console.log(response.data);
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
      // console.log(`POST ${table}`);
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

const getDataMulti = async (datum: objOptions, rules: objOptions, sorts: objOptions) =>{
  const tables = Object.keys(datum);
  return (await Promise.all(tables.map(t => getData(t)))).map((x,i) => {
    if (rules?.[tables[i]]) {
      const prop = rules[tables[i]];
      Object.assign(datum[tables[i]], x?.data.reduce((x:any, y:any) => {
          return { ...x, [y[prop]]: y };
        }, {})
      );
    }else {
      if (sorts?.[tables[i]]) {
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

const classify = (x:keyable) => {
  const key = x.data1 && Object.keys(x.data1).length ?
     x.data0 && Object.keys(x.data0).length ? 'change' : 'removal'
     : 'removal';
    return loc(key);
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
  privs,
  getDataMulti,
  langs: localLanguages,
  loc,
};
