import { JSONSchemaType } from 'ajv';
import { Request, Response } from 'express';
import { sendErrorResponse } from './utils';
import validate from './validator';

export function GET<T>(
  pathname: string,
  middleware: any[] = [],
  schema?: JSONSchemaType<T>,
  responses?: ApiResponses,
  example?: string,
) {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const response = async (req: Request, res: Response) => {
      try {
        if (schema !== undefined && Object.keys(req.query).length > 0) {
          const valid = validate(schema, req.query);
          if (valid === true) {
            return await descriptor.value(req, res);
          } else {
            return sendErrorResponse(400, { ...valid }, res);
          }
        } else return await descriptor.value(req, res);
      } catch (error) {
        return sendErrorResponse(500, 'Internal Server Error', res);
      }
    };
    target[`GET-${propertyKey.toString()}`] = { pathname, middleware, response, schema, responses, example };
  };
}

export function POST<T>(
  pathname: string,
  middleware: any[] = [],
  schema?: JSONSchemaType<T>,
  responses?: ApiResponses,
  example?: string,
) {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const response = async (req: Request, res: Response) => {
      try {
        if (schema !== undefined) {
          const valid = validate(schema, req.body);
          if (valid === true) {
            return await descriptor.value(req, res);
          } else {
            return sendErrorResponse(400, { ...valid }, res);
          }
        } else return await descriptor.value(req, res);
      } catch (error) {
        return sendErrorResponse(500, 'Internal Server Error', res);
      }
    };
    target[`POST-${propertyKey.toString()}`] = { pathname, middleware, response, schema, responses, example };
  };
}

export function PUT<T>(
  pathname: string,
  middleware: any[] = [],
  schema?: JSONSchemaType<T>,
  responses?: ApiResponses,
  example?: string,
) {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const response = async (req: Request, res: Response) => {
      try {
        if (schema !== undefined) {
          const valid = validate(schema, req.body);
          if (valid === true) {
            return await descriptor.value(req, res);
          } else {
            return sendErrorResponse(400, { ...valid }, res);
          }
        } else return await descriptor.value(req, res);
      } catch (error) {
        return sendErrorResponse(500, 'Internal Server Error', res);
      }
    };
    target[`PUT-${propertyKey.toString()}`] = { pathname, middleware, response, schema, responses, example };
  };
}

export function DELETE(pathname: string, middleware: any[] = [], responses?: ApiResponses, example?: string) {
  return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    const response = async (req: Request, res: Response) => {
      try {
        return await descriptor.value(req, res);
      } catch (error) {
        return sendErrorResponse(500, 'Internal Server Error', res);
      }
    };
    target[`DELETE-${propertyKey.toString()}`] = { pathname, middleware, response, responses, example };
  };
}

interface ApiResponse {
  status: number;
  response: { message: string; data?: any };
  reason: string;
}
type ApiResponses = ApiResponse[];
