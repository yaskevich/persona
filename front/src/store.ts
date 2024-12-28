import { reactive } from 'vue';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import project from '../package.json';
import i18n from './i18n.json';
import router from './router';

const privs = {
  1: 'administrator',
  3: 'editor',
  5: 'contributor',
  7: 'viewer',
} as keyable;
// const privs = [
//   { id: 1, name: 'administrator' },
//   { id: 3, name: 'moderator' },
//   { id: 5, name: 'editor' },
// ];

const localLanguages: Array<string> = i18n.languages;
const localDict: objTexts = i18n.dictionary;

const state = reactive({
  token: localStorage.getItem('token') || '',
  user: {}, // { server: 0, commit: 0 }
  error: '',
} as IState);

const loc = (id: string) => {
  return id ? (localDict?.[id] ? localDict[id][((<any>state)?.user?.settings?.lang as any) || 0] : id) : '...';
};

const getHumanReadablePrivs = (id: number) => {
  const name = privs?.[String(id)];
  return loc(name || 'unknown');
};

const logoutUser = () => {
  delete state.token;
  delete state.user;
  localStorage.removeItem('token');
  router.replace('/');
  console.log('logout');
};

const getUser = async () => {
  if (state.token) {
    try {
      const config = { headers: { Authorization: 'Bearer ' + state.token } };
      const response = await axios.get('/api/user/info', config);
      state.user = response.data;
      // console.log('get user', state.user);
    } catch (error: any | AxiosError) {
      console.log('Cannot get user', error);
      if (error.response?.status === 401) {
        console.log('access denied!');
        logoutUser();
      }
      return error;
    }
  } else {
    logoutUser();
  }
};

const doLogin = async (payload: Object): Promise<any> => {
  // if (!state.token) {
  try {
    const response = await axios.post('/api/user/login', payload);
    if ('data' in response && 'id' in response.data) {
      state.user = response.data;
      state.token = response.data.token || '';
      if (state?.token) {
        localStorage.setItem('token', state.token);
      }
    } else {
      // console.log(response);
      return response.data.error;
    }
    return;
  } catch (error) {
    console.log('Cannot log in', error);
    return error;
  }
  // }
  // console.log("No query: token exists.");
};

const initUser = async (data: Object): Promise<any> => {
  if (state.token) {
    try {
      const config = { headers: { Authorization: 'Bearer ' + state.token } };
      const response = await axios.post('/api/user/add', data, config);
      // console.log(response.data);
      return response;
    } catch (error) {
      console.log('Cannot get', error);
      return error;
    }
  } else {
    try {
      const response = await axios.post('/api/user/reg', data);
      // console.log(response.data);
      return response;
    } catch (error) {
      console.log('Cannot get', error);
      return error;
    }
  }
};

const postData = async (table: string, data: Object): Promise<any> => {
  if (state.token) {
    try {
      const config = { headers: { Authorization: 'Bearer ' + state.token } };
      // console.log(`POST ${table}`);
      const response = await axios.post('/api/' + table, data, config);
      console.log('store:response', response.data);
      return response;
    } catch (error) {
      console.log('Cannot get', error);
      return error;
    }
  }
  console.log('No token. Fail.');
};

const deleteById = async (table: string, id: string | number): Promise<any> => {
  if (state.token) {
    try {
      const config = { headers: { Authorization: 'Bearer ' + state.token }, params: {} };
      // if(id) { config["params"] = { id: id }; }
      console.log('delete query', table, id);
      const response = await axios.delete('/api/' + table + '/' + id, config);
      console.log(response.data);
      return response;
    } catch (error) {
      console.log('Cannot delete', error);
      return error;
    }
  }
  console.log('No token. Fail.');
};

const deleteRelation = async (data: IRelship): Promise<any> => {
  if (state.token) {
    try {
      const config = { headers: { Authorization: 'Bearer ' + state.token }, params: { ...data } };
      // if(id) { config["params"] = { id: id }; }
      const response = await axios.delete('/api/relations', config);
      console.log(response.data);
      return response;
    } catch (error) {
      console.log('Cannot delete', error);
      return error;
    }
  }
  console.log('No token. Fail.');
};
const getData = async (table: string, prop?: string | number | Object, pager?: Array<number>): Promise<any> => {
  if (state.token) {
    try {
      const config = { headers: { Authorization: 'Bearer ' + state.token }, params: {} };
      if (prop) {
        if (typeof prop === 'number' || typeof prop === 'string') {
          config['params'] = { id: prop };
        } else if (typeof prop === 'object') {
          config['params'] = prop;
        }
      }
      if (pager && pager.length) {
        config['params'] = {
          off: pager[0] || 0,
          lim: pager[1] || 100,
        };
      }
      // console.log(`GET ${table}`);
      const response = await axios.get('/api/' + table, config);
      // console.log(response.data);
      return response;
    } catch (error) {
      console.log('Cannot get', error);
      return error;
    }
  }
  console.log('No token. Fail.');
};

const getDataMulti = async (datum: any, rules: objOptions, sorts: objOptions, pager?: objPager) => {
  const tables = Object.keys(datum);
  return (await Promise.all(tables.map(t => getData(t, undefined, pager?.[t] as any)))).map((x, i) => {
    if (rules?.[tables[i]]) {
      const prop = rules[tables[i]];
      Object.assign(
        datum[tables[i]],
        x?.data.reduce((x: any, y: any) => {
          return { ...x, [y[prop]]: y };
        }, {})
      );
    } else {
      if (sorts?.[tables[i]]) {
        const prop = sorts[tables[i]];
        Object.assign(
          datum[tables[i]],
          x?.data.sort((a: any, b: any) => b[prop] - a[prop])
        );
      } else {
        Object.assign(datum[tables[i]], x?.data);
      }
    }
  });
  // .map((x,i) => ({ [tables[i]] : x?.data}));
};

const nest = (xx: any, id = null, y = 'parent') =>
  xx.filter((x: any) => x[y] === id).map((x: any) => ({ ...x, ...leaf(xx, x.id) }));
const leaf = (a: any, b: any): Object => {
  const res = nest(a, b);
  return res.length ? { children: res } : {};
};

const classify = (x: keyable) => {
  const x0 = Boolean(x.data0 && Object.keys(x.data0).length);
  const x1 = Boolean(x.data1 && Object.keys(x.data1).length);
  return x0 && x1 ? 'change' : x1 ? 'creation' : 'removal';
};

const curlify = (str: string) =>
  str
    .replace(/\x27/g, '\x22')
    .replace(/(\w)\x22(\w)/g, '$1\x27$2')
    .replace(/(^)\x22(\s)/g, '$1»$2')
    .replace(/(^|\s|\()"/g, '$1«')
    .replace(/"(;|!|\?|:|\.|,|$|\)|\s)/g, '»$1');

const dateToString = (x: string) => {
  const dt = new Date(x);
  return dt.toLocaleString('ru-RU');
};

const dateDropTimeZone = (x: Date) => {
  const dt = new Date(x);
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
  return dt.toISOString();
};

const getLabel = (x: IPerson | IUser, isNoted = false) =>
  (x?.rendername ? x.rendername : x?.firstname + ' ' + x?.lastname) + (isNoted && x?.note ? ' ⸱ ' + x.note : '');

const renderRelations = (datum: IRelation, flipStatus = false) =>
  `${flipStatus ? datum.name2 : datum.name1} ${datum.bilateral ? '⟺' : '⟹'} ${flipStatus ? datum.name1 : datum.name2}`;

export default {
  deleteRelation,
  renderRelations,
  dateDropTimeZone,
  nest,
  classify,
  curlify,
  dateToString,
  logoutUser,
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
  getHumanReadablePrivs,
  getLabel,
};
