[![npm version](https://badge.fury.io/js/angular2-expandable-list.svg)](https://badge.fury.io/js/angular2-expandable-list)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Espress Server

> Customized express.js application with additional functions

## Installation

To install and set up the library, run:

```sh
$ npm install -S @docsploit/espress
```

## Usage

- main.ts

```ts
import { Server } from '@docsploit/espress';
import modules from './app/modules';
const app = new Server({ limit: '100mb', cors: [] }, modules, 'Project Name');
```

- module.controller.ts

```ts
import { Controller, Req, Res } from '@docsploit/espress';
import { GET, POST } from '@docsploit/espress/build/methods';
import AuthModel from './auth.model';
@Controller
export default class Auth {
  @POST<AuthModel>('', [], {
    type: 'object',
    required: ['passowrd', 'username'],
    properties: {
      passowrd: {
        type: 'string',
      },
      username: {
        type: 'string',
      },
    },
  })
  login(req: Req, res: Res) {}
}
```

## API

### `class` Server

```js
const app = new Server({}, modules, 'Project');
```

Main class. express instance is initialized when it is constructed.

#### Params

| parameter |       type        |              usage              | required |       default        |
| :-------: | :---------------: | :-----------------------------: | :------: | :------------------: |
|   limit   |      string       |    To set limit on JSON data    |  false   |       '100mb'        |
|  \_cors   |    CorsOptions    |       To set CORS options       |  false   | default CORS options |
|  modules  | EspressModuleFile | To register initialized modules |   true   |          -           |
|   name    |      string       |   To set project name is docs   |   true   |          -           |

### `decorator` Controller

```ts
@Controller
class User {}
```

Controller decorator is needed for in order to work the method decorators. Every modules are under `Controller`

### `decorator` GET,POST,PUT,DELETE

```ts
@Controller
class User{
    @GET<Users>('/',[authorization()],{
        type:'object',
        properties:{
            name:{
                type:'string'
            }
        }
        required:['name']
    },[
        {status:500,response:{message:'Internal Server Error',reason:'Server Error'}},
        {status:400,response:{message:'Bad Request',reason:'Invalid data passed'}},
        {status:200,response:{message:'Success',reason:'Successful Request'}},
    ],'/api/user?name=Joe%20Doe')
    getAll(req:Req,res:Res){

    }
}
```

Decorated REST API Methods.

#### Params

|  parameter  |       type        |                 usage                 | required |  default  |
| :---------: | :---------------: | :-----------------------------------: | :------: | :-------: |
|    path     |      string       |              router path              |   true   |     -     |
| middlewares |       any[]       |     to apply middleware to route      |  false   |    []     |
|   schema    | JSONSchemaType<T> |           AJV Schema usage            |  false   | undefined |
|  responses  |    ApiResponse    |  To show Responses in Documentation   |  false   | undefined |
|   example   |      string       | To show example data in Documentation |  false   | undefined |

### `method` register()

This function register the modules to express application. A table in console will appear with data if any module is registered.

```ts
import register from '@docsploit/espress';
import User from './app/user/user.controller';

register('/user', User);

export default this;
```

#### Params

| parameter  |    type     |        usage        | required | default |
| :--------: | :---------: | :-----------------: | :------: | :-----: |
|    path    |   string    | parent router path  |   true   |    -    |
| controller | Constructor | register controller |   true   |    -    |

## - Utilities

### `method` sendErrorResponse() and sendSuccessResponse

```ts
import { sendErrorResponse, sendSuccessResponse } from '@docsploit/espress/utils';

if (true) {
  return sendSuccessResponse('success', data, res);
} else {
  return sendErrorResponse(400, 'Invalid Data', res);
}
```

These functions are the wrappers for different responses.

#### Params

|   parameter    |   type   |           usage            | required |  default  |
| :------------: | :------: | :------------------------: | :------: | :-------: |
| status (Error) |  number  | send status code to client |   true   |     -     |
|    message     |  string  |      response message      |   true   |     -     |
| data (Success) |   any    |       response data        |  false   | undefined |
|      res       | Response |  express response Object   |   true   |     -     |

## - File Handler

Predefined multer middleware for handling files in indigenous way

### `method` multerSingleHandler () and multerMultiFieldHandler()

```ts
@GET('/',[multerSingleField('profile','static/profiles','image/jpeg')])
uploadImage(req:Req,res:res){
    const image = req.body.profile;
    ...
```

#### Params

| parameter |  type  |          usage          | required | default |
| :-------: | :----: | :---------------------: | :------: | :-----: |
|  keyName  | string | request-body identifier |   true   |    -    |
|   path    | string |    file storing path    |   true   |    -    |
| mimeType  | string |        file type        |   true   |    -    |

### `method` validate()

```ts
    import {validate} from '@docsploit/espress/validator'
    ...
    const data = req.body;
    const schema ={...}
    const valid = validate(schema,req.body)
```

AJV validator wrapper. By default method decorator have this validation functions.But that will work only if the schema is provided.

#### Params

| parameter |      type      |    usage     | required | default |
| :-------: | :------------: | :----------: | :------: | :-----: |
|  schema   | JSONSchemaType |  ajv schema  |   true   |    -    |
|   body    |     Object     | request data |   true   |    -    |

## Authors

- **Robert Devasia** - _Initial work_ - [DOCSPLOIT](https://github.com/docsploit)

See also the list of [contributors](https://github.com/docsploit/espress/contributors) who participated in this project.
