import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, Router } from 'express';

import { bold, blueBright, magenta, green, yellow, red, white } from 'chalk';
import morgan from 'morgan';
import cors, { CorsOptions } from 'cors';
import Table from 'cli-table';
import path from 'path';
import { JSONSchemaType } from 'ajv';
import { readFileSync } from 'fs';
export class Server {
  app = express();
  express = express

  constructor({ limit, _cors }: { limit?: string; _cors?: CorsOptions }, modules: undefined, name: string) {
    this.app.use(express.json({ limit }));
    this.app.use(morgan('combined'));
    this.app.use(cors(_cors));
    this.app.set('views', path.join(__dirname, './views'));
    this.app.set('view engine', 'ejs' as any);

    this.app.use('/static', express.static(path.join(__dirname, 'static')));
    this.app.get('/api/docs', (req, res) => {
      const firstModule = _modules[0];
      res.redirect(`/api/docs/${firstModule.name.toLowerCase()}`);
    });
    this.app.get('/api/docs/:module', (req, res) => {
      const moduleName = req.params.module;
      const resp: Partial<ModuleObject<{ property: string; type: string; isRequired: boolean }[]>> = {};
      const espressModules: any[] = [];
      for (const data of _modules) {
        espressModules.push(data.name);
        if (data.name.toLocaleLowerCase() === moduleName) {
          resp.name = data.name;
          resp.routers = [];
          const routerData = data.routers;
          for (const routerDatum of routerData) {
            const routerObje: any = {
              path: routerDatum.path,
              method: routerDatum.method,
              schema: [] as any,
              name: routerDatum.name,
              responses: routerDatum.responses ?? [],
              example: routerDatum.example ?? 'No example provided',
            };
            if (routerDatum.schema !== undefined) {
              routerObje.bodyType = routerDatum.schema.type;

              const properties = Object.keys(routerDatum.schema.properties);
              for (const prop of properties) {
                const Obj: Partial<{ property: string; isRequired: boolean; type: string; format: string }> = {
                  property: prop,
                  isRequired: routerDatum.schema.required.includes(prop),
                  type: routerDatum.schema.properties[prop].type,
                  format: routerDatum.schema.properties[prop].format ?? '-',
                };
                routerObje.schema.push(Obj);
              }
            }
            resp.routers?.push(routerObje);
          }
        }
      }
      res.render('index', { modules: espressModules.reverse(), data: resp, name });
    });


    // Settings up static path
    const projectPath = path.join(process.cwd(), '.espressive');
    const json = JSON.parse(readFileSync(projectPath).toString('utf-8'))
    for (let _folderPath of json.framework.assets) {
      this.app.use(express.static(path.join(process.cwd(), _folderPath)))
    }

  }

  setStaticFolder(path = '', folderPath: string) {
    this.app.set(path, express.static(folderPath))
  }
  run() {
    const port = process.env.PORT || 5000;
    this.app.use('/api', router);
    this.app.listen(port, () => {
      console.log(bold`Express server is running on`, blueBright('http://localhost:' + port));
    });
  }

}

export function register(_path: string, controller: InstanceType<any>) {
  const table = new Table({
    head: ['Method', 'Router'],
    chars: {
      top: '═',
      'top-mid': '╤',
      'top-left': '╔',
      'top-right': '╗',
      bottom: '═',
      'bottom-mid': '╧',
      'bottom-left': '╚',
      'bottom-right': '╝',
      left: '║',
      'left-mid': '╟',
      mid: '─',
      'mid-mid': '┼',
      right: '║',
      'right-mid': '╢',
      middle: '│',
    },
    colAligns: ['middle'],
    colWidths: [10, 50],
    style: { head: ['white'] },
  });
  let method: any;
  const _Table = new Table({
    head: [controller.name],
    colWidths: [61],
    colAligns: ['middle'],
    style: { head: ['bgWhite'] },
  });
  console.log(_Table.toString());

  controller.prototype.router.stack.forEach((t: any) => {
    if (t.route) {
      const ePath = '/' + _path.replace('/', '') + t.route.path || '/';
      switch (Object.keys(t.route.methods)[0].toUpperCase()) {
        case 'POST':
          method = [magenta('POST'), ePath];
          break;
        case 'GET':
          method = [green('GET'), ePath];
          break;
        case 'PUT':
          method = [yellow('PUT'), ePath];
          break;
        case 'DELETE':
          method = [red('DELETE'), ePath];
          break;
        default:
          method = [white('UNKNOWN'), ePath];
      }
      table.push(method);
    }
  });
  router.use(_path, controller.prototype.router);
  console.log(table.toString());
}

export function Controller(constructor: any) {
  constructor.prototype.router = Router();
  const properties = Object.getOwnPropertyNames(constructor.prototype);
  const schemeObject: ModuleObject<JSONSchemaType<any>> = {
    name: constructor.name,
    routers: [],
  };
  for (const key of properties) {
    if (key.match(/GET-.*([A-Za-z0-9])/g)) {
      const obj = constructor.prototype[key];
      let modifiedKeyName = key;
      modifiedKeyName = modifiedKeyName.replace('GET-', '');
      schemeObject.routers.push({
        path: 'api/' + `${constructor.name.toLowerCase()}` + obj.pathname || '/',
        schema: obj.schema,
        method: 'GET',
        responses: obj.responses,
        example: obj.example,
        name:
          modifiedKeyName.split(/(?=[A-Z])/).length > 1
            ? modifiedKeyName.split(/(?=[A-Z])/)[1]
            : capitalizeFirstLetter(modifiedKeyName),
      });
      constructor.prototype.router.get(obj.pathname || '', ...obj.middleware, obj.response);
    }
    if (key.match(/POST-.*([A-Za-z0-9])/g)) {
      const obj = constructor.prototype[key];
      let modifiedKeyName = key;
      modifiedKeyName = modifiedKeyName.replace('POST-', '');
      schemeObject.routers.push({
        path: 'api/' + `${constructor.name.toLowerCase()}` + obj.pathname || '/',
        schema: obj.schema,
        method: 'POST',
        responses: obj.responses,
        example: obj.example,
        name:
          modifiedKeyName.split(/(?=[A-Z])/).length > 1
            ? modifiedKeyName.split(/(?=[A-Z])/)[1]
            : capitalizeFirstLetter(modifiedKeyName),
      });
      constructor.prototype.router.post(obj.pathname || '', ...obj.middleware, obj.response);
    }
    if (key.match(/PUT-.*([A-Za-z0-9])/g)) {
      const obj = constructor.prototype[key];
      let modifiedKeyName = key;
      modifiedKeyName = modifiedKeyName.replace('PUT-', '');
      schemeObject.routers.push({
        path: 'api/' + `${constructor.name.toLowerCase()}` + obj.pathname || '/',
        schema: obj.schema,
        method: 'PUT',
        responses: obj.responses,
        example: obj.example,
        name:
          modifiedKeyName.split(/(?=[A-Z])/).length > 1
            ? modifiedKeyName.split(/(?=[A-Z])/)[1]
            : capitalizeFirstLetter(modifiedKeyName),
      });
      constructor.prototype.router.put(obj.pathname || '', ...obj.middleware, obj.response);
    }
    if (key.match(/DELETE-.*([A-Za-z0-9])/g)) {
      const obj = constructor.prototype[key];
      let modifiedKeyName = key;
      modifiedKeyName = modifiedKeyName.replace('DELETE-', '');
      schemeObject.routers.push({
        path: 'api/' + `${constructor.name.toLowerCase()}` + obj.pathname || '/',
        schema: obj.schema,
        responses: obj.responses,
        example: obj.example,
        method: 'DELETE',
        name:
          modifiedKeyName.split(/(?=[A-Z])/).length > 1
            ? modifiedKeyName.split(/(?=[A-Z])/)[1]
            : capitalizeFirstLetter(modifiedKeyName),
      });
      constructor.prototype.router.delete(obj.pathname || '', ...obj.middleware, obj.response);
    }
  }
  _modules.push(schemeObject);
}

export const _modules: ModuleObject<JSONSchemaType<any>>[] = [];

export const router = Router();

export type Req = Request;

export type Res = Response;

interface ModuleObject<T> {
  name: string;
  routers: { path: string; schema: T; method: string; name?: string; responses: any; example: any }[];
}
function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
