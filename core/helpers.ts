import { JSONSchemaType, Schema } from 'ajv';
import express from 'express';
import { readFileSync } from 'fs';
import path from 'path';

export function setStaticPaths(app: express.Express) {
  const projectPath = path.join(process.cwd(), '.espressive');

  const fileBuffer = readFileSync(projectPath).toString('utf-8');

  const espressObject = JSON.parse(fileBuffer);

  for (let staticPath of espressObject.framework.assets) {
    if (staticPath === '/static') {
      app.use(express.static(path.join(process.cwd(), staticPath)));
    } else {
      app.use(staticPath, express.static(path.join(process.cwd(), staticPath)));
    }
  }
}

export function filterSchema(schema, parentName = '') {
  const result: any = [];

  if (schema.type === 'array') {
    const itemSchema = schema.items;
    const items = [filterSchema(itemSchema, parentName)];

    result.push(...items);
  }

  if (schema.type === 'object') {
    for (const prop in schema.properties) {
      const propName = parentName ? `${parentName}.${prop}` : prop;
      const propSchema = schema.properties[prop];

      if (propSchema.type === 'array') {
        const itemSchema = propSchema.items;

        const items = filterSchema(itemSchema, propName);
        result.push(...items);
      }

      if (propSchema.type === 'object') {
        const obj = filterSchema(propSchema, propName);
        result.push(...obj);
      } else {
        const obj = {
          property: propName,
          isRequired: schema.required ? schema.required.includes(prop) : false,
          type: propSchema.type,
          format: propSchema.format ?? '-',
        };
        result.push(obj);
      }
    }
  }

  // if (parentName === '' && result.length > 1) {
  //   // If the root schema object has more than one property,
  //   // wrap the result in an array to match the output format
  //   return [result];
  // }

  return result;
}
