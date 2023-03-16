# Express JS Boilerplate

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

const server = new Server('Project Name',<options>);

server.run();
```

- module.controller.ts

```ts
import { Controller, Req, Res, GET, POST } from '@docsploit/router';

import AuthModel from './auth.model';

const authSchema={
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
  }
/**
 *
 * @name Auth
 * 
 * @desc Authentication module
 * 
 *  
 */
@Controller('/auth')
export default class Auth {
  /**
    * @name Login
    * 
    * @desc Login users using username and password
    * 
    * @response 500="Internal Server Error",400="Bad Request",455="Bad Gateway"
    * 
    */
  @POST<AuthModel>('/',{schema:authSchema,middleware:[]})
  async login(req: Req, res: Res) {...}

}
```

Server by default runs at port 5000 if it is not provided.


## API

### `class` Server

```js
const server = new Server({}, modules, 'Project');
```

Main class. express instance is initialized when it is constructed.

#### Params

| parameter |       type        |              usage              | required |       default        |
| :-------: | :---------------: | :-----------------------------: | :------: | :------------------: |
|   name   |      string       |    Project Name    |  true   |       -        |
|  props   |    ServerOptions    |       To set CORS and JSON options       |  false   | default CORS and JSON options |


#### properties

For deep handling `Server` instance initialize properties `express` and `app`.

```js
const server = new Server({}, modules, 'Project');
server.express; // express module
server.app; // app= express()
server.run(); // TO run server
```

### `decorator` Controller

```ts
@Controller(path)
class User {}
```

Controller decorator is needed, in order to work the method decorators. Every modules should be decorated using `Controller` which has a parameter path which act as base route

### `decorator` Get,Post,Put,Delete,Patch

```ts
@Controller('/user')
class User{
    @GET('/all')
    getAll(req:Req,res:Res){

    }
}
```
In this example the generated route will be `/api/<version>/user/all`

#### Params

|  parameter  |       type        |                 usage                 | required |  default  |
| :---------: | :---------------: | :-----------------------------------: | :------: | :-------: |
|    path     |      string       |              router path              |   true   |     -     |
| options |       RouteOptions       |     middleware and schema      |  false   |    undefined     |



**_Note_** _Schema validations do not work with FormData requests due to incompatibility_

### `method` register()

This function register the modules to express application.
```ts
import { Server } from '@docsploit/espress/core';
import ExampleController from './app/Example/Example.controller';


const server = new Server('Example', {});

server.register(ExampleController)

server.run({
    dev: true,
    versioning: true,
    version: 'v1',
    port: 3000
})

```

#### Params

| parameter  |    type     |        usage        | required | default |
| :--------: | :---------: | :-----------------: | :------: | :-----: |
|    controller    |   Class    | Controller  |   true   |    -    |

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
@GET('/',{middleware:[multerSingleField('profile','static/profiles','image/jpeg')]})
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
    import {validate} from '@docsploit/espress/schemaValidator'
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
    "version": "1.0.16",
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



## Authors

- **Robert Devasia** - _Initial work_ - [DOCSPLOIT](https://github.com/docsploit)

See also the list of [contributors](https://github.com/docsploit/espress/contributors) who participated in this project.
