import { JSONSchemaType, Schema } from 'ajv';
import express, { Request, Response, NextFunction } from 'express';
import 'reflect-metadata'
import validate from './schemaValidator';
import { sendErrorResponse } from './utils';


type Middleware = (req: Request, res: Response, next: NextFunction) => any;

interface RouteOptions<T> {

  middleware?: Middleware | Middleware[];

  schema?: JSONSchemaType<T>;

}

export const router = express.Router();

export function Controller(path: string) {

  return function <T extends { new(...args: any[]): {} }>(constructor: T) {

    const instance = new constructor();

    for (const key of Object.getOwnPropertyNames(constructor.prototype)) {

      const route = Reflect.getMetadata('route', constructor.prototype, key);

      const method = Reflect.getMetadata('method', constructor.prototype, key);

      const middleware = Reflect.getMetadata('middleware', constructor.prototype, key) || [];

      const schema = Reflect.getMetadata('schema', constructor.prototype, key);

      if (route && method) {
        const routePath = `${path}${route}`;
        Reflect.defineMetadata('route',routePath,constructor.prototype,key);

        router[method](routePath, middleware, async (req: Request, res: Response, next: NextFunction) => {
          const contentType = req.headers['content-type']?.includes('application/json')
          if (schema ) {

            let body: any = {};

            if (method === 'get' || method === 'delete') {

              body = req.query

            }

            if ((method === 'post' || method === 'put') && contentType ) {

              body = req.body;

            }
            
            const validation = validate(schema, body);

            if (validation !== true) {

              sendErrorResponse(400, validation as object, res)

              return;

            }

          }
          try {

            await instance[key](req, res, next);

          } catch (err) {

            sendErrorResponse(500, 'Internal Server Error', res)

          }

        });

      }

    }


  }
}

function createMethodDecorator<T>(method: string, path: string, options?: RouteOptions<T>) {

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {

    Reflect.defineMetadata('route', path, target, propertyKey);

    Reflect.defineMetadata('method', method, target, propertyKey);

    if (options?.middleware) {

      const middlewareArray = Array.isArray(options.middleware) ? options.middleware : [options.middleware];

      Reflect.defineMetadata('middleware', middlewareArray, target, propertyKey);

    }

    if (options?.schema) {

      Reflect.defineMetadata('schema', options.schema, target, propertyKey);

    }

    return descriptor;
  }

}


export const Get = <T>(path: string, options?: RouteOptions<T>) => createMethodDecorator<T>('get', path, options);

export const Post = <T>(path: string, options?: RouteOptions<T>) => createMethodDecorator<T>('post', path, options);

export const Put = <T>(path: string, options?: RouteOptions<T>) => createMethodDecorator<T>('put', path, options);

export const Patch = <T>(path: string, options?: RouteOptions<T>) => createMethodDecorator<T>('patch', path, options);

export const Delete = <T>(path: string, options?: RouteOptions<T>) => createMethodDecorator<T>('delete', path, options);
