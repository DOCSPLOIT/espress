import Ajv, { JSONSchemaType, Schema, _ } from 'ajv';
import addFormats from 'ajv-formats';

/**
 *
 * @param schema AJV schema
 * @param data any data to validate
 * @returns true if data is valid, ErrorObject otherwise
 * ####  consider to use like this:
 * ```javascript
 *  const validation = validate(schema, data);
 * if(validation==true) {}else ....
 * ```
 */
export default function validate<T>(
  schema: Schema,
  data: T,
):
  | boolean
  | {
      message: string | undefined;
      error: { key: string; errors: Record<string, any> };
    } {
  const ajv = addFormats(new Ajv());

  const compiler = ajv.compile<T>(schema);
  if (compiler(data)) {
    return compiler(data);
  } else {
    if (compiler.errors) {
      const message = compiler.errors[0].message?.toLocaleUpperCase();

      return {
        message,
        error: {
          key: compiler.errors[0].instancePath,
          errors: compiler.errors[0].params,
        },
      };
    }
    return false;
  }
}
