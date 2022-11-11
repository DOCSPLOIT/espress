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
const server = new Server({ limit: '100mb', cors: [] }, modules, 'Project Name');
server.run();
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

Server by default runs at port 5000 if no $PORT provided.
Automated documentation is available based on the modules.
`http://localhost:5000/api/docs`
**Note : module methods' name is considered to be api route name. So define method name precisely.**

## API

### `class` Server

```js
const server = new Server({}, modules, 'Project');
```

Main class. express instance is initialized when it is constructed.

#### Params

| parameter |       type        |              usage              | required |       default        |
| :-------: | :---------------: | :-----------------------------: | :------: | :------------------: |
|   limit   |      string       |    To set limit on JSON data    |  false   |       '100mb'        |
|  \_cors   |    CorsOptions    |       To set CORS options       |  false   | default CORS options |
|  modules  | EspressModuleFile | To register initialized modules |   true   |          -           |
|   name    |      string       |   To set project name is docs   |   true   |          -           |

#### properties

Sometimes we need handle directly through express. For this facility our `Server` instance will have properties `express` and `app` as per the conventional usage.

```js
const server = new Server({}, modules, 'Project');
server.express; // express module
server.app; // app= express()
server.run(); // TO run server
```

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

**_Note_** _Schema validations do not work with FormData requests due to incompatibility_

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

| parameter |   type   |          usage          | required | default |
| :-------: | :------: | :---------------------: | :------: | :-----: |
|  keyName  |  string  | request-body identifier |   true   |    -    |
|   path    |  string  |    file storing path    |   true   |    -    |
| mimeType  | string[] |        file type        |   true   |    -    |

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

## Static file

To make a folder static add its path in `.espressive` to enable them

```json
{
  "framework": {
    "version": "1.0.11",
    "assets": [
      "/static"
      // add new path
    ]
  }
}
```

by default `/static` folder and 404.html file is created when initializing project with **espress**.

- Files in `/static` folder can be access through root path
- rest of the static folders can be accessed through the same name passed in .espress file.

## API Documentation

This modules main focus is to autocreate documentation while developing apis. If schema and response details are passed to decorators accordingly successful documentation can be generated.
To view documentation use `/api/docs` api (Do not try to addd another api with same name it is reserved).

## Authors

- **Robert Devasia** - _Initial work_ - [DOCSPLOIT](https://github.com/docsploit)

See also the list of [contributors](https://github.com/docsploit/espress/contributors) who participated in this project.
